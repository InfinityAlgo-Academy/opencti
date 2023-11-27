import * as R from 'ramda';
import {
  batchListThroughGetFrom,
  batchListThroughGetTo,
  batchLoadThroughGetTo,
  createEntity,
  createRelationRaw,
  deleteElementById,
  distributionEntities,
  storeLoadByIdWithRefs,
  timeSeriesEntities,
} from '../database/middleware';
import { internalLoadById, listEntities, storeLoadById, storeLoadByIds } from '../database/middleware-loader';
import { findAll as relationFindAll } from './stixCoreRelationship';
import { delEditContext, lockResource, notify, setEditContext, storeUpdateEvent } from '../database/redis';
import { BUS_TOPICS } from '../config/conf';
import { FunctionalError, LockTimeoutError, TYPE_LOCK_ERROR, UnsupportedError } from '../config/errors';
import { isStixCoreObject, stixCoreObjectOptions } from '../schema/stixCoreObject';
import { findById as findStatusById } from './status';
import {
  ABSTRACT_BASIC_OBJECT,
  ABSTRACT_STIX_CORE_OBJECT,
  ABSTRACT_STIX_DOMAIN_OBJECT,
  buildRefRelationKey,
  ENTITY_TYPE_CONTAINER,
  ENTITY_TYPE_IDENTITY,
  INPUT_EXTERNAL_REFS,
  REL_INDEX_PREFIX,
} from '../schema/general';
import {
  RELATION_BORN_IN,
  RELATION_CREATED_BY,
  RELATION_ETHNICITY,
  RELATION_EXTERNAL_REFERENCE, RELATION_GRANTED_TO,
  RELATION_KILL_CHAIN_PHASE,
  RELATION_OBJECT,
  RELATION_OBJECT_LABEL,
  RELATION_OBJECT_MARKING,
} from '../schema/stixRefRelationship';
import {
  ENTITY_TYPE_CONTAINER_NOTE,
  ENTITY_TYPE_CONTAINER_OBSERVED_DATA,
  ENTITY_TYPE_CONTAINER_OPINION,
  ENTITY_TYPE_CONTAINER_REPORT,
  ENTITY_TYPE_LOCATION_COUNTRY,
  isStixDomainObjectContainer,
} from '../schema/stixDomainObject';
import {
  ENTITY_TYPE_EXTERNAL_REFERENCE,
  ENTITY_TYPE_KILL_CHAIN_PHASE,
  ENTITY_TYPE_LABEL,
  ENTITY_TYPE_MARKING_DEFINITION,
} from '../schema/stixMetaObject';
import { createWork, workToExportFile } from './work';
import { pushToConnector } from '../database/rabbitmq';
import { now } from '../utils/format';
import { ENTITY_TYPE_CONNECTOR } from '../schema/internalObject';
import { deleteFile, loadFile, storeFileConverter, upload } from '../database/file-storage';
import { elCount, elUpdateElement } from '../database/engine';
import { generateStandardId, getInstanceIds } from '../schema/identifier';
import { askEntityExport, askListExport, exportTransformFilters } from './stix';
import { isEmptyField, isNotEmptyField, READ_ENTITIES_INDICES, READ_INDEX_INFERRED_ENTITIES } from '../database/utils';
import { RELATION_RELATED_TO } from '../schema/stixCoreRelationship';
import { ENTITY_TYPE_CONTAINER_CASE } from '../modules/case/case-types';
import { getEntitySettingFromCache } from '../modules/entitySetting/entitySetting-utils';
import {
  stixObjectOrRelationshipAddRefRelation,
  stixObjectOrRelationshipAddRefRelations,
  stixObjectOrRelationshipDeleteRefRelation
} from './stixObjectOrStixRelationship';
import { buildContextDataForFile, publishUserAction } from '../listener/UserActionListener';
import { extractEntityRepresentativeName } from '../database/entity-representative';
import { addFilter, extractFilterGroupValues } from '../utils/filtering/filtering-utils';
import { filterKeysWhoseValueToResolve } from '../utils/filtering/filtering-constants';
import { schemaRelationsRefDefinition } from '../schema/schema-relationsRef';

