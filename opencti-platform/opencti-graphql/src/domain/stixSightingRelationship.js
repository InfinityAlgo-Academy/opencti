import { assoc, dissoc, pipe } from 'ramda';
import { delEditContext, notify, setEditContext } from '../database/redis';
import { batchListThroughGetFrom, batchListThroughGetTo, batchLoadThroughGetTo, createRelation, deleteElementById, updateAttribute } from '../database/middleware';
import { BUS_TOPICS } from '../config/conf';
import { STIX_SIGHTING_RELATIONSHIP } from '../schema/stixSightingRelationship';
import { ENTITY_TYPE_CONTAINER, ENTITY_TYPE_IDENTITY } from '../schema/general';
import { RELATION_CREATED_BY, RELATION_EXTERNAL_REFERENCE, RELATION_OBJECT, RELATION_OBJECT_LABEL, RELATION_OBJECT_MARKING } from '../schema/stixRefRelationship';
import { ENTITY_TYPE_CONTAINER_NOTE, ENTITY_TYPE_CONTAINER_OPINION, ENTITY_TYPE_CONTAINER_REPORT } from '../schema/stixDomainObject';
import { ENTITY_TYPE_EXTERNAL_REFERENCE, ENTITY_TYPE_LABEL, ENTITY_TYPE_MARKING_DEFINITION } from '../schema/stixMetaObject';
import { elCount } from '../database/engine';
import { READ_INDEX_STIX_SIGHTING_RELATIONSHIPS } from '../database/utils';
import { listRelations, storeLoadById } from '../database/middleware-loader';
import { ENTITY_TYPE_CONTAINER_CASE } from '../modules/case/case-types';
import { stixObjectOrRelationshipAddRefRelation, stixObjectOrRelationshipAddRefRelations, stixObjectOrRelationshipDeleteRefRelation } from './stixObjectOrStixRelationship';

export const findAll = async (context, user, args) => {
  return listRelations(context, user, STIX_SIGHTING_RELATIONSHIP, args);
};

export const findById = (context, user, stixSightingRelationshipId) => {
  return storeLoadById(context, user, stixSightingRelationshipId, STIX_SIGHTING_RELATIONSHIP);
};

export const stixSightingRelationshipsNumber = (context, user, args) => ({
  count: elCount(context, user, READ_INDEX_STIX_SIGHTING_RELATIONSHIPS, assoc('types', [STIX_SIGHTING_RELATIONSHIP], args)),
  total: elCount(
    context,
    user,
    READ_INDEX_STIX_SIGHTING_RELATIONSHIPS,
    pipe(assoc('types', [STIX_SIGHTING_RELATIONSHIP]), dissoc('endDate'))(args)
  ),
});

export const batchCreatedBy = async (context, user, stixCoreRelationshipIds) => {
  return batchLoadThroughGetTo(context, user, stixCoreRelationshipIds, RELATION_CREATED_BY, ENTITY_TYPE_IDENTITY);
};

export const batchContainers = async (context, user, stixCoreRelationshipIds) => {
  return batchListThroughGetFrom(context, user, stixCoreRelationshipIds, RELATION_OBJECT, ENTITY_TYPE_CONTAINER);
};

export const batchReports = async (context, user, stixCoreRelationshipIds) => {
  return batchListThroughGetFrom(context, user, stixCoreRelationshipIds, RELATION_OBJECT, ENTITY_TYPE_CONTAINER_REPORT);
};

export const batchCases = async (context, user, stixCoreRelationshipIds) => {
  return batchListThroughGetFrom(context, user, stixCoreRelationshipIds, RELATION_OBJECT, ENTITY_TYPE_CONTAINER_CASE);
};

export const batchNotes = (context, user, stixCoreRelationshipIds) => {
  return batchListThroughGetFrom(context, user, stixCoreRelationshipIds, RELATION_OBJECT, ENTITY_TYPE_CONTAINER_NOTE);
};

