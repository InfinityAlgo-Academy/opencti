import { assoc, dissoc, map } from 'ramda';
import { BUS_TOPICS } from '../config/conf';
import { delEditContext, notify, setEditContext } from '../database/redis';
import {
  createEntity,
  createRelation,
  createRelations,
  deleteEntityById,
  deleteRelationById,
  escape,
  executeWrite,
  listEntities,
  loadEntityById,
  loadEntityByStixId,
  timeSeriesEntities,
  updateAttribute
} from '../database/grakn';
import { findById as findMarkingDefintionById } from './markingDefinition';
import { elCount } from '../database/elasticSearch';
import { generateFileExportName, upload } from '../database/minio';
import { connectorsForExport } from './connector';
import { createWork, workToExportFile } from './work';
import { pushToConnector } from '../database/rabbitmq';

export const findAll = args => {
  const noTypes = !args.types || args.types.length === 0;
  const entityTypes = noTypes ? ['Stix-Domain-Entity'] : args.types;
  const finalArgs = assoc('parentType', 'Stix-Domain-Entity', args);
  return listEntities(entityTypes, ['name', 'alias'], finalArgs);
};
export const findById = stixDomainEntityId => {
  if (stixDomainEntityId.match(/[a-z-]+--[\w-]{36}/g)) {
    return loadEntityByStixId(stixDomainEntityId);
  }
  return loadEntityById(stixDomainEntityId);
};

// region time series
export const reportsTimeSeries = (stixDomainEntityId, args) => {
  const filters = [
    { isRelation: true, from: 'knowledge_aggregation', to: 'so', type: 'object_refs', value: stixDomainEntityId }
  ];
  return timeSeriesEntities('Report', filters, args);
};
export const stixDomainEntitiesTimeSeries = args => {
  return timeSeriesEntities(args.type ? escape(args.type) : 'Stix-Domain-Entity', [], args);
};

export const stixDomainEntitiesNumber = args => ({
  count: elCount('stix_domain_entities', args),
  total: elCount('stix_domain_entities', dissoc('endDate', args))
});
// endregion
const askJobExports = async (entity, format, exportType, maxMarkingDefinition) => {
  const connectors = await connectorsForExport(format, true);
  // Create job for every connectors
  const maxMarkingDefinitionEntity =
    maxMarkingDefinition && maxMarkingDefinition.length > 0
      ? await findMarkingDefintionById(maxMarkingDefinition)
      : null;
  const workList = await Promise.all(
    map(connector => {
      const fileName = generateFileExportName(format, connector, exportType, maxMarkingDefinitionEntity, entity);
      return createWork(connector, entity.id, fileName).then(({ work, job }) => ({
        connector,
        job,
        work
      }));
    }, connectors)
  );
  // Send message to all correct connectors queues
  await Promise.all(
    map(data => {
      const { connector, job, work } = data;
      const message = {
        work_id: work.internal_id_key, // work(id)
        job_id: job.internal_id_key, // job(id)
        max_marking_definition: maxMarkingDefinition && maxMarkingDefinition.length > 0 ? maxMarkingDefinition : null, // markingDefinition(id)
        export_type: exportType, // simple or full
        entity_type: entity.entity_type, // report, threat, ...
        entity_id: entity.id, // report(id), thread(id), ...
        file_name: work.work_file // Base path for the upload
      };
      return pushToConnector(connector, message);
    }, workList)
  );
  return workList;
};
export const stixDomainEntityImportPush = (user, entityId, file) => {
  return upload(user, 'import', file, entityId);
};

/**
 * Create export element waiting for completion
 * @param domainEntityId
 * @param format
 * @param exportType > stix2-bundle-full | stix2-bundle-simple
 * @param maxMarkingDefinition > maxMarkingDefinitionEntity
 * @returns {*}
 */
export const stixDomainEntityExportAsk = async (domainEntityId, format, exportType, maxMarkingDefinition) => {
  const entity = await loadEntityById(domainEntityId);
  const workList = await askJobExports(entity, format, exportType, maxMarkingDefinition);
  // Return the work list to do
  return map(w => workToExportFile(w.work), workList);
};

// region mutation
export const stixDomainEntityExportPush = async (user, entityId, file) => {
  // Upload the document in minio
  await upload(user, 'export', file, entityId);
  return true;
};
export const addStixDomainEntity = async (user, stixDomainEntity) => {
  const innerType = stixDomainEntity.type;
  const domainToCreate = dissoc('type', stixDomainEntity);
  const created = await createEntity(domainToCreate, innerType);
  return notify(BUS_TOPICS.StixDomainEntity.ADDED_TOPIC, created, user);
};
export const stixDomainEntityDelete = async stixDomainEntityId => {
  return deleteEntityById(stixDomainEntityId);
};
export const stixDomainEntityAddRelation = async (user, stixDomainEntityId, input) => {
  const data = await createRelation(stixDomainEntityId, input);
  return notify(BUS_TOPICS.StixDomainEntity.EDIT_TOPIC, data, user);
};
export const stixDomainEntityAddRelations = async (user, stixDomainEntityId, input) => {
  const finalInput = map(
    n => ({
      toId: n,
      fromRole: input.fromRole,
      toRole: input.toRole,
      through: input.through
    }),
    input.toIds
  );
  await createRelations(stixDomainEntityId, finalInput);
  return loadEntityById(stixDomainEntityId).then(stixDomainEntity =>
    notify(BUS_TOPICS.Workspace.EDIT_TOPIC, stixDomainEntity, user)
  );
};
export const stixDomainEntityDeleteRelation = async (user, stixDomainEntityId, relationId) => {
  await deleteRelationById(relationId);
  const data = await loadEntityById(stixDomainEntityId);
  return notify(BUS_TOPICS.StixDomainEntity.EDIT_TOPIC, data, user);
};
export const stixDomainEntityEditField = async (user, stixDomainEntityId, input) => {
  return executeWrite(wTx => {
    return updateAttribute(stixDomainEntityId, input, wTx);
  }).then(async () => {
    const stixDomain = await loadEntityById(stixDomainEntityId);
    return notify(BUS_TOPICS.StixDomainEntity.EDIT_TOPIC, stixDomain, user);
  });
};
// endregion

// region context
export const stixDomainEntityCleanContext = (user, stixDomainEntityId) => {
  delEditContext(user, stixDomainEntityId);
  return loadEntityById(stixDomainEntityId).then(stixDomainEntity =>
    notify(BUS_TOPICS.StixDomainEntity.EDIT_TOPIC, stixDomainEntity, user)
  );
};
export const stixDomainEntityEditContext = (user, stixDomainEntityId, input) => {
  setEditContext(user, stixDomainEntityId, input);
  return loadEntityById(stixDomainEntityId).then(stixDomainEntity =>
    notify(BUS_TOPICS.StixDomainEntity.EDIT_TOPIC, stixDomainEntity, user)
  );
};
// endregion
