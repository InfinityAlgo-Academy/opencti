import { assoc, dissoc, pipe } from 'ramda';
import { createEntity, distributionEntities, listEntities, loadById, timeSeriesEntities } from '../database/middleware';
import { BUS_TOPICS } from '../config/conf';
import { notify } from '../database/redis';
import { ENTITY_TYPE_CONTAINER_OPINION } from '../schema/stixDomainObject';
import { RELATION_CREATED_BY, RELATION_OBJECT } from '../schema/stixMetaRelationship';
import { ABSTRACT_STIX_DOMAIN_OBJECT, REL_INDEX_PREFIX } from '../schema/general';
import { elCount } from '../database/elasticSearch';
import { READ_INDEX_STIX_DOMAIN_OBJECTS } from '../database/utils';

export const findById = (user, opinionId) => {
  return loadById(user, opinionId, ENTITY_TYPE_CONTAINER_OPINION);
};
export const findAll = async (user, args) => {
  return listEntities(user, [ENTITY_TYPE_CONTAINER_OPINION], args);
};

// Entities tab

export const opinionContainsStixObjectOrStixRelationship = async (user, opinionId, thingId) => {
  const args = {
    filters: [
      { key: 'internal_id', values: [opinionId] },
      { key: `${REL_INDEX_PREFIX}${RELATION_OBJECT}.internal_id`, values: [thingId] },
    ],
  };
  const opinionFound = await findAll(user, args);
  return opinionFound.edges.length > 0;
};

// region series
export const opinionsTimeSeries = (user, args) => {
  return timeSeriesEntities(user, ENTITY_TYPE_CONTAINER_OPINION, [], args);
};

export const opinionsNumber = (user, args) => ({
  count: elCount(user, READ_INDEX_STIX_DOMAIN_OBJECTS, assoc('types', [ENTITY_TYPE_CONTAINER_OPINION], args)),
  total: elCount(
    user,
    READ_INDEX_STIX_DOMAIN_OBJECTS,
    pipe(assoc('types', [ENTITY_TYPE_CONTAINER_OPINION]), dissoc('endDate'))(args)
  ),
});

export const opinionsTimeSeriesByEntity = (user, args) => {
  const filters = [{ isRelation: true, type: RELATION_OBJECT, value: args.objectId }];
  return timeSeriesEntities(user, ENTITY_TYPE_CONTAINER_OPINION, filters, args);
};

export const opinionsTimeSeriesByAuthor = async (user, args) => {
  const { authorId } = args;
  const filters = [
    {
      isRelation: true,
      from: `${RELATION_CREATED_BY}_from`,
      to: `${RELATION_CREATED_BY}_to`,
      type: RELATION_CREATED_BY,
      value: authorId,
    },
  ];
  return timeSeriesEntities(user, ENTITY_TYPE_CONTAINER_OPINION, filters, args);
};

export const opinionsNumberByEntity = (user, args) => ({
  count: elCount(
    user,
    READ_INDEX_STIX_DOMAIN_OBJECTS,
    pipe(
      assoc('isMetaRelationship', true),
      assoc('types', [ENTITY_TYPE_CONTAINER_OPINION]),
      assoc('relationshipType', RELATION_OBJECT),
      assoc('fromId', args.objectId)
    )(args)
  ),
  total: elCount(
    user,
    READ_INDEX_STIX_DOMAIN_OBJECTS,
    pipe(
      assoc('isMetaRelationship', true),
      assoc('types', [ENTITY_TYPE_CONTAINER_OPINION]),
      assoc('relationshipType', RELATION_OBJECT),
      assoc('fromId', args.objectId),
      dissoc('endDate')
    )(args)
  ),
});

export const opinionsDistributionByEntity = async (user, args) => {
  const { objectId } = args;
  const filters = [{ isRelation: true, type: RELATION_OBJECT, value: objectId }];
  return distributionEntities(user, ENTITY_TYPE_CONTAINER_OPINION, filters, args);
};
// endregion

// region mutations
export const addOpinion = async (user, opinion) => {
  const created = await createEntity(user, opinion, ENTITY_TYPE_CONTAINER_OPINION);
  return notify(BUS_TOPICS[ABSTRACT_STIX_DOMAIN_OBJECT].ADDED_TOPIC, created, user);
};
// endregion