export const findAll = async (context, user, args) => {
  let types = [];
  if (isNotEmptyField(args.types)) {
    types = args.types.filter((type) => isStixCoreObject(type));
  }
  if (types.length === 0) {
    types.push(ABSTRACT_STIX_CORE_OBJECT);
  }
  if (isNotEmptyField(args.relationship_type) && isEmptyField(args.elementId)) {
    throw UnsupportedError('Cant find stixCoreObject only based on relationship type, elementId is required');
  }
  let { filters } = args;
  if (isNotEmptyField(args.elementId)) {
    // In case of element id, we look for a specific entity used by relationships independent of the direction
    // To do that we need to lookup the element inside the rel_ fields that represent the relationships connections
    // that are denormalized at relation creation.
    // If relation types are also in the query, we filter on specific rel_[TYPE], if not, using a wilcard.
    if (isNotEmptyField(args.relationship_type)) {
      const relationshipFilterKeys = args.relationship_type.map((n) => buildRefRelationKey(n));
      filters = addFilter(filters, relationshipFilterKeys, args.elementId);
    } else {
      filters = addFilter(filters, buildRefRelationKey('*'), args.elementId);
    }
  }
  if (args.globalSearch) {
    const contextData = {
      input: R.omit(['search'], args)
    };
    if (args.search && args.search.length > 0) {
      contextData.search = args.search;
    }
    await publishUserAction({
      user,
      event_type: 'command',
      event_scope: 'search',
      event_access: 'extended',
      context_data: contextData,
    });
  }
  return listEntities(context, user, types, { ...R.omit(['elementId', 'relationship_type'], args), filters });
};

export const findById = async (context, user, stixCoreObjectId) => {
  return storeLoadById(context, user, stixCoreObjectId, ABSTRACT_STIX_CORE_OBJECT);
};

export const batchCreatedBy = async (context, user, stixCoreObjectIds) => {
  return batchLoadThroughGetTo(context, user, stixCoreObjectIds, RELATION_CREATED_BY, ENTITY_TYPE_IDENTITY);
};

export const batchBornIn = async (context, user, stixCoreObjectIds) => {
  return batchLoadThroughGetTo(context, user, stixCoreObjectIds, RELATION_BORN_IN, ENTITY_TYPE_LOCATION_COUNTRY);
};

export const batchEthnicity = async (context, user, stixCoreObjectIds) => {
  return batchLoadThroughGetTo(context, user, stixCoreObjectIds, RELATION_ETHNICITY, ENTITY_TYPE_LOCATION_COUNTRY);
};

export const batchContainers = async (context, user, stixCoreObjectIds, args = {}) => {
  const { entityTypes } = args;
  const finalEntityTypes = entityTypes ?? [ENTITY_TYPE_CONTAINER];
  if (!finalEntityTypes.every((t) => isStixDomainObjectContainer(t))) {
    throw FunctionalError(`Only ${ENTITY_TYPE_CONTAINER} can be query through this method.`);
  }
  return batchListThroughGetFrom(context, user, stixCoreObjectIds, RELATION_OBJECT, finalEntityTypes, args);
};

export const batchReports = async (context, user, stixCoreObjectIds, args = {}) => {
  return batchListThroughGetFrom(context, user, stixCoreObjectIds, RELATION_OBJECT, ENTITY_TYPE_CONTAINER_REPORT, args);
};

export const batchCases = async (context, user, stixCoreObjectIds, args = {}) => {
  return batchListThroughGetFrom(context, user, stixCoreObjectIds, RELATION_OBJECT, ENTITY_TYPE_CONTAINER_CASE, args);
};

