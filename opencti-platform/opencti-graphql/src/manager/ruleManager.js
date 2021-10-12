/* eslint-disable camelcase */
import * as R from 'ramda';
import { buildDeleteEvent, buildEvent, buildScanEvent, createStreamProcessor, lockResource } from '../database/redis';
import conf, { ENABLED_RULE_ENGINE, logApp } from '../config/conf';
import {
  connectionLoaders,
  createEntity,
  internalLoadById,
  listAllRelations,
  patchAttribute,
  stixDataById,
  stixLoadById,
} from '../database/middleware';
import { isEmptyField, isNotEmptyField, READ_DATA_INDICES } from '../database/utils';
import { EVENT_TYPE_CREATE, EVENT_TYPE_DELETE, EVENT_TYPE_MERGE, EVENT_TYPE_UPDATE } from '../database/amqp';
import { elList } from '../database/elasticSearch';
import { ABSTRACT_STIX_RELATIONSHIP, RULE_PREFIX } from '../schema/general';
import { ENTITY_TYPE_RULE, ENTITY_TYPE_RULE_MANAGER } from '../schema/internalObject';
import { TYPE_LOCK_ERROR, UnsupportedError } from '../config/errors';
import { createRuleTask, deleteTask, findAll } from '../domain/task';
import { getActivatedRules, getRule } from '../domain/rule';
import { RULE_MANAGER_USER, RULES_DECLARATION } from '../rules/rules';
import { MIN_LIVE_STREAM_EVENT_VERSION } from '../graphql/sseMiddleware';
import { generateInternalType, getParentTypes } from '../schema/schemaUtils';
import { extractFieldsOfPatch, rebuildInstanceBeforePatch } from '../utils/patch';

let activatedRules = [];
const RULE_ENGINE_ID = 'rule_engine_settings';
const RULE_ENGINE_KEY = conf.get('rule_engine:lock_key');
const STATUS_WRITE_RANGE = conf.get('rule_engine:status_writing_delay') || 500;

export const getManagerInfo = async (user) => {
  const ruleStatus = await internalLoadById(user, RULE_ENGINE_ID);
  return { activated: ENABLED_RULE_ENGINE, ...ruleStatus };
};

export const setRuleActivation = async (user, ruleId, active) => {
  const resolvedRule = await getRule(ruleId);
  if (isEmptyField(resolvedRule)) {
    throw UnsupportedError(`Cant ${active ? 'enable' : 'disable'} undefined rule ${ruleId}`);
  }
  // Update the rule
  await createEntity(user, { internal_id: ruleId, active, update: true }, ENTITY_TYPE_RULE);
  // Refresh the activated rules
  activatedRules = await getActivatedRules();
  if (ENABLED_RULE_ENGINE) {
    const tasksFilters = [
      { key: 'type', values: ['RULE'] },
      { key: 'rule', values: [ruleId] },
    ];
    const tasks = await findAll(user, { filters: tasksFilters, connectionFormat: false });
    await Promise.all(tasks.map((t) => deleteTask(user, t.id)));
    await createRuleTask(user, { rule: ruleId, enable: active });
  }
  return getRule(ruleId);
};

const ruleMergeHandler = async (event) => {
  const { data, markings } = event;
  const events = [];
  const generateInternalDeleteEvent = (instance) => {
    const loaders = { stixLoadById, connectionLoaders };
    return buildDeleteEvent(RULE_MANAGER_USER, instance, [], loaders, { withoutMessage: true });
  };
  // region 01 - Generate events for deletion
  // -- sources
  const { x_opencti_context } = data;
  const sourceDeleteEventsPromise = x_opencti_context.sources.map((s) => {
    const instance = { ...s, standard_id: s.id, internal_id: s.x_opencti_id, entity_type: generateInternalType(s) };
    return generateInternalDeleteEvent(instance);
  });
  const sourceDeleteEvents = await Promise.all(sourceDeleteEventsPromise);
  events.push(...sourceDeleteEvents);
  // -- derived deletions
  const derivedDeleteEventsPromise = x_opencti_context.deletions.map((s) => {
    const instance = { ...s, standard_id: s.id, internal_id: s.x_opencti_id, entity_type: generateInternalType(s) };
    return generateInternalDeleteEvent(instance);
  });
  const derivedDeleteEvents = await Promise.all(derivedDeleteEventsPromise);
  events.push(...derivedDeleteEvents);
  // endregion
  // region 02 - Generate event for merged entity
  const updateEvent = buildEvent(EVENT_TYPE_UPDATE, RULE_MANAGER_USER, markings, '-', data);
  events.push(updateEvent);
  // endregion
  // region 03 - Generate events for shifted relations
  // We need to cleanup the element associated with this relation and then rescan it
  if (x_opencti_context.shifts.length > 0) {
    const shiftDeleteEventsPromise = x_opencti_context.shifts.map((s) => {
      const instance = { ...s, standard_id: s.id, internal_id: s.x_opencti_id, entity_type: generateInternalType(s) };
      return generateInternalDeleteEvent(instance);
    });
    const shiftDeleteEvents = await Promise.all(shiftDeleteEventsPromise);
    events.push(shiftDeleteEvents);
    // Then we need to generate event for redo rule on updated element
    const mergeCallback = async (relationships) => {
      const creationEvents = relationships.map((r) => buildScanEvent(RULE_MANAGER_USER, r));
      events.push(...creationEvents);
    };
    const ids = x_opencti_context.shifts.map((s) => s.x_opencti_id);
    const listToArgs = { ids, callback: mergeCallback };
    await listAllRelations(RULE_MANAGER_USER, ABSTRACT_STIX_RELATIONSHIP, listToArgs);
  }
  // endregion
  return events;
};

