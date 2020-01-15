import {
  createEntity,
  listEntities,
  loadEntityById,
  loadEntityByStixId,
  TYPE_STIX_DOMAIN_ENTITY
} from '../database/grakn';
import { BUS_TOPICS } from '../config/conf';
import { notify } from '../database/redis';

export const findById = threatActorId => {
  if (threatActorId.match(/[a-z-]+--[\w-]{36}/g)) {
    return loadEntityByStixId(threatActorId);
  }
  return loadEntityById(threatActorId);
};
export const findAll = args => {
  return listEntities(['Threat-Actor'], ['name', 'alias'], args);
};

export const addThreatActor = async (user, threatActor) => {
  const created = await createEntity(threatActor, 'Threat-Actor', { modelType: TYPE_STIX_DOMAIN_ENTITY });
  return notify(BUS_TOPICS.StixDomainEntity.ADDED_TOPIC, created, user);
};
