import * as R from 'ramda';
import { uniq } from 'ramda';
import { ENTITY_TYPE_CASE_TEMPLATE } from '../modules/case/case-template/case-template-types';
import { now } from '../utils/format';
import { BYPASS, MEMBER_ACCESS_RIGHT_ADMIN, SETTINGS_SET_ACCESSES } from '../utils/access';
import { isKnowledge, KNOWLEDGE_DELETE, KNOWLEDGE_UPDATE } from '../schema/general';
import { ForbiddenAccess } from '../config/errors';
import { ENTITY_TYPE_NOTIFICATION } from '../modules/notification/notification-types';
import { isStixCoreObject } from '../schema/stixCoreObject';
import { isStixCoreRelationship } from '../schema/stixCoreRelationship';
import { internalLoadById, storeLoadById } from '../database/middleware-loader';
import { getParentTypes } from '../schema/schemaUtils';
import { ENTITY_TYPE_VOCABULARY } from '../modules/vocabulary/vocabulary-types';
import { ENTITY_TYPE_LABEL } from '../schema/stixMetaObject';
import { isStixSightingRelationship } from '../schema/stixSightingRelationship';

export const TASK_TYPE_QUERY = 'QUERY';
export const TASK_TYPE_RULE = 'RULE';
export const TASK_TYPE_LIST = 'LIST';

export const ACTION_TYPE_DELETE = 'DELETE';
export const ACTION_TYPE_SHARE = 'SHARE';
export const ACTION_TYPE_UNSHARE = 'UNSHARE';

const areParentTypesKnowledge = (parentTypes) => parentTypes && parentTypes.flat().every((type) => isKnowledge(type));

// check a user has the right to create a list or a query background task
export const checkActionValidity = async (context, user, input, scope, taskType) => {
  const { actions, filters: baseFilterObject, ids } = input;
  const filters = (baseFilterObject && JSON.parse(baseFilterObject)?.filters) ?? [];
  const typeFilters = filters.filter((f) => f.key.includes('entity_type'));
  const typeFiltersValues = typeFilters.map((f) => f.values).flat();
  const userCapabilities = R.flatten(user.capabilities.map((c) => c.name.split('_')));
  if (scope === 'SETTINGS') {
    const isAuthorized = userCapabilities.includes(BYPASS) || userCapabilities.includes('SETTINGS');
    if (!isAuthorized) {
      throw ForbiddenAccess();
    }
  } else if (scope === 'KNOWLEDGE') { // 01. Background task of scope Knowledge
    // 1.1. The user should have the capability KNOWLEDGE_UPDATE
    const isAuthorized = userCapabilities.includes(BYPASS) || userCapabilities.includes(KNOWLEDGE_UPDATE);
    if (!isAuthorized) {
      throw ForbiddenAccess();
    }
    const askForDeletion = actions.filter((a) => a.type === ACTION_TYPE_DELETE).length > 0;
    if (askForDeletion) {
      // 1.2. If deletion action available, the user should have the capability KNOWLEDGE_DELETE
      const isDeletionAuthorized = userCapabilities.includes(BYPASS) || userCapabilities.includes(KNOWLEDGE_DELETE);
      if (!isDeletionAuthorized) {
        throw ForbiddenAccess();
      }
    }
    // 1.3. Check the modified entities are of type Knowledge
    if (taskType === TASK_TYPE_QUERY) {
      const parentTypes = typeFiltersValues.map((n) => getParentTypes(n));
      const isNotKnowledges = !areParentTypesKnowledge(parentTypes) || typeFiltersValues.some((type) => type === ENTITY_TYPE_VOCABULARY);
      if (isNotKnowledges) {
        throw ForbiddenAccess(undefined, 'The targeted ids are not knowledges.');
      }
    } else if (taskType === TASK_TYPE_LIST) {
      const objects = await Promise.all(ids.map((id) => internalLoadById(context, user, id)));
      const isNotKnowledges = objects.includes(undefined)
        || !areParentTypesKnowledge(objects.map((o) => o.parent_types))
        || objects.some(({ entity_type }) => entity_type === ENTITY_TYPE_VOCABULARY);
      if (isNotKnowledges) {
        throw ForbiddenAccess(undefined, 'The targeted ids are not knowledges.');
      }
    } else {
      throw Error('A background task should be of type query or list.');
    }
  } else if (scope === 'USER') { // 02. Background task of scope Notification
    // Check the modified entities are Notifications
    // and the user has the right to modify them (= notifications are the ones of the user OR the user has SET_ACCESS capability)
    if (taskType === TASK_TYPE_QUERY) {
      const isNotifications = typeFilters.length === 1
        && typeFilters[0].values.length === 1
        && typeFilters[0].values[0] === 'Notification';
      if (!isNotifications) {
        throw ForbiddenAccess(undefined, 'The targeted ids are not notifications.');
      }
      const userFilters = filters.filter((f) => f.key === 'user_id');
      const isUserData = userFilters.length > 0
        && userFilters[0].values.length === 1
        && userFilters[0].values[0] === user.id;
      const isAuthorized = userCapabilities.includes(BYPASS) || userCapabilities.includes(SETTINGS_SET_ACCESSES) || isUserData;
      if (!isAuthorized) {
        throw ForbiddenAccess();
      }
    } else if (taskType === TASK_TYPE_LIST) {
      const objects = await Promise.all(ids.map((id) => storeLoadById(context, user, id, ENTITY_TYPE_NOTIFICATION)));
      const isNotNotifications = objects.includes(undefined);
      if (isNotNotifications) {
        throw ForbiddenAccess(undefined, 'The targeted ids are not notifications.');
      }
      const notificationsUsers = uniq(objects.map((o) => o.user_id));
      const isUserData = notificationsUsers.length === 1 && notificationsUsers.includes(user.id);
      const isAuthorized = userCapabilities.includes(BYPASS) || userCapabilities.includes(SETTINGS_SET_ACCESSES) || isUserData;
      if (!isAuthorized) {
        throw ForbiddenAccess();
      }
    } else {
      throw Error('A background task should be of type query or list.');
    }
  } else { // 03. Background task with an invalid scope
    throw Error('A background task should be of scope Settings, Knowledge or User.');
  }
};

