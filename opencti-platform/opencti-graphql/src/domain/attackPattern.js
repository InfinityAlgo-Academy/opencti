import { listThroughGetFroms, createEntity, listEntities, listThroughGetTos, loadById } from '../database/grakn';
import { BUS_TOPICS } from '../config/conf';
import { notify } from '../database/redis';
import { ENTITY_TYPE_ATTACK_PATTERN } from '../schema/stixDomainObject';
import { ABSTRACT_STIX_DOMAIN_OBJECT } from '../schema/general';
import { RELATION_MITIGATES, RELATION_SUBTECHNIQUE_OF } from '../schema/stixCoreRelationship';

export const findById = (attackPatternId) => {
  return loadById(attackPatternId, ENTITY_TYPE_ATTACK_PATTERN);
};

export const findAll = (args) => {
  return listEntities([ENTITY_TYPE_ATTACK_PATTERN], ['name', 'description', 'x_mitre_id', 'aliases'], args);
};

export const addAttackPattern = async (user, attackPattern) => {
  const created = await createEntity(user, attackPattern, ENTITY_TYPE_ATTACK_PATTERN);
  return notify(BUS_TOPICS[ABSTRACT_STIX_DOMAIN_OBJECT].ADDED_TOPIC, created, user);
};

export const batchCoursesOfAction = (attackPatternIds) => {
  return listThroughGetFroms(attackPatternIds, RELATION_MITIGATES, ENTITY_TYPE_ATTACK_PATTERN);
};

export const batchParentAttackPatterns = (attackPatternIds) => {
  return listThroughGetTos(attackPatternIds, RELATION_SUBTECHNIQUE_OF, ENTITY_TYPE_ATTACK_PATTERN);
};

export const batchSubAttackPatterns = (attackPatternIds) => {
  return listThroughGetFroms(attackPatternIds, RELATION_SUBTECHNIQUE_OF, ENTITY_TYPE_ATTACK_PATTERN);
};

export const batchIsSubAttackPattern = async (attackPatternIds) => {
  const batchCreators = await listThroughGetTos(attackPatternIds, RELATION_SUBTECHNIQUE_OF, ENTITY_TYPE_ATTACK_PATTERN);
  return batchCreators.map((b) => b.edges.length > 0);
};