const isAttributesImpactDependencies = (rules, instance) => {
  const rulesAttributes = rules
    .map((r) => r.scopes ?? [])
    .flat()
    .map((s) => s.attributes)
    .flat()
    .filter((a) => a.dependency === true)
    .map((a) => a.name);
  const patchedAttributes = Object.entries(instance).map(([k]) => k);
  return patchedAttributes.some((f) => rulesAttributes.includes(f));
};
const isMatchRuleFilters = (rule, element, matchUpdateFields = false) => {
  // Handle types filtering
  const scopeFilters = rule.scopes ?? [];
  for (let index = 0; index < scopeFilters.length; index += 1) {
    const scopeFilter = scopeFilters[index];
    const { filters, attributes } = scopeFilter;
    const { types = [], fromTypes = [], toTypes = [] } = filters ?? {};
    let isValidFilter = true;
    if (types.length > 0) {
      const instanceType = element.x_opencti_type;
      const elementTypes = [instanceType, ...getParentTypes(instanceType)];
      const isCompatibleType = types.some((r) => elementTypes.includes(r));
      if (!isCompatibleType) isValidFilter = false;
    }
    if (fromTypes.length > 0) {
      const { source_ref: fromId, x_opencti_source_type: fromType } = element;
      if (fromId) {
        const instanceFromTypes = [fromType, ...getParentTypes(fromType)];
        const isCompatibleType = fromTypes.some((r) => instanceFromTypes.includes(r));
        if (!isCompatibleType) isValidFilter = false;
      } else {
        isValidFilter = false;
      }
    }
    if (toTypes.length > 0) {
      const { target_ref: toId, x_opencti_target_type: toType } = element;
      if (toId) {
        const instanceToTypes = [toType, ...getParentTypes(toType)];
        const isCompatibleType = toTypes.some((r) => instanceToTypes.includes(r));
        if (!isCompatibleType) isValidFilter = false;
      } else {
        isValidFilter = false;
      }
    }
    if (isValidFilter) {
      if (matchUpdateFields) {
        const patchedFields = extractFieldsOfPatch(element.x_opencti_patch);
        return attributes.map((a) => a.name).some((f) => patchedFields.includes(f));
      }
      return true;
    }
  }
  // No filter match, return false
  return false;
};

const handleRuleError = async (event, error) => {
  const { type } = event;
  logApp.error(`Error applying ${type} event rule`, { event, error });
};

export const rulesApplyDerivedEvents = async (eventId, derivedEvents, forRules = []) => {
  const events = derivedEvents.map((d) => ({ eventId, ...d }));
  // eslint-disable-next-line no-use-before-define
  await rulesApplyHandler(events, forRules);
};

const applyCleanupOnDependencyIds = async (eventId, deletionIds) => {
  const filters = [{ key: `${RULE_PREFIX}*.dependencies`, values: deletionIds, operator: 'wildcard' }];
  // eslint-disable-next-line no-use-before-define,prettier/prettier
  const callback = (elements) => {
    // eslint-disable-next-line no-use-before-define
    return rulesCleanHandler(eventId, elements, RULES_DECLARATION, deletionIds);
  };
  await elList(RULE_MANAGER_USER, READ_DATA_INDICES, { filters, callback });
};