export const batchNotes = (context, user, stixCoreObjectIds, args = {}) => {
  return batchListThroughGetFrom(context, user, stixCoreObjectIds, RELATION_OBJECT, ENTITY_TYPE_CONTAINER_NOTE, args);
};

export const batchOpinions = (context, user, stixCoreObjectIds, args = {}) => {
  return batchListThroughGetFrom(context, user, stixCoreObjectIds, RELATION_OBJECT, ENTITY_TYPE_CONTAINER_OPINION, args);
};

export const batchObservedData = (context, user, stixCoreObjectIds, args = {}) => {
  return batchListThroughGetFrom(context, user, stixCoreObjectIds, RELATION_OBJECT, ENTITY_TYPE_CONTAINER_OBSERVED_DATA, args);
};

export const batchLabels = (context, user, stixCoreObjectIds) => {
  return batchListThroughGetTo(context, user, stixCoreObjectIds, RELATION_OBJECT_LABEL, ENTITY_TYPE_LABEL);
};

export const batchMarkingDefinitions = (context, user, stixCoreObjectIds) => {
  return batchListThroughGetTo(context, user, stixCoreObjectIds, RELATION_OBJECT_MARKING, ENTITY_TYPE_MARKING_DEFINITION);
};

export const batchExternalReferences = (context, user, stixDomainObjectIds) => {
  return batchListThroughGetTo(context, user, stixDomainObjectIds, RELATION_EXTERNAL_REFERENCE, ENTITY_TYPE_EXTERNAL_REFERENCE);
};

export const batchKillChainPhases = (context, user, stixCoreObjectIds) => {
  return batchListThroughGetTo(context, user, stixCoreObjectIds, RELATION_KILL_CHAIN_PHASE, ENTITY_TYPE_KILL_CHAIN_PHASE);
};

export const stixCoreRelationships = (context, user, stixCoreObjectId, args) => {
  const finalArgs = R.assoc('elementId', stixCoreObjectId, args);
  return relationFindAll(context, user, finalArgs);
};

// region relation ref
export const stixCoreObjectAddRelation = async (context, user, stixCoreObjectId, input) => {
  return stixObjectOrRelationshipAddRefRelation(context, user, stixCoreObjectId, input, ABSTRACT_STIX_CORE_OBJECT);
};
export const stixCoreObjectAddRelations = async (context, user, stixCoreObjectId, input, opts = {}) => {
  return stixObjectOrRelationshipAddRefRelations(context, user, stixCoreObjectId, input, ABSTRACT_STIX_CORE_OBJECT, opts);
};
export const stixCoreObjectDeleteRelation = async (context, user, stixCoreObjectId, toId, relationshipType, opts = {}) => {
  return stixObjectOrRelationshipDeleteRefRelation(context, user, stixCoreObjectId, toId, relationshipType, ABSTRACT_STIX_CORE_OBJECT, opts);
};
// endregion

export const stixCoreObjectDelete = async (context, user, stixCoreObjectId) => {
  const stixCoreObject = await storeLoadById(context, user, stixCoreObjectId, ABSTRACT_STIX_CORE_OBJECT);
  if (!stixCoreObject) {
    throw FunctionalError('Cannot delete the object, Stix-Core-Object cannot be found.');
  }
  await deleteElementById(context, user, stixCoreObjectId, ABSTRACT_STIX_CORE_OBJECT);
  return stixCoreObjectId;
};

