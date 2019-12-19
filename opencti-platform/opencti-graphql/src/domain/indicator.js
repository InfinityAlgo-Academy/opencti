import moment from 'moment';
import { assoc, dissoc, pipe, sortWith, descend, prop, head, map, includes, last } from 'ramda';
import { Promise } from 'bluebird';
import {
  createEntity,
  deleteEntityById,
  escapeString,
  findWithConnectedRelations,
  listEntities,
  loadEntityById,
  loadEntityByStixId,
  TYPE_STIX_DOMAIN_ENTITY,
  TYPE_STIX_OBSERVABLE
} from '../database/grakn';
import { BUS_TOPICS } from '../config/conf';
import { notify } from '../database/redis';
import { askEnrich, buildPagination, extractObservables } from '../database/utils';
import { findById as findMarkingDefinitionById } from './markingDefinition';
import { findById as findKillChainPhaseById } from './killChainPhase';

const OpenCTITimeToLive = {
  // Formatted as "[Marking-Definition]-[KillChainPhaseIsDelivery]"
  File: {
    'TLP:WHITE-no': 365,
    'TLP:WHITE-yes': 365,
    'TLP:GREEN-no': 365,
    'TLP:GREEN-yes': 365,
    'TLP:AMBER-yes': 365,
    'TLP:AMBER-no': 365,
    'TLP:RED-yes': 365,
    'TLP:RED-no': 365
  },
  'IPv4-Addr': {
    'TLP:WHITE-no': 30,
    'TLP:WHITE-yes': 7,
    'TLP:GREEN-no': 30,
    'TLP:GREEN-yes': 7,
    'TLP:AMBER-yes': 15,
    'TLP:AMBER-no': 60,
    'TLP:RED-yes': 120,
    'TLP:RED-no': 120
  },
  URL: {
    'TLP:WHITE-no': 60,
    'TLP:WHITE-yes': 15,
    'TLP:GREEN-no': 60,
    'TLP:GREEN-yes': 15,
    'TLP:AMBER-yes': 30,
    'TLP:AMBER-no': 180,
    'TLP:RED-yes': 180,
    'TLP:RED-no': 180
  },
  default: {
    'TLP:WHITE-no': 30,
    'TLP:WHITE-yes': 7,
    'TLP:GREEN-no': 30,
    'TLP:GREEN-yes': 7,
    'TLP:AMBER-yes': 15,
    'TLP:AMBER-no': 60,
    'TLP:RED-yes': 120,
    'TLP:RED-no': 120
  }
};

export const computeValidUntil = async indicator => {
  let validFrom = moment().utc();
  if (indicator.valid_from) {
    validFrom = moment(indicator.valid_from).utc();
  }
  // get the highest marking definition
  let markingDefinition = 'TLP:WHITE';
  if (indicator.markingDefinitions && indicator.markingDefinitions.length > 0) {
    const markingDefinitions = await Promise.all(
      indicator.markingDefinitions.map(markingDefinitionId => {
        return findMarkingDefinitionById(markingDefinitionId);
      })
    );
    markingDefinition = pipe(
      sortWith([descend(prop('level'))]),
      head,
      prop('definition')
    )(markingDefinitions);
  }
  // check if kill chain phase is delivery
  let isKillChainPhaseDelivery = 'no';
  if (indicator.killChainPhases && indicator.killChainPhases.length > 0) {
    const killChainPhases = await Promise.all(
      indicator.killChainPhases.map(killChainPhaseId => {
        return findKillChainPhaseById(killChainPhaseId);
      })
    );
    const killChainPhasesNames = map(n => n.phase_name, killChainPhases);
    isKillChainPhaseDelivery =
      includes('initial-access', killChainPhasesNames) || includes('execution', killChainPhasesNames) ? 'yes' : 'no';
  }
  // compute with delivery and marking definition
  const ttlPattern = `${markingDefinition}-${isKillChainPhaseDelivery}`;
  let ttl = OpenCTITimeToLive.default[ttlPattern];
  const mainObservableType =
    indicator.main_observable_type && indicator.main_observable_type.includes('File')
      ? 'File'
      : indicator.main_observable_type;
  if (mainObservableType && includes(indicator.main_observable_type, OpenCTITimeToLive)) {
    ttl = OpenCTITimeToLive[indicator.main_observable_type][ttlPattern];
  }
  const validUntil = validFrom.add(ttl, 'days');
  return validUntil.toDate();
};

export const findById = indicatorId => {
  if (indicatorId.match(/[a-z-]+--[\w-]{36}/g)) {
    return loadEntityByStixId(indicatorId);
  }
  return loadEntityById(indicatorId);
};
export const findAll = args => {
  const typedArgs = assoc('types', ['Indicator'], args);
  return listEntities(['name', 'alias'], typedArgs);
};

export const addIndicator = async (user, indicator, createObservables = true) => {
  const indicatorToCreate = pipe(
    assoc('score', indicator.score ? indicator.score : 50),
    assoc('valid_from', indicator.valid_from ? indicator.valid_from : Date.now()),
    assoc('valid_until', indicator.valid_until ? indicator.valid_until : await computeValidUntil(indicator))
  )(indicator);
  const created = await createEntity(indicatorToCreate, 'Indicator', TYPE_STIX_DOMAIN_ENTITY);
  // create the linked observables
  if (createObservables) {
    const observables = await extractObservables(created.indicator_pattern);
    if (observables && observables.length > 0) {
      await Promise.all(
        observables.map(async observable => {
          const args = {
            types: ['Stix-Observable'],
            parentType: 'Stix-Observable',
            filters: [{ key: 'observable_value', values: [observable.value] }]
          };
          const existingObservables = listEntities(['name', 'description', 'observable_value'], args);
          if (existingObservables.edges.length === 0) {
            const stixObservable = pipe(
              dissoc('score'),
              dissoc('valid_from'),
              dissoc('valid_until'),
              dissoc('pattern_type'),
              dissoc('indicator_pattern'),
              dissoc('created'),
              dissoc('modified'),
              assoc('type', observable.type),
              assoc('observable_value', observable.value)
            )(indicatorToCreate);
            const innerType = stixObservable.type;
            const stixObservableToCreate = dissoc('type', stixObservable);
            const createdStixObservable = await createEntity(stixObservableToCreate, innerType, {
              modelType: TYPE_STIX_OBSERVABLE,
              stixIdType: 'observable'
            });
            return askEnrich(createdStixObservable.id, innerType);
          }
          return null;
        })
      );
    }
  }
  return notify(BUS_TOPICS.StixDomainEntity.ADDED_TOPIC, created, user);
};

export const observableRefs = indicatorId => {
  return findWithConnectedRelations(
    `match $from isa Indicator; $rel(observables_aggregation:$from, soo:$to) isa observable_refs;
    $to isa Stix-Observable;
    $from has internal_id_key "${escapeString(indicatorId)}"; get;`,
    'to',
    'rel'
  ).then(data => buildPagination(0, 0, data, data.length));
};

export const clear = async () => {
  let hasMore = true;
  let currentCursor = null;
  while (hasMore) {
    const indicators = await findAll({
      first: 200,
      after: currentCursor,
      orderAsc: true,
      orderBy: 'created_at'
    });
    await Promise.all(
      indicators.edges.map(indicatorEdge => {
        return deleteEntityById(indicatorEdge.node.id);
      })
    );
    if (last(indicators.edges)) {
      currentCursor = last(indicators.edges).cursor;
      hasMore = indicators.pageInfo.hasNextPage;
    } else {
      hasMore = false;
    }
  }
  return true;
};
