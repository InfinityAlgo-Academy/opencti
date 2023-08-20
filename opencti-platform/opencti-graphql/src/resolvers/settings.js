import { withFilter } from 'graphql-subscriptions';
import * as R from 'ramda';
import nconf from 'nconf';
import { BUS_TOPICS } from '../config/conf';
import {
  getApplicationInfo,
  getMessages,
  getSettings,
  settingDeleteMessage,
  settingEditMessage,
  settingsCleanContext,
  settingsEditContext,
  settingsEditField,
} from '../domain/settings';
import { fetchEditContext, pubSubAsyncIterator } from '../database/redis';
import withCancel from '../graphql/subscriptionWrapper';
import { ENTITY_TYPE_SETTINGS } from '../schema/internalObject';
import { elAggregationCount } from '../database/engine';
import { findById } from '../modules/organization/organization-domain';
import { READ_DATA_INDICES } from '../database/utils';
import { internalFindByIds } from '../database/middleware-loader';
import { getEntityFromCache } from '../database/cache';
import { SYSTEM_USER } from '../utils/access';

const settingsResolvers = {
  Query: {
    about: (_, __, context) => getApplicationInfo(context),
    settings: (_, __, context) => getSettings(context),
  },
  AppDebugStatistics: {
    objects: (_, __, context) => elAggregationCount(context, context.user, READ_DATA_INDICES, { types: ['Stix-Object'], field: 'entity_type' }),
    relationships: (_, __, context) => elAggregationCount(context, context.user, READ_DATA_INDICES, { types: ['stix-relationship'], field: 'entity_type' }),
  },
  Settings: {
    platform_session_idle_timeout: () => Number(nconf.get('app:session_idle_timeout')),
    platform_session_timeout: () => Number(nconf.get('app:session_timeout')),
    platform_organization: (settings, __, context) => findById(context, context.user, settings.platform_organization),
    activity_listeners: (settings, __, context) => internalFindByIds(context, context.user, settings.activity_listeners_ids),
    otp_mandatory: (settings) => settings.otp_mandatory ?? false,
    password_policy_min_length: (settings) => settings.password_policy_min_length ?? 0,
    password_policy_max_length: (settings) => settings.password_policy_max_length ?? 0,
    password_policy_min_symbols: (settings) => settings.password_policy_min_symbols ?? 0,
    password_policy_min_numbers: (settings) => settings.password_policy_min_numbers ?? 0,
    password_policy_min_words: (settings) => settings.password_policy_min_words ?? 0,
    password_policy_min_lowercase: (settings) => settings.password_policy_min_lowercase ?? 0,
    password_policy_min_uppercase: (settings) => settings.password_policy_min_uppercase ?? 0,
    editContext: (settings) => fetchEditContext(settings.id),
    messages: (settings) => getMessages(settings),
  },
  Mutation: {
    settingsEdit: (_, { id }, context) => ({
      fieldPatch: ({ input }) => settingsEditField(context, context.user, id, input),
      contextPatch: ({ input }) => settingsEditContext(context, context.user, id, input),
      contextClean: () => settingsCleanContext(context, context.user, id),
      editMessage: ({ input }) => settingEditMessage(context, context.user, id, input),
      deleteMessage: ({ input }) => settingDeleteMessage(context, context.user, id, input),
    }),
  },
  Subscription: {
    settings: {
      resolve: /* istanbul ignore next */ (payload) => payload.instance,
      subscribe: /* istanbul ignore next */ (_, { id }, context) => {
        settingsEditContext(context, context.user, id);
        const filtering = withFilter(
          () => pubSubAsyncIterator(BUS_TOPICS[ENTITY_TYPE_SETTINGS].EDIT_TOPIC),
          (payload) => {
            if (!payload) return false; // When disconnect, an empty payload is dispatched.
            return payload.user.id !== context.user.id && payload.instance.id === id;
          }
        )(_, { id }, context);
        return withCancel(filtering, () => {
          settingsCleanContext(context, context.user, id);
        });
      },
    },
    settingsMessages: {
      resolve: /* istanbul ignore next */ (payload) => payload.instance,
      subscribe: /* istanbul ignore next */ async (_, __, context) => {
        const asyncIterator = pubSubAsyncIterator(BUS_TOPICS[ENTITY_TYPE_SETTINGS].EDIT_TOPIC);
        const settings = await getEntityFromCache(context, SYSTEM_USER, ENTITY_TYPE_SETTINGS);
        const filtering = withFilter(() => asyncIterator, (payload) => {
          const oldMessages = getMessages(settings);
          const newMessages = getMessages(payload.instance);
          // If removed and was activated
          const removedMessage = R.difference(oldMessages, newMessages);
          if (removedMessage.length === 1 && removedMessage[0].activated) {
            return true;
          }
          return newMessages.some((nm) => {
            const find = oldMessages.find((om) => nm.id === om.id);
            // If existing, change when property activated change OR when message change and status is activated
            if (find) {
              return (nm.activated !== find.activated) || (nm.activated && nm.message !== find.message);
            }
            // If new, change when message is activated
            return nm.activated;
          });
        })();
        return {
          [Symbol.asyncIterator]() {
            return filtering;
          }
        };
      },
    }
  },
};

export default settingsResolvers;