export const askElementEnrichmentForConnector = async (context, user, elementId, connectorId) => {
  const connector = await storeLoadById(context, user, connectorId, ENTITY_TYPE_CONNECTOR);
  const element = await internalLoadById(context, user, elementId);
  if (!element) {
    throw FunctionalError('Cannot enrich the object, element cannot be found.');
  }
  const work = await createWork(context, user, connector, 'Manual enrichment', element.standard_id);
  const message = {
    internal: {
      work_id: work.id, // Related action for history
      applicant_id: user.id, // User asking for the import
    },
    event: {
      entity_id: element.standard_id,
    },
  };
  await pushToConnector(connector.internal_id, message);
  const contextData = {
    id: elementId,
    connector_id: connectorId,
    connector_name: connector.name,
    entity_name: extractEntityRepresentativeName(element),
    entity_type: element.entity_type
  };
  if (element.creator_id) {
    contextData.creator_ids = Array.isArray(element.creator_id) ? element.creator_id : [element.creator_id];
  }
  if (element[RELATION_GRANTED_TO]) {
    contextData.granted_refs_ids = element[RELATION_GRANTED_TO];
  }
  if (element[RELATION_OBJECT_MARKING]) {
    contextData.object_marking_refs_ids = element[RELATION_OBJECT_MARKING];
  }
  if (element[RELATION_CREATED_BY]) {
    contextData.created_by_ref_id = element[RELATION_CREATED_BY];
  }
  if (element[RELATION_OBJECT_LABEL]) {
    contextData.labels_ids = element[RELATION_OBJECT_LABEL];
  }
  await publishUserAction({
    user,
    event_access: 'extended',
    event_type: 'command',
    event_scope: 'enrich',
    context_data: contextData,
  });
  return work;
};

// region stats
export const stixCoreObjectsTimeSeries = (context, user, args) => {
  let types = [];
  if (isNotEmptyField(args.types)) {
    types = R.filter((type) => isStixCoreObject(type), args.types);
  }
  if (isEmptyField(types)) {
    types.push(ABSTRACT_STIX_CORE_OBJECT);
  }
  if (isNotEmptyField(args.relationship_type) && isEmptyField(args.elementId)) {
    throw UnsupportedError('Cant find stixCoreObject only based on relationship type, elementId is required');
  }
  let filters = args.filters ?? [];
  if (isNotEmptyField(args.elementId)) {
    // In case of element id, we look for a specific entity used by relationships independent of the direction
    // To do that we need to lookup the element inside the rel_ fields that represent the relationships connections
    // that are denormalized at relation creation.
    // If relation types are also in the query, we filter on specific rel_[TYPE], if not, using a wilcard.
    if (isNotEmptyField(args.relationship_type)) {
      const relationshipFilterKeys = args.relationship_type.map((n) => buildRefRelationKey(n));
      // eslint-disable-next-line max-len
      filters = [...filters, { key: relationshipFilterKeys, values: Array.isArray(args.elementId) ? args.elementId : [args.elementId] }];
    } else {
      filters = [...filters, { key: buildRefRelationKey('*'), values: Array.isArray(args.elementId) ? args.elementId : [args.elementId] }];
    }
  }
  return timeSeriesEntities(context, user, types, { ...R.omit(['elementId', 'relationship_type'], args), filters });
};

export const stixCoreObjectsTimeSeriesByAuthor = (context, user, args) => {
  const { authorId, types } = args;
  const filters = addFilter(args.filters, buildRefRelationKey(RELATION_CREATED_BY, '*'), authorId);
  return timeSeriesEntities(context, user, types ?? [ABSTRACT_STIX_CORE_OBJECT], { ...args, filters });
};