export const createDefaultTask = (user, taskType, taskExpectedNumber, scope = undefined) => {
  const task = {
    initiator_id: user.internal_id,
    created_at: now(),
    completed: false,
    // Task related
    type: taskType,
    last_execution_date: null,
    task_position: null, // To mark the progress.
    task_processed_number: 0, // Initial number of processed element
    task_expected_number: taskExpectedNumber, // Expected number of element processed
    errors: [], // To stock the errors
  };
  if (scope) { // add rights for query tasks and list tasks
    task.scope = scope;
    task.authorized_members = authorizedMembersForTask(user, scope);
    task.authorized_authorities = authorizedAuthoritiesForTask(scope);
  }
  return task;
};

const authorizedAuthoritiesForTask = (scope) => {
  switch (scope) {
    case 'SETTINGS':
      return ['SETTINGS'];
    case 'KNOWLEDGE':
      return ['KNOWLEDGE_KNUPDATE'];
    case 'USER':
      return [SETTINGS_SET_ACCESSES];
    default:
      return [];
  }
};

const authorizedMembersForTask = (user, scope) => {
  switch (scope) {
    case 'SETTINGS':
    case 'KNOWLEDGE':
    case 'USER':
      return [{ id: user.id, access_right: MEMBER_ACCESS_RIGHT_ADMIN }];
    default:
      return [];
  }
};

export const isTaskEnabledEntity = (entityType) => {
  return isStixCoreObject(entityType)
    || isStixCoreRelationship(entityType)
    || isStixSightingRelationship(entityType)
    || [
      ENTITY_TYPE_VOCABULARY,
      ENTITY_TYPE_NOTIFICATION,
      ENTITY_TYPE_CASE_TEMPLATE,
      ENTITY_TYPE_LABEL
    ].includes(entityType);
};
