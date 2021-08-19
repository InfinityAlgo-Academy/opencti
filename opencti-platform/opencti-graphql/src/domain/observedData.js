import { assoc, dissoc, pipe } from 'ramda';
import * as R from 'ramda';
import { v4 as uuidv4 } from 'uuid';
import {
  createEntity,
  distributionEntities,
  internalLoadById,
  listEntities,
  loadById,
  patchAttribute,
  timeSeriesEntities,
} from '../database/middleware';
import { BUS_TOPICS } from '../config/conf';
import { notify } from '../database/redis';
import { ENTITY_TYPE_CONTAINER_OBSERVED_DATA } from '../schema/stixDomainObject';
import { RELATION_CREATED_BY, RELATION_OBJECT } from '../schema/stixMetaRelationship';
import { ABSTRACT_STIX_DOMAIN_OBJECT, buildRefRelationKey } from '../schema/general';
import { elCount } from '../database/elasticSearch';
import { READ_INDEX_STIX_DOMAIN_OBJECTS } from '../database/utils';
import { FunctionalError } from '../config/errors';
import { now, prepareDate, utcDate } from '../utils/format';
import { isStixId } from '../schema/schemaUtils';

export const findById = (user, observedDataId) => {
  return loadById(user, observedDataId, ENTITY_TYPE_CONTAINER_OBSERVED_DATA);
};

export const findAll = async (user, args) => {
  return listEntities(user, [ENTITY_TYPE_CONTAINER_OBSERVED_DATA], args);
};

// All entities
export const observedDataContainsStixObjectOrStixRelationship = async (user, observedDataId, thingId) => {
  const resolvedThingId = isStixId(thingId) ? (await internalLoadById(user, thingId)).id : thingId;
  const args = {
    filters: [
      { key: 'internal_id', values: [observedDataId] },
      { key: buildRefRelationKey(RELATION_OBJECT), values: [resolvedThingId] },
    ],
  };
  const observedDataFound = await findAll(user, args);
  return observedDataFound.edges.length > 0;
};

// region series
export const observedDatasTimeSeries = (user, args) => {
  return timeSeriesEntities(user, ENTITY_TYPE_CONTAINER_OBSERVED_DATA, [], args);
};

export const observedDatasNumber = (user, args) => ({
  count: elCount(user, READ_INDEX_STIX_DOMAIN_OBJECTS, assoc('types', [ENTITY_TYPE_CONTAINER_OBSERVED_DATA], args)),
  total: elCount(
    user,
    READ_INDEX_STIX_DOMAIN_OBJECTS,
    pipe(assoc('types', [ENTITY_TYPE_CONTAINER_OBSERVED_DATA]), dissoc('endDate')(args))
  ),
});

export const observedDatasTimeSeriesByEntity = (user, args) => {
  const filters = [{ isRelation: true, type: RELATION_OBJECT, value: args.objectId }];
  return timeSeriesEntities(user, ENTITY_TYPE_CONTAINER_OBSERVED_DATA, filters, args);
};

export const observedDatasTimeSeriesByAuthor = async (user, args) => {
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
  return timeSeriesEntities(user, ENTITY_TYPE_CONTAINER_OBSERVED_DATA, filters, args);
};

export const observedDatasNumberByEntity = (user, args) => ({
  count: elCount(
    user,
    READ_INDEX_STIX_DOMAIN_OBJECTS,
    pipe(
      assoc('isMetaRelationship', true),
      assoc('types', [ENTITY_TYPE_CONTAINER_OBSERVED_DATA]),
      assoc('relationshipType', RELATION_OBJECT),
      assoc('fromId', args.objectId)
    )(args)
  ),
  total: elCount(
    user,
    READ_INDEX_STIX_DOMAIN_OBJECTS,
    pipe(
      assoc('isMetaRelationship', true),
      assoc('types', [ENTITY_TYPE_CONTAINER_OBSERVED_DATA]),
      assoc('relationshipType', RELATION_OBJECT),
      assoc('fromId', args.objectId),
      dissoc('endDate')
    )(args)
  ),
});

export const observedDatasDistributionByEntity = async (user, args) => {
  const { objectId } = args;
  const filters = [{ isRelation: true, type: RELATION_OBJECT, value: objectId }];
  return distributionEntities(user, ENTITY_TYPE_CONTAINER_OBSERVED_DATA, filters, args);
};
// endregion

// region mutations
export const addObservedData = async (user, observedData) => {
  if (observedData.objects.length === 0) {
    throw FunctionalError('Observed data must contain at least 1 object');
  }
  const objects = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const containedObject of observedData.objects) {
    objects.push(isStixId(containedObject) ? (await internalLoadById(user, containedObject)).id : containedObject);
  }
  const args = {
    connectionFormat: false,
    filters: [{ key: buildRefRelationKey(RELATION_OBJECT), values: objects }],
  };
  const observedDataFound = await findAll(user, args);
  if (observedDataFound.length > 0) {
    const existingObservedData = observedDataFound[0];
    // By default, we don't touch the last_observed
    let lastObserved = utcDate(existingObservedData.last_observed);
    if (R.isNil(observedData.last_observed)) {
      // If the input don't contain any last_observed, then last_observed is now()
      lastObserved = now();
    } else if (observedData.last_observed > lastObserved) {
      // If the provided last_observed is after, then we update with the given date
      lastObserved = utcDate(observedData.last_observed).toISOString();
    } else {
      lastObserved = lastObserved.toISOString();
    }
    let numberObserved;
    if (R.isNil(observedData.number_observed)) {
      numberObserved = existingObservedData.number_observed + 1;
    } else {
      numberObserved = existingObservedData.number_observed + observedData.number_observed;
    }
    const patch = {
      number_observed: numberObserved,
      last_observed: lastObserved,
    };
    await patchAttribute(user, existingObservedData.id, ENTITY_TYPE_CONTAINER_OBSERVED_DATA, patch);
    return loadById(user, existingObservedData.id, ENTITY_TYPE_CONTAINER_OBSERVED_DATA);
  }
  const entity = { internal_id: uuidv4(), ...observedData };
  const observedDataResult = await createEntity(user, entity, ENTITY_TYPE_CONTAINER_OBSERVED_DATA);
  return notify(BUS_TOPICS[ABSTRACT_STIX_DOMAIN_OBJECT].ADDED_TOPIC, observedDataResult, user);
};
// endregion