export const stixCoreObjectsMultiTimeSeries = (context, user, args) => {
  return Promise.all(args.timeSeriesParameters.map((timeSeriesParameter) => {
    let types = [];
    if (isNotEmptyField(timeSeriesParameter.types)) {
      types = R.filter((type) => isStixCoreObject(type), timeSeriesParameter.types);
    }
    if (isEmptyField(types)) {
      types.push(ABSTRACT_STIX_CORE_OBJECT);
    }
    if (isNotEmptyField(timeSeriesParameter.relationship_type) && isEmptyField(timeSeriesParameter.elementId)) {
      throw UnsupportedError('Cant find stixCoreObject only based on relationship type, elementId is required');
    }
    let filters = timeSeriesParameter.filters ?? [];
    if (isNotEmptyField(timeSeriesParameter.elementId)) {
      // In case of element id, we look for a specific entity used by relationships independent of the direction
      // To do that we need to lookup the element inside the rel_ fields that represent the relationships connections
      // that are denormalized at relation creation.
      // If relation types are also in the query, we filter on specific rel_[TYPE], if not, using a wilcard.
      if (isNotEmptyField(timeSeriesParameter.relationship_type)) {
        const relationshipFilterKeys = timeSeriesParameter.relationship_type.map((n) => buildRefRelationKey(n));
        // eslint-disable-next-line max-len
        filters = [...filters, { key: relationshipFilterKeys, values: Array.isArray(timeSeriesParameter.elementId) ? timeSeriesParameter.elementId : [timeSeriesParameter.elementId] }];
      } else {
        filters = [...filters, { key: buildRefRelationKey('*'), values: Array.isArray(timeSeriesParameter.elementId) ? timeSeriesParameter.elementId : [timeSeriesParameter.elementId] }];
      }
    }
    return { data: timeSeriesEntities(context, user, types, { ...args, ...R.omit(['elementId', 'relationship_type'], timeSeriesParameter), filters }) };
  }));
};

export const stixCoreObjectsNumber = (context, user, args) => {
  let types = [];
  if (isNotEmptyField(args.types)) {
    types = args.types.filter((type) => isStixCoreObject(type));
  }
  if (types.length === 0) {
    types.push(ABSTRACT_STIX_CORE_OBJECT);
  }
  if (isNotEmptyField(args.relationship_type) && isEmptyField(args.elementId)) {
    throw UnsupportedError('Cant find stixCoreObject only based on relationship type, elementId is required');
  }
  let { filters } = args;
  if (isNotEmptyField(args.elementId)) {
    // In case of element id, we look for a specific entity used by relationships independent of the direction
    // To do that we need to lookup the element inside the rel_ fields that represent the relationships connections
    // that are denormalized at relation creation.
    // If relation types are also in the query, we filter on specific rel_[TYPE], if not, using a wilcard.
    if (isNotEmptyField(args.relationship_type)) {
      const relationshipFilterKeys = args.relationship_type.map((n) => buildRefRelationKey(n));
      filters = addFilter(filters, relationshipFilterKeys, args.elementId);
    } else {
      filters = addFilter(filters, buildRefRelationKey('*'), args.elementId);
    }
  }
  return {
    count: elCount(context, user, args.onlyInferred ? READ_INDEX_INFERRED_ENTITIES : READ_ENTITIES_INDICES, { ...R.omit(['elementId', 'relationship_type'], args), filters }),
    total: elCount(context, user, args.onlyInferred ? READ_INDEX_INFERRED_ENTITIES : READ_ENTITIES_INDICES, { ...R.omit(['elementId', 'relationship_type', 'endDate'], args), filters }),
  };
};

export const stixCoreObjectsMultiNumber = (context, user, args) => {
  return Promise.all(args.numberParameters.map((numberParameter) => {
    let types = [];
    if (isNotEmptyField(numberParameter.types)) {
      types = args.types.filter((type) => isStixCoreObject(type));
    }
    if (types.length === 0) {
      types.push(ABSTRACT_STIX_CORE_OBJECT);
    }
    if (isNotEmptyField(args.relationship_type) && isEmptyField(args.elementId)) {
      throw UnsupportedError('Cant find stixCoreObject only based on relationship type, elementId is required');
    }
    let { filters } = numberParameter;
    if (isNotEmptyField(numberParameter.elementId)) {
      // In case of element id, we look for a specific entity used by relationships independent of the direction
      // To do that we need to lookup the element inside the rel_ fields that represent the relationships connections
      // that are denormalized at relation creation.
      // If relation types are also in the query, we filter on specific rel_[TYPE], if not, using a wilcard.
      if (isNotEmptyField(numberParameter.relationship_type)) {
        const relationshipFilterKeys = numberParameter.relationship_type.map((n) => buildRefRelationKey(n));
        filters = addFilter(filters, relationshipFilterKeys, numberParameter.elementId);
      } else {
        filters = addFilter(filters, buildRefRelationKey('*'), numberParameter.elementId);
      }
    }
    return {
      count: elCount(context, user, args.onlyInferred ? READ_INDEX_INFERRED_ENTITIES : READ_ENTITIES_INDICES, { ...args, ...{ ...R.omit(['elementId', 'relationship_type'], numberParameter), filters } }),
      total: elCount(context, user, args.onlyInferred ? READ_INDEX_INFERRED_ENTITIES : READ_ENTITIES_INDICES, R.dissoc('endDate', { ...args, ...{ ...R.omit(['elementId', 'relationship_type'], numberParameter), filters } }))
    };
  }));
};

