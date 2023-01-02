import { getHeapStatistics } from 'v8';
import { createEntity, updateAttribute, loadEntity } from '../database/middleware';
import conf, {
  BUS_TOPICS,
  ENABLED_EXPIRED_MANAGER,
  ENABLED_RULE_ENGINE,
  ENABLED_TASK_SCHEDULER,
  ENABLED_SUBSCRIPTION_MANAGER,
  PLATFORM_VERSION,
  ENABLED_SYNC_MANAGER,
  ENABLED_RETENTION_MANAGER,
  baseUrl, ENABLED_HISTORY_MANAGER
} from '../config/conf';
import { delEditContext, getRedisVersion, notify, setEditContext } from '../database/redis';
import { searchEngineVersion, isRuntimeSortEnable } from '../database/engine';
import { getRabbitMQVersion } from '../database/rabbitmq';
import { ENTITY_TYPE_SETTINGS } from '../schema/internalObject';
import { isUserHasCapability, SETTINGS_SET_ACCESSES, SYSTEM_USER } from '../utils/access';
import { storeLoadById } from '../database/middleware-loader';

export const getMemoryStatistics = () => {
  return { ...process.memoryUsage(), ...getHeapStatistics() };
};

export const getModules = () => {
  const modules = [];
  modules.push({ id: 'EXPIRATION_SCHEDULER', enable: ENABLED_EXPIRED_MANAGER });
  modules.push({ id: 'TASK_MANAGER', enable: ENABLED_TASK_SCHEDULER });
  modules.push({ id: 'RULE_ENGINE', enable: ENABLED_RULE_ENGINE });
  modules.push({ id: 'SUBSCRIPTION_MANAGER', enable: ENABLED_SUBSCRIPTION_MANAGER });
  modules.push({ id: 'SYNC_MANAGER', enable: ENABLED_SYNC_MANAGER });
  modules.push({ id: 'RETENTION_MANAGER', enable: ENABLED_RETENTION_MANAGER });
  modules.push({ id: 'HISTORY_MANAGER', enable: ENABLED_HISTORY_MANAGER });
  return modules;
};

export const getApplicationInfo = (context) => ({
  version: PLATFORM_VERSION,
  memory: getMemoryStatistics(),
  dependencies: [
    { name: 'Search engine', version: searchEngineVersion().then((v) => `${v.distribution || 'elk'} - ${v.number}`) },
    { name: 'RabbitMQ', version: getRabbitMQVersion(context) },
    { name: 'Redis', version: getRedisVersion() },
  ],
  debugStats: {}, // Lazy loaded
});

export const getSettings = async (context) => {
  const platformSettings = await loadEntity(context, SYSTEM_USER, [ENTITY_TYPE_SETTINGS]);
  const featureFlags = [
    // List of specific feature flags
    { id: 'RUNTIME_SORTING', enable: isRuntimeSortEnable() },
  ];
  return {
    ...platformSettings,
    platform_url: baseUrl,
    platform_enable_reference: conf.get('app:enforce_references'),
    platform_reference_attachment: conf.get('app:reference_attachment'),
    platform_feature_flags: featureFlags,
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

export const settingsEditField = async (context, user, settingsId, input) => {
  const hasSetAccessCapability = isUserHasCapability(user, SETTINGS_SET_ACCESSES);
  const data = hasSetAccessCapability ? input : input.filter((i) => i.key !== 'platform_organization');
  const { element } = await updateAttribute(context, user, settingsId, ENTITY_TYPE_SETTINGS, data);
  return notify(BUS_TOPICS.Settings.EDIT_TOPIC, element, user);
};