export const batchOpinions = (context, user, stixCoreRelationshipIds) => {
  return batchListThroughGetFrom(context, user, stixCoreRelationshipIds, RELATION_OBJECT, ENTITY_TYPE_CONTAINER_OPINION);
};

export const batchLabels = (context, user, stixCoreRelationshipIds) => {
  return batchListThroughGetTo(context, user, stixCoreRelationshipIds, RELATION_OBJECT_LABEL, ENTITY_TYPE_LABEL);
};

export const batchMarkingDefinitions = (context, user, stixCoreRelationshipIds) => {
  return batchListThroughGetTo(context, user, stixCoreRelationshipIds, RELATION_OBJECT_MARKING, ENTITY_TYPE_MARKING_DEFINITION);
};

export const batchExternalReferences = (context, user, stixCoreRelationshipIds) => {
  return batchListThroughGetTo(
    context,
    user,
    stixCoreRelationshipIds,
    RELATION_EXTERNAL_REFERENCE,
    ENTITY_TYPE_EXTERNAL_REFERENCE
  );
};

// region mutations
export const addStixSightingRelationship = async (context, user, stixSightingRelationship) => {
  const created = await createRelation(
    context,
    user,
    assoc('relationship_type', STIX_SIGHTING_RELATIONSHIP, stixSightingRelationship)
  );
  return notify(BUS_TOPICS[STIX_SIGHTING_RELATIONSHIP].ADDED_TOPIC, created, user);
};
export const stixSightingRelationshipDelete = async (context, user, stixSightingRelationshipId) => {
  await deleteElementById(context, user, stixSightingRelationshipId, STIX_SIGHTING_RELATIONSHIP);
  return stixSightingRelationshipId;
};
export const stixSightingRelationshipEditField = async (context, user, relationshipId, input, opts) => {
  const { element } = await updateAttribute(context, user, relationshipId, STIX_SIGHTING_RELATIONSHIP, input, opts);
  return notify(BUS_TOPICS[STIX_SIGHTING_RELATIONSHIP].EDIT_TOPIC, element, user);
};
// endregion

// region relation ref
export const stixSightingRelationshipAddRelation = async (context, user, stixSightingRelationshipId, input) => {
  return stixObjectOrRelationshipAddRefRelation(context, user, stixSightingRelationshipId, input, STIX_SIGHTING_RELATIONSHIP);
};
export const stixSightingRelationshipAddRelations = async (context, user, stixSightingRelationshipId, input, opts = {}) => {
  return stixObjectOrRelationshipAddRefRelations(context, user, stixSightingRelationshipId, input, STIX_SIGHTING_RELATIONSHIP, opts);
};
export const stixSightingRelationshipDeleteRelation = async (context, user, stixSightingRelationshipId, toId, relationshipType, opts = {}) => {
  return stixObjectOrRelationshipDeleteRefRelation(context, user, stixSightingRelationshipId, toId, relationshipType, STIX_SIGHTING_RELATIONSHIP, opts);
};
// endregion

// region context
export const stixSightingRelationshipCleanContext = (context, user, stixSightingRelationshipId) => {
  delEditContext(user, stixSightingRelationshipId);
  return storeLoadById(context, user, stixSightingRelationshipId, STIX_SIGHTING_RELATIONSHIP).then((stixSightingRelationship) => {
    return notify(BUS_TOPICS[STIX_SIGHTING_RELATIONSHIP].EDIT_TOPIC, stixSightingRelationship, user);
  });
};
export const stixSightingRelationshipEditContext = (context, user, stixSightingRelationshipId, input) => {
  setEditContext(user, stixSightingRelationshipId, input);
  return storeLoadById(context, user, stixSightingRelationshipId, STIX_SIGHTING_RELATIONSHIP).then((stixSightingRelationship) => {
    return notify(BUS_TOPICS[STIX_SIGHTING_RELATIONSHIP].EDIT_TOPIC, stixSightingRelationship, user);
  });
};
// endregion