export const stixCoreObjectsConnectedNumber = (stixCoreObject) => {
  return Object.entries(stixCoreObject)
    .filter(([key]) => key.startsWith(REL_INDEX_PREFIX))
    .map(([, value]) => value.length)
    .reduce((a, b) => a + b, 0);
};

export const stixCoreObjectsDistribution = async (context, user, args) => {
  const { types } = args;
  return distributionEntities(context, user, types ?? [ABSTRACT_STIX_CORE_OBJECT], args);
};

export const stixCoreObjectsDistributionByEntity = async (context, user, args) => {
  const { relationship_type, objectId, types } = args;
  const filters = addFilter(args.filters, (relationship_type ?? [RELATION_RELATED_TO]).map((n) => buildRefRelationKey(n, '*')), objectId);
  return distributionEntities(context, user, types ?? [ABSTRACT_STIX_CORE_OBJECT], { ...args, filters });
};

export const stixCoreObjectsMultiDistribution = (context, user, args) => {
  return Promise.all(args.distributionParameters.map((distributionParameter) => {
    const { types } = distributionParameter;
    return { data: distributionEntities(context, user, types ?? [ABSTRACT_STIX_CORE_OBJECT], { ...args, ...distributionParameter }) };
  }));
};
// endregion

// region export
export const stixCoreObjectsExportAsk = async (context, user, args) => {
  const { format, type, exportType, maxMarkingDefinition, selectedIds } = args;
  const { search, orderBy, orderMode, filters, relationship_type, elementId } = args;
  const argsFilters = { search, orderBy, orderMode, filters, relationship_type, elementId };
  const ordersOpts = stixCoreObjectOptions.StixCoreObjectsOrdering;
  const listParams = exportTransformFilters(argsFilters, ordersOpts);
  const works = await askListExport(context, user, format, type, selectedIds, listParams, exportType, maxMarkingDefinition);
  return works.map((w) => workToExportFile(w));
};
export const stixCoreObjectExportAsk = async (context, user, stixCoreObjectId, args) => {
  const { format, exportType = null, maxMarkingDefinition = null } = args;
  const entity = await storeLoadById(context, user, stixCoreObjectId, ABSTRACT_STIX_CORE_OBJECT);
  const works = await askEntityExport(context, user, format, entity, exportType, maxMarkingDefinition);
  return works.map((w) => workToExportFile(w));
};

export const stixCoreObjectsExportPush = async (context, user, type, file, listFilters) => {
  const meta = { list_filters: listFilters };
  await upload(context, user, `export/${type}`, file, { meta });
  return true;
};

export const stixCoreObjectExportPush = async (context, user, entityId, file) => {
  const previous = await storeLoadByIdWithRefs(context, user, entityId);
  if (!previous) {
    throw UnsupportedError('Cant upload a file an none existing element', { entityId });
  }
  const path = `export/${previous.entity_type}/${entityId}`;
  const up = await upload(context, user, path, file, { entity: previous });
  const contextData = buildContextDataForFile(previous, path, up.name);
  await publishUserAction({
    user,
    event_type: 'file',
    event_access: 'extended',
    event_scope: 'create',
    context_data: contextData
  });
  return true;
};

