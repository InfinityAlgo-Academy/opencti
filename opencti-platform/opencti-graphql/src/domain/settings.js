import { getHeapStatistics } from 'node:v8';
import nconf from 'nconf';
import * as R from 'ramda';
import { createEntity, loadEntity, patchAttribute, updateAttribute } from '../database/middleware';
import conf, {
  ACCOUNT_STATUSES,
  BUS_TOPICS,
  ENABLED_DEMO_MODE,
  getBaseUrl,
  PLATFORM_VERSION
} from '../config/conf';
import { delEditContext, getClusterInstances, getRedisVersion, notify, setEditContext } from '../database/redis';
import { isRuntimeSortEnable, searchEngineVersion } from '../database/engine';
import { getRabbitMQVersion } from '../database/rabbitmq';
import { ENTITY_TYPE_SETTINGS } from '../schema/internalObject';
import { isUserHasCapability, SETTINGS_SET_ACCESSES, SYSTEM_USER } from '../utils/access';
import { storeLoadById } from '../database/middleware-loader';
import { INTERNAL_SECURITY_PROVIDER, PROVIDERS } from '../config/providers';
import { publishUserAction } from '../listener/UserActionListener';
import { getEntityFromCache } from '../database/cache';
import { now } from '../utils/format';
import { generateInternalId } from '../schema/identifier';
import { UnsupportedError } from '../config/errors';

export const getMemoryStatistics = () => {
  return { ...process.memoryUsage(), ...getHeapStatistics() };
};

const getClusterInformation = async () => {
  const clusterConfig = await getClusterInstances();
  const info = { instances_number: clusterConfig.length };
  const allManagers = clusterConfig.map((i) => i.managers).flat();
  const groupManagersById = R.groupBy((manager) => manager.id, allManagers);
  const modules = Object.entries(groupManagersById).map(([id, managers]) => ({
    id,
    enable: managers.reduce((acc, m) => acc || m.enable, false),
    running: managers.reduce((acc, m) => acc || m.running, false),
    warning: managers.reduce((acc, m) => acc || m.warning, false),
  }));
  return { info, modules };
};

export const isModuleActivated = async (moduleId) => {
  const clusterInfo = await getClusterInformation();
  const module = clusterInfo.modules.find((m) => m.id === moduleId);
  return module ? module.enable : false;
};

export const getApplicationInfo = (context) => ({
  version: PLATFORM_VERSION,
  memory: getMemoryStatistics(),
  dependencies: [
    { name: 'Search engine', version: searchEngineVersion().then((v) => `${v.platform} - ${v.version}`) },
    { name: 'RabbitMQ', version: getRabbitMQVersion(context) },
    { name: 'Redis', version: getRedisVersion() },
  ],
  debugStats: {}, // Lazy loaded
});

export const getSettings = async (context) => {
  const platformSettings = await loadEntity(context, SYSTEM_USER, [ENTITY_TYPE_SETTINGS]);
  const clusterInfo = await getClusterInformation();
  return {
    ...platformSettings,
    platform_url: getBaseUrl(context.req),
    platform_providers: PROVIDERS.filter((p) => p.name !== INTERNAL_SECURITY_PROVIDER),
    platform_user_statuses: Object.entries(ACCOUNT_STATUSES).map(([k, v]) => ({ status: k, message: v })),
    platform_cluster: clusterInfo.info,
    platform_demo: ENABLED_DEMO_MODE,
    platform_modules: clusterInfo.modules,
    platform_reference_attachment: conf.get('app:reference_attachment'),
    platform_map_tile_server_dark: nconf.get('app:map_tile_server_dark'),
    platform_map_tile_server_light: nconf.get('app:map_tile_server_light'),
    platform_feature_flags: [
      { id: 'RUNTIME_SORTING', enable: isRuntimeSortEnable() },
    ],
  };
};

export const addSettings = async (context, user, settings) => {
  const created = await createEntity(context, user, settings, ENTITY_TYPE_SETTINGS);
  return notify(BUS_TOPICS.Settings.ADDED_TOPIC, created, user);
};

