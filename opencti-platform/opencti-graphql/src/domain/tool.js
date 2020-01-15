import {
  createEntity,
  listEntities,
  loadEntityById,
  loadEntityByStixId,
  TYPE_STIX_DOMAIN_ENTITY
} from '../database/grakn';
import { BUS_TOPICS } from '../config/conf';
import { notify } from '../database/redis';

export const findById = toolId => {
  if (toolId.match(/[a-z-]+--[\w-]{36}/g)) {
    return loadEntityByStixId(toolId);
  }
  return loadEntityById(toolId);
};
export const findAll = args => {
  return listEntities(['Tool'], ['name', 'alias'], args);
};

export const addTool = async (user, tool) => {
  const created = await createEntity(tool, 'Tool', TYPE_STIX_DOMAIN_ENTITY);
  return notify(BUS_TOPICS.StixDomainEntity.ADDED_TOPIC, created, user);
};