export const stixCoreObjectImportPush = async (context, user, id, file, noTriggerImport = false) => {
  let lock;
  const previous = await storeLoadByIdWithRefs(context, user, id);
  if (!previous) {
    throw UnsupportedError('Cant upload a file an none existing element', { id });
  }
  const participantIds = getInstanceIds(previous);
  try {
    // Lock the participants that will be merged
    lock = await lockResource(participantIds);
    const { internal_id: internalId } = previous;
    const { filename } = await file;
    const entitySetting = await getEntitySettingFromCache(context, previous.entity_type);
    const isAutoExternal = !entitySetting ? false : entitySetting.platform_entity_files_ref;
    const filePath = `import/${previous.entity_type}/${internalId}`;
    // 01. Upload the file
    const meta = {};
    if (isAutoExternal) {
      const key = `${filePath}/${filename}`;
      meta.external_reference_id = generateStandardId(ENTITY_TYPE_EXTERNAL_REFERENCE, { url: `/storage/get/${key}` });
    }
    const up = await upload(context, user, filePath, file, { meta, noTriggerImport, entity: previous });
    // 02. Create and link external ref if needed.
    let addedExternalRef;
    if (isAutoExternal) {
      // Create external ref + link to current entity
      const createExternal = { source_name: filename, url: `/storage/get/${up.id}`, fileId: up.id };
      const externalRef = await createEntity(context, user, createExternal, ENTITY_TYPE_EXTERNAL_REFERENCE);
      const relInput = { fromId: id, toId: externalRef.id, relationship_type: RELATION_EXTERNAL_REFERENCE };
      const opts = { publishStreamEvent: false, locks: participantIds };
      await createRelationRaw(context, user, relInput, opts);
      addedExternalRef = externalRef;
    }
    // Patch the updated_at to force live stream evolution
    const eventFile = storeFileConverter(user, up);
    const files = [...(previous.x_opencti_files ?? []).filter((f) => f.id !== up.id), eventFile];
    await elUpdateElement({
      _index: previous._index,
      internal_id: internalId,
      updated_at: now(),
      x_opencti_files: files
    });
    // Stream event generation
    if (addedExternalRef) {
      const newExternalRefs = [...(previous[INPUT_EXTERNAL_REFS] ?? []), addedExternalRef];
      const instance = { ...previous, x_opencti_files: files, [INPUT_EXTERNAL_REFS]: newExternalRefs };
      const message = `adds \`${up.name}\` in \`files\` and \`external_references\``;
      await storeUpdateEvent(context, user, previous, instance, message);
    } else {
      const instance = { ...previous, x_opencti_files: files };
      await storeUpdateEvent(context, user, previous, instance, `adds \`${up.name}\` in \`files\``);
    }
    // Add in activity only for notifications
    const contextData = buildContextDataForFile(previous, filePath, up.name);
    await publishUserAction({
      user,
      event_type: 'file',
      event_access: 'extended',
      event_scope: 'create',
      prevent_indexing: true,
      context_data: contextData
    });
    return up;
  } catch (err) {
    if (err.name === TYPE_LOCK_ERROR) {
      throw LockTimeoutError({ participantIds });
    }
    throw err;
  } finally {
    if (lock) await lock.unlock();
  }
};

