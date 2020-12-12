import { assoc } from 'ramda';
import { createEntity, listEntities, batchListThroughGetTo, loadById } from '../database/middleware';
import { BUS_TOPICS } from '../config/conf';
import { notify } from '../database/redis';
import { ENTITY_TYPE_IDENTITY_INDIVIDUAL, ENTITY_TYPE_IDENTITY_ORGANIZATION } from '../schema/stixDomainObject';
import { ABSTRACT_STIX_DOMAIN_OBJECT } from '../schema/general';
import { RELATION_PART_OF } from '../schema/stixCoreRelationship';

export const findById = (individualId) => {
  return loadById(individualId, ENTITY_TYPE_IDENTITY_INDIVIDUAL);
};

export const findAll = (args) => {
  return listEntities([ENTITY_TYPE_IDENTITY_INDIVIDUAL], args);
};

export const addIndividual = async (user, individual) => {
  const created = await createEntity(
    user,
    assoc('identity_class', ENTITY_TYPE_IDENTITY_INDIVIDUAL.toLowerCase(), individual),
    ENTITY_TYPE_IDENTITY_INDIVIDUAL
  );
  return notify(BUS_TOPICS[ABSTRACT_STIX_DOMAIN_OBJECT].ADDED_TOPIC, created, user);
};

export const batchOrganizations = (individualIds) => {
  return batchListThroughGetTo(individualIds, RELATION_PART_OF, ENTITY_TYPE_IDENTITY_ORGANIZATION);
};
