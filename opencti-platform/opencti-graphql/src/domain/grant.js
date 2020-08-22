import { assoc, dissoc, map, propOr, pipe } from 'ramda';
import { createEntity, createRelation, deleteEntityById } from '../database/grakn';
import { ENTITY_TYPE_CAPABILITY, ENTITY_TYPE_ROLE } from '../schema/internalObject';
import { RELATION_HAS_CAPABILITY } from '../schema/internalRelationship';
import { generateStandardId } from '../schema/identifier';

export const addCapability = async (user, capability) => {
  return createEntity(user, capability, ENTITY_TYPE_CAPABILITY, { noLog: true });
};

export const addRole = async (user, role) => {
  const capabilities = propOr([], 'capabilities', role);
  const roleToCreate = pipe(
    assoc('description', role.description ? role.description : ''),
    assoc('default_assignation', role.default_assignation ? role.default_assignation : false),
    dissoc('capabilities')
  )(role);
  const roleEntity = await createEntity(user, roleToCreate, ENTITY_TYPE_ROLE, { noLog: true });
  const relationPromises = map(async (capabilityName) => {
    const generateToId = await generateStandardId(ENTITY_TYPE_CAPABILITY, { name: capabilityName });
    return createRelation(
      user,
      {
        fromId: roleEntity.id,
        toId: generateToId,
        relationship_type: RELATION_HAS_CAPABILITY,
      },
      { noLog: true }
    );
  }, capabilities);
  await Promise.all(relationPromises);
  return roleEntity;
};

export const roleDelete = (user, roleId) => deleteEntityById(user, roleId, ENTITY_TYPE_ROLE, { noLog: true });