export const stixCoreObjectImportDelete = async (context, user, fileId) => {
  if (!fileId.startsWith('import')) {
    throw UnsupportedError('Cant delete an exported file with this method');
  }
  // Get the context
  const up = await loadFile(user, fileId);
  const entityId = up.metaData.entity_id;
  const externalReferenceId = up.metaData.external_reference_id;
  const previous = await storeLoadByIdWithRefs(context, user, entityId);
  if (!previous) {
    throw UnsupportedError('Cant delete a file of none existing element', { entityId });
  }
  let lock;
  const participantIds = getInstanceIds(previous);
  try {
    // Lock the participants that will be merged
    lock = await lockResource(participantIds);
    // If external reference attached, delete first
    if (externalReferenceId) {
      try {
        await deleteElementById(context, user, externalReferenceId, ENTITY_TYPE_EXTERNAL_REFERENCE);
      } catch {
        // If external reference already deleted.
      }
    }
    // Delete the file
    await deleteFile(context, user, fileId);
    // Patch the updated_at to force live stream evolution
    const files = (previous.x_opencti_files ?? []).filter((f) => f.id !== fileId);
    await elUpdateElement({ _index: previous._index, internal_id: entityId, updated_at: now(), x_opencti_files: files });
    // Stream event generation
    const instance = { ...previous, x_opencti_files: files };
    await storeUpdateEvent(context, user, previous, instance, `removes \`${up.name}\` in \`files\``);
    // Add in activity only for notifications
    const contextData = buildContextDataForFile(previous, fileId, up.name);
    await publishUserAction({
      user,
      event_type: 'file',
      event_access: 'extended',
      event_scope: 'delete',
      prevent_indexing: true,
      context_data: contextData
    });
    await notify(BUS_TOPICS[ABSTRACT_STIX_DOMAIN_OBJECT].EDIT_TOPIC, instance, user);
    return up;
  } catch (err) {
    if (err.name === TYPE_LOCK_ERROR) {
      throw LockTimeoutError({ participantIds });
    }
    throw err;
  } finally {
    if (lock) await lock.unlock();
  }
};

// region context
export const stixCoreObjectCleanContext = async (context, user, stixCoreObjectId) => {
  await delEditContext(user, stixCoreObjectId);
  return storeLoadById(context, user, stixCoreObjectId, ABSTRACT_STIX_CORE_OBJECT).then((stixCoreObject) => {
    return notify(BUS_TOPICS[ABSTRACT_STIX_CORE_OBJECT].EDIT_TOPIC, stixCoreObject, user);
  });
};

export const stixCoreObjectEditContext = async (context, user, stixCoreObjectId, input) => {
  await setEditContext(user, stixCoreObjectId, input);
  return storeLoadById(context, user, stixCoreObjectId, ABSTRACT_STIX_CORE_OBJECT).then((stixCoreObject) => {
    return notify(BUS_TOPICS[ABSTRACT_STIX_CORE_OBJECT].EDIT_TOPIC, stixCoreObject, user);
  });
};
// endregion

// region filters representatives
// return an array of the value of the ids existing in inputFilters:
// the entity representative for entities, null for deleted or restricted entities, the id for ids not corresponding to an entity
export const findFiltersRepresentatives = async (context, user, inputFilters) => {
  const filtersRepresentatives = [];
  // extract the ids to resolve from inputFilters
  const keysToResolve = schemaRelationsRefDefinition.getAllInputNames().concat(filterKeysWhoseValueToResolve);
  const idsToResolve = extractFilterGroupValues(inputFilters, keysToResolve);
  const otherIds = extractFilterGroupValues(inputFilters, keysToResolve, true);
  // resolve the ids
  const resolvedEntities = await storeLoadByIds(context, user, idsToResolve, ABSTRACT_BASIC_OBJECT);
  // resolve status ids differently
  for (let index = 0; index < resolvedEntities.length; index += 1) {
    let entity = resolvedEntities[index];
    if (entity?.entity_type === 'Status') {
      // complete the result with the cache for statuses to have all the infos to fetch the representative
      entity = await findStatusById(context, user, entity.id);
    }
    // add the entity representative in 'value', or null for deleted/restricted entities
    filtersRepresentatives.push({ id: idsToResolve[index], value: (entity ? extractEntityRepresentativeName(entity) : null) });
  }
  // add ids that don't require a resolution
  return filtersRepresentatives.concat(otherIds.map((id) => ({ id, value: id })));
};

// endregion
