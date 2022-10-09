import { pipe, assoc } from 'ramda';
import { delEditContext, notify, setEditContext } from '../database/redis';
import { createEntity, createRelation, deleteElementById, storeLoadById, updateAttribute } from '../database/middleware';
import { listEntities } from '../database/middleware-loader';
import { BUS_TOPICS } from '../config/conf';
import { ENTITY_TYPE_KILL_CHAIN_PHASE } from '../schema/stixMetaObject';
import { RELATION_KILL_CHAIN_PHASE } from '../schema/stixMetaRelationship';

export const findById = (context, user, killChainPhaseId) => {
  return storeLoadById(context, user, killChainPhaseId, ENTITY_TYPE_KILL_CHAIN_PHASE);
};

export const findAll = (context, user, args) => {
  return listEntities(context, user, [ENTITY_TYPE_KILL_CHAIN_PHASE], args);
};

export const addKillChainPhase = async (context, user, killChainPhase) => {
  const phaseOrder = killChainPhase.x_opencti_order ? killChainPhase.x_opencti_order : 0;
  const killChainPhaseToCreate = assoc('x_opencti_order', phaseOrder, killChainPhase);
  const created = await createEntity(context, user, killChainPhaseToCreate, ENTITY_TYPE_KILL_CHAIN_PHASE);
  return notify(BUS_TOPICS[ENTITY_TYPE_KILL_CHAIN_PHASE].ADDED_TOPIC, created, user);
};

export const killChainPhaseDelete = (context, user, killChainPhaseId) => {
  return deleteElementById(context, user, killChainPhaseId, ENTITY_TYPE_KILL_CHAIN_PHASE);
};

export const killChainPhaseAddRelation = (context, user, killChainPhaseId, input) => {
  const finalInput = pipe(
    assoc('toId', killChainPhaseId),
    assoc('relationship_type', RELATION_KILL_CHAIN_PHASE)
  )(input);
  return createRelation(context, user, finalInput).then((relationData) => {
    notify(BUS_TOPICS[ENTITY_TYPE_KILL_CHAIN_PHASE].EDIT_TOPIC, relationData, user);
    return relationData;
  });
};

export const killChainPhaseDeleteRelation = async (context, user, killChainPhaseId, relationId) => {
  await deleteElementById(context, user, relationId, RELATION_KILL_CHAIN_PHASE);
  const data = await storeLoadById(context, user, killChainPhaseId, ENTITY_TYPE_KILL_CHAIN_PHASE);
  return notify(BUS_TOPICS[ENTITY_TYPE_KILL_CHAIN_PHASE].EDIT_TOPIC, data, user);
};

export const killChainPhaseEditField = async (context, user, killChainPhaseId, input, opts = {}) => {
  const { element } = await updateAttribute(context, user, killChainPhaseId, ENTITY_TYPE_KILL_CHAIN_PHASE, input, opts);
  return notify(BUS_TOPICS[ENTITY_TYPE_KILL_CHAIN_PHASE].EDIT_TOPIC, element, user);
};

export const killChainPhaseCleanContext = async (context, user, killChainPhaseId) => {
  await delEditContext(user, killChainPhaseId);
  return storeLoadById(context, user, killChainPhaseId, ENTITY_TYPE_KILL_CHAIN_PHASE).then((killChainPhase) => {
    return notify(BUS_TOPICS[ENTITY_TYPE_KILL_CHAIN_PHASE].EDIT_TOPIC, killChainPhase, user);
  });
};

export const killChainPhaseEditContext = async (context, user, killChainPhaseId, input) => {
  await setEditContext(user, killChainPhaseId, input);
  return storeLoadById(context, user, killChainPhaseId, ENTITY_TYPE_KILL_CHAIN_PHASE).then((killChainPhase) => {
    return notify(BUS_TOPICS[ENTITY_TYPE_KILL_CHAIN_PHASE].EDIT_TOPIC, killChainPhase, user);
  });
};