export const rulesApplyHandler = async (events, forRules = []) => {
  if (isEmptyField(events) || events.length === 0) return;
  const rules = forRules.length > 0 ? forRules : activatedRules;
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    const { eventId, type, data, markings } = event;
    logApp.debug('[RULE] Processing event', { eventId });
    try {
      const element = { ...data, object_marking_refs: markings };
      // In case of merge convert the events to basic events and restart the process
      if (type === EVENT_TYPE_MERGE) {
        const derivedEvents = await ruleMergeHandler(event);
        await rulesApplyDerivedEvents(eventId, derivedEvents);
      }
      // In case of deletion, call clean on every impacted elements
      if (type === EVENT_TYPE_DELETE) {
        const contextDeletions = data.x_opencti_context.deletions.map((d) => d.x_opencti_id);
        const deletionIds = [data.x_opencti_id, ...contextDeletions];
        await applyCleanupOnDependencyIds(eventId, deletionIds);
      }
      // In case of update apply the event on every rules
      if (type === EVENT_TYPE_UPDATE) {
        // We need to clean elements that could be part of rule dependencies
        // Only interesting if rule depends of this patched attributes
        const previously = rebuildInstanceBeforePatch({}, element.x_opencti_patch);
        const isDependent = isAttributesImpactDependencies(rules, previously);
        if (isDependent) {
          const deletionIds = Object.entries(previously).map(([k, v]) => `${data.x_opencti_id}_${k}:${v}`);
          await applyCleanupOnDependencyIds(eventId, deletionIds);
        }
        // Dispatch update
        for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex += 1) {
          const rule = rules[ruleIndex];
          const isImpactedElement = isMatchRuleFilters(rule, element, true);
          if (isImpactedElement) {
            const stixData = await stixDataById(RULE_MANAGER_USER, element.id);
            const patchedFields = extractFieldsOfPatch(element.x_opencti_patch);
            const derivedEvents = await rule.update(stixData, patchedFields);
            await rulesApplyDerivedEvents(eventId, derivedEvents);
          }
        }
      }
      // In case of creation apply the event on every rules
      if (type === EVENT_TYPE_CREATE) {
        for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex += 1) {
          const rule = rules[ruleIndex];
          const isImpactedElement = isMatchRuleFilters(rule, element);
          if (isImpactedElement) {
            const derivedEvents = await rule.insert(element);
            await rulesApplyDerivedEvents(eventId, derivedEvents);
          }
        }
      }
    } catch (e) {
      await handleRuleError(event, e);
    }
  }
};

export const rulesCleanHandler = async (eventId, instances, rules, deletedDependencies = []) => {
  for (let i = 0; i < instances.length; i += 1) {
    const instance = instances[i];
    for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex += 1) {
      const rule = rules[ruleIndex];
      const isElementCleanable = isNotEmptyField(instance[RULE_PREFIX + rule.id]);
      if (isElementCleanable) {
        const processingElement = await internalLoadById(RULE_MANAGER_USER, instance.internal_id);
        // In case of inference of inference, element can be recursively cleanup by the deletion system
        if (processingElement) {
          const derivedEvents = await rule.clean(processingElement, deletedDependencies);
          await rulesApplyDerivedEvents(eventId, derivedEvents);
        }
      }
    }
  }
};

let streamEventProcessedCount = 0;
const ruleStreamHandler = async (streamEvents) => {
  // Create list of events to process
  const compatibleEvents = streamEvents.filter((event) => {
    const { data } = event;
    return data && parseInt(data.version, 10) >= MIN_LIVE_STREAM_EVENT_VERSION;
  });
  if (compatibleEvents.length > 0) {
    const ruleEvents = compatibleEvents.map((e) => {
      const { id, topic, data: eventData } = e;
      const { data, markings } = eventData;
      return { eventId: `stream--${id}`, type: topic, markings, data };
    });
    // Execute the events
    await rulesApplyHandler(ruleEvents);
    // Save the last processed event
    if (streamEventProcessedCount > STATUS_WRITE_RANGE) {
      const lastEvent = R.last(compatibleEvents);
      const patch = { lastEventId: lastEvent.id };
      await patchAttribute(RULE_MANAGER_USER, RULE_ENGINE_ID, ENTITY_TYPE_RULE_MANAGER, patch);
      streamEventProcessedCount = 0;
    } else {
      streamEventProcessedCount += compatibleEvents.length;
    }
  }
};

const initRuleManager = () => {
  let streamProcessor;
  return {
    start: async () => {
      let lock;
      try {
        // Lock the manager
        lock = await lockResource([RULE_ENGINE_KEY]);
        // Get the processor status
        const ruleSettingsInput = { internal_id: RULE_ENGINE_ID, errors: [] };
        const ruleStatus = await createEntity(RULE_MANAGER_USER, ruleSettingsInput, ENTITY_TYPE_RULE_MANAGER);
        // Start the stream listening
        activatedRules = await getActivatedRules();
        streamProcessor = createStreamProcessor(RULE_MANAGER_USER, 'Rule manager', ruleStreamHandler);
        await streamProcessor.start(ruleStatus.lastEventId);
        // Handle hot module replacement resource dispose
        if (module.hot) {
          module.hot.dispose(async () => {
            await streamProcessor.shutdown();
          });
        }
        return true;
      } catch (e) {
        if (e.name === TYPE_LOCK_ERROR) {
          logApp.debug('[OPENCTI] Rule engine already started by another API');
        } else {
          logApp.error('[OPENCTI] Rule engine failed to start', { error: e });
        }
        return false;
      } finally {
        if (lock) await lock.unlock();
      }
    },
    shutdown: async () => {
      if (streamProcessor) {
        await streamProcessor.shutdown();
      }
      return true;
    },
  };
};
const ruleEngine = initRuleManager();

export const cleanRuleManager = async (user, eventId) => {
  // Clear the elastic status
  const patch = { lastEventId: eventId, errors: [] };
  const { element } = await patchAttribute(user, RULE_ENGINE_ID, ENTITY_TYPE_RULE_MANAGER, patch);
  // Restart the manager
  await ruleEngine.shutdown();
  await ruleEngine.start();
  // Return the updated element
  return { activated: ENABLED_RULE_ENGINE, ...element };
};

export default ruleEngine;
