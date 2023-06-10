import {
  batchListThroughGetFrom,
  batchListThroughGetTo,
  createRelation,
  deleteElementById,
  deleteRelationsByFromAndTo,
  listThroughGetFrom,
  updateAttribute,
} from '../database/middleware';
import { listEntities, storeLoadById } from '../database/middleware-loader';
import { BUS_TOPICS } from '../config/conf';
import { delEditContext, notify, setEditContext } from '../database/redis';
import { ENTITY_TYPE_GROUP, ENTITY_TYPE_ROLE, ENTITY_TYPE_USER } from '../schema/internalObject';
import {
  isInternalRelationship,
  RELATION_ACCESSES_TO,
  RELATION_HAS_ROLE,
  RELATION_MEMBER_OF
} from '../schema/internalRelationship';
import { FunctionalError } from '../config/errors';
import { ABSTRACT_INTERNAL_RELATIONSHIP } from '../schema/general';
import { ENTITY_TYPE_MARKING_DEFINITION } from '../schema/stixMetaObject';
import { findSessionsForUsers, markSessionForRefresh } from '../database/session';
import { publishUserAction } from '../listener/UserActionListener';
import { extractEntityRepresentative } from '../database/utils';

export const GROUP_DEFAULT = 'Default';

const groupSessionRefresh = async (context, user, groupId) => {
  const members = await listThroughGetFrom(context, user, [groupId], RELATION_MEMBER_OF, ENTITY_TYPE_USER);
  const sessions = await findSessionsForUsers(members.map((e) => e.internal_id));
  await Promise.all(sessions.map((s) => markSessionForRefresh(s.id)));
};

export const findById = (context, user, groupId) => {
  return storeLoadById(context, user, groupId, ENTITY_TYPE_GROUP);
};

export const findAll = (context, user, args) => {
  return listEntities(context, user, [ENTITY_TYPE_GROUP], args);
};

export const batchMembers = async (context, user, groupIds, opts = {}) => {
  return batchListThroughGetFrom(context, user, groupIds, RELATION_MEMBER_OF, ENTITY_TYPE_USER, opts);
};

export const batchMarkingDefinitions = async (context, user, groupIds) => {
  const opts = { paginate: false };
  return batchListThroughGetTo(context, user, groupIds, RELATION_ACCESSES_TO, ENTITY_TYPE_MARKING_DEFINITION, opts);
};

export const batchRoles = async (context, user, groupIds) => {
  const opts = { paginate: false };
  return batchListThroughGetTo(context, user, groupIds, RELATION_HAS_ROLE, ENTITY_TYPE_ROLE, opts);
};

export const groupDelete = async (context, user, groupId) => {
  const group = await deleteElementById(context, user, groupId, ENTITY_TYPE_GROUP);
  await publishUserAction({
    user,
    event_type: 'admin',
    status: 'success',
    message: `deletes group \`${group.name}\``,
    context_data: { entity_type: ENTITY_TYPE_GROUP, operation: 'delete', input: group }
  });
  return groupId;
};

export const groupEditField = async (context, user, groupId, input) => {
  const { element } = await updateAttribute(context, user, groupId, ENTITY_TYPE_GROUP, input);
  await publishUserAction({
    user,
    event_type: 'admin',
    status: 'success',
    message: `updates \`${input.map((i) => i.key).join(', ')}\` for group \`${element.name}\``,
    context_data: { entity_type: ENTITY_TYPE_GROUP, operation: 'update', input }
  });
  return notify(BUS_TOPICS[ENTITY_TYPE_GROUP].EDIT_TOPIC, element, user);
};

export const groupAddRelation = async (context, user, groupId, input) => {
  const group = await storeLoadById(context, user, groupId, ENTITY_TYPE_GROUP);
  if (!group) {
    throw FunctionalError('Cannot add the relation, Group cannot be found.');
  }
  if (!isInternalRelationship(input.relationship_type)) {
    throw FunctionalError(`Only ${ABSTRACT_INTERNAL_RELATIONSHIP} can be added through this method.`);
  }
  let finalInput;
  if (input.fromId) {
    finalInput = { ...input, toId: groupId };
  } else if (input.toId) {
    finalInput = { ...input, fromId: groupId };
  }
  const createdRelation = await createRelation(context, user, finalInput);
  const created = input.fromId ? createdRelation.from : createdRelation.to;
  await publishUserAction({
    user,
    event_type: 'admin',
    status: 'success',
    message: `adds ${created.entity_type} \`${extractEntityRepresentative(created)}\` for group \`${group.name}\``,
    context_data: { entity_type: ENTITY_TYPE_USER, operation: 'update', input }
  });
  await groupSessionRefresh(context, user, groupId);
  return notify(BUS_TOPICS[ENTITY_TYPE_GROUP].EDIT_TOPIC, createdRelation, user);
};

export const groupDeleteRelation = async (context, user, groupId, fromId, toId, relationshipType) => {
  const group = await storeLoadById(context, user, groupId, ENTITY_TYPE_GROUP);
  if (!group) {
    throw FunctionalError('Cannot delete the relation, Group cannot be found.');
  }
  if (!isInternalRelationship(relationshipType)) {
    throw FunctionalError(`Only ${ABSTRACT_INTERNAL_RELATIONSHIP} can be deleted through this method.`);
  }
  let target;
  if (fromId) {
    const deleted = await deleteRelationsByFromAndTo(context, user, fromId, groupId, relationshipType, ABSTRACT_INTERNAL_RELATIONSHIP);
    target = deleted.from;
  } else if (toId) {
    const deleted = await deleteRelationsByFromAndTo(context, user, groupId, toId, relationshipType, ABSTRACT_INTERNAL_RELATIONSHIP);
    target = deleted.to;
  }
  await publishUserAction({
    user,
    event_type: 'admin',
    status: 'success',
    message: `removes ${target.entity_type} \`${extractEntityRepresentative(target)}\` for group \`${group.name}\``,
    context_data: { entity_type: ENTITY_TYPE_ROLE, operation: 'delete', input: { groupId, fromId, toId, relationshipType } }
  });
  await groupSessionRefresh(context, user, groupId);
  return notify(BUS_TOPICS[ENTITY_TYPE_GROUP].EDIT_TOPIC, group, user);
};

export const groupCleanContext = async (context, user, groupId) => {
  await delEditContext(user, groupId);
  return storeLoadById(context, user, groupId, ENTITY_TYPE_GROUP).then((group) => notify(BUS_TOPICS.Group.EDIT_TOPIC, group, user));
};

export const groupEditContext = async (context, user, groupId, input) => {
  await setEditContext(user, groupId, input);
  return storeLoadById(context, user, groupId, ENTITY_TYPE_GROUP).then((group) => notify(BUS_TOPICS.Group.EDIT_TOPIC, group, user));
};