export const settingsCleanContext = (context, user, settingsId) => {
  delEditContext(user, settingsId);
  return storeLoadById(context, user, settingsId, ENTITY_TYPE_SETTINGS).then((settings) => notify(BUS_TOPICS.Settings.EDIT_TOPIC, settings, user));
};

export const settingsEditContext = (context, user, settingsId, input) => {
  setEditContext(user, settingsId, input);
  return storeLoadById(context, user, settingsId, ENTITY_TYPE_SETTINGS).then((settings) => notify(BUS_TOPICS.Settings.EDIT_TOPIC, settings, user));
};

const ACCESS_SETTINGS_RESTRICTED_KEYS = [
  'platform_organization',
  'otp_mandatory',
  'password_policy_min_length',
  'password_policy_max_length',
  'password_policy_min_symbols',
  'password_policy_min_numbers',
  'password_policy_min_words',
  'password_policy_min_lowercase',
  'password_policy_min_uppercase',
];
export const settingsEditField = async (context, user, settingsId, input) => {
  const hasSetAccessCapability = isUserHasCapability(user, SETTINGS_SET_ACCESSES);
  const data = hasSetAccessCapability ? input : input.filter((i) => !ACCESS_SETTINGS_RESTRICTED_KEYS.includes(i.key));
  await updateAttribute(context, user, settingsId, ENTITY_TYPE_SETTINGS, data);
  await publishUserAction({
    user,
    event_type: 'mutation',
    event_scope: 'update',
    event_access: 'administration',
    message: `updates \`${input.map((i) => i.key).join(', ')}\` for \`platform settings\``,
    context_data: { id: settingsId, entity_type: ENTITY_TYPE_SETTINGS, input }
  });
  const updatedSettings = await getSettings(context);
  return notify(BUS_TOPICS.Settings.EDIT_TOPIC, updatedSettings, user);
};

export const getMessages = (settings) => {
  return JSON.parse(settings.messages ?? '[]');
};

export const settingEditMessage = async (context, user, settingsId, message) => {
  const messageToStore = {
    ...message,
    updated_at: now()
  };
  const settings = await getEntityFromCache(context, user, ENTITY_TYPE_SETTINGS);
  const messages = getMessages(settings);

  const existingIdx = messages.findIndex((m) => m.id === message.id);
  if (existingIdx > -1) {
    messages[existingIdx] = messageToStore;
  } else {
    messages.push({
      ...messageToStore,
      id: generateInternalId()
    });
  }
  const patch = { messages: JSON.stringify(messages) };
  const { element } = await patchAttribute(context, user, settingsId, ENTITY_TYPE_SETTINGS, patch);
  return notify(BUS_TOPICS[ENTITY_TYPE_SETTINGS].EDIT_TOPIC, element, user);
};

export const settingDeleteMessage = async (context, user, settingsId, messageId) => {
  const settings = await getEntityFromCache(context, user, ENTITY_TYPE_SETTINGS);
  const messages = getMessages(settings);

  const existingIdx = messages.findIndex((m) => m.id === messageId);
  if (existingIdx > -1) {
    messages.splice(existingIdx, 1);
  } else {
    throw UnsupportedError('This message does not exist', { messageId });
  }
  const patch = { messages: JSON.stringify(messages) };
  const { element } = await patchAttribute(context, user, settingsId, ENTITY_TYPE_SETTINGS, patch);
  return notify(BUS_TOPICS[ENTITY_TYPE_SETTINGS].EDIT_TOPIC, element, user);
};

// -- AJV --

export const settingsMessages = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        minLength: 1
      },
      message: { type: 'string' },
      activated: { type: 'boolean' },
      updated_at: { type: 'string' },
      dismissible: { type: 'boolean' },
      color: { type: 'string' },
    },
    required: ['id', 'message', 'activated', 'updated_at', 'dismissible']
  },
};
