import { assoc } from 'ramda';
import { delEditContext, notify, setEditContext } from '../database/redis';
import {
  createEntity,
  deleteEntityById,
  executeWrite,
  listEntities,
  loadEntityById,
  updateAttribute,
} from '../database/grakn';
import { BUS_TOPICS } from '../config/conf';
import { ENTITY_TYPE_LABEL } from '../utils/idGenerator';

export const findById = (labelId) => {
  return loadEntityById(labelId, ENTITY_TYPE_LABEL);
};

export const findAll = (args) => {
  return listEntities([ENTITY_TYPE_LABEL], ['value'], args);
};

export const addLabel = async (user, label) => {
  const created = await createEntity(
    user,
    assoc('color', label.color ? label.color : '#f58787', label),
    ENTITY_TYPE_LABEL,
    { noLog: true }
  );
  return notify(BUS_TOPICS[ENTITY_TYPE_LABEL].ADDED_TOPIC, created, user);
};

export const labelDelete = (user, labelId) => deleteEntityById(user, labelId, ENTITY_TYPE_LABEL, { noLog: true });

export const labelEditField = (user, labelId, input) => {
  return executeWrite((wTx) => {
    return updateAttribute(user, labelId, ENTITY_TYPE_LABEL, input, wTx, { noLog: true });
  }).then(async () => {
    const label = await loadEntityById(labelId, ENTITY_TYPE_LABEL);
    return notify(BUS_TOPICS[ENTITY_TYPE_LABEL].EDIT_TOPIC, label, user);
  });
};

export const labelCleanContext = async (user, labelId) => {
  await delEditContext(user, labelId);
  return loadEntityById(labelId, ENTITY_TYPE_LABEL).then((label) =>
    notify(BUS_TOPICS[ENTITY_TYPE_LABEL].EDIT_TOPIC, label, user)
  );
};

export const labelEditContext = async (user, labelId, input) => {
  await setEditContext(user, labelId, input);
  return loadEntityById(labelId, ENTITY_TYPE_LABEL).then((label) =>
    notify(BUS_TOPICS[ENTITY_TYPE_LABEL].EDIT_TOPIC, label, user)
  );
};
