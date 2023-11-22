import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import type { AuthContext, AuthUser } from '../../types/user';
import { createEntity, loadEntity, updateAttribute } from '../../database/middleware';
import type { BasicStoreEntityEntitySetting } from './entitySetting-types';
import { ENTITY_TYPE_ENTITY_SETTING } from './entitySetting-types';
import { listAllEntities, listEntitiesPaginated, storeLoadById } from '../../database/middleware-loader';
import type { EditInput, QueryEntitySettingsArgs } from '../../generated/graphql';
import { FilterMode } from '../../generated/graphql';
import { SYSTEM_USER } from '../../utils/access';
import { notify } from '../../database/redis';
import { BUS_TOPICS } from '../../config/conf';
import { defaultEntitySetting, getAvailableSettings, type typeAvailableSetting } from './entitySetting-utils';
import { queryDefaultSubTypes } from '../../domain/subType';
import { publishUserAction } from '../../listener/UserActionListener';
import { telemetry } from '../../config/tracing';

// -- LOADING --

export const findById = async (context: AuthContext, user: AuthUser, entitySettingId: string): Promise<BasicStoreEntityEntitySetting> => {
  return storeLoadById(context, user, entitySettingId, ENTITY_TYPE_ENTITY_SETTING);
};

export const findByType = async (context: AuthContext, user: AuthUser, targetType: string): Promise<BasicStoreEntityEntitySetting> => {
  const findByTypeFn = async () => {
    return loadEntity(context, user, [ENTITY_TYPE_ENTITY_SETTING], {
      filters: {
        mode: 'and',
        filters: [{ key: 'target_type', values: [targetType] }],
        filterGroups: [],
      }
    });
  };
  return telemetry(context, user, 'QUERY entitySetting', {
    [SemanticAttributes.DB_NAME]: 'entitySetting_domain',
    [SemanticAttributes.DB_OPERATION]: 'read',
  }, findByTypeFn);
};

export const batchEntitySettingsByType = async (context: AuthContext, user: AuthUser, targetTypes: string[]) => {
  const findByTypeFn = async () => {
    const entitySettings = await listAllEntities<BasicStoreEntityEntitySetting>(context, user, [ENTITY_TYPE_ENTITY_SETTING], {
      filters: {
        mode: FilterMode.And,
        filters: [{ key: ['target_type'], values: targetTypes }],
        filterGroups: [],
      },
      connectionFormat: false
    });
    return targetTypes.map((targetType) => entitySettings.find((entitySetting) => entitySetting.target_type === targetType));
  };
  return telemetry(context, user, 'BATCH entitySettings', {
    [SemanticAttributes.DB_NAME]: 'entitySetting_domain',
    [SemanticAttributes.DB_OPERATION]: 'read',
  }, findByTypeFn);
};

export const findAll = (context: AuthContext, user: AuthUser, opts: QueryEntitySettingsArgs) => {
  return listEntitiesPaginated<BasicStoreEntityEntitySetting>(context, user, [ENTITY_TYPE_ENTITY_SETTING], opts);
};

export const entitySettingEditField = async (context: AuthContext, user: AuthUser, entitySettingId: string, input: EditInput[]) => {
  const { element } = await updateAttribute(context, user, entitySettingId, ENTITY_TYPE_ENTITY_SETTING, input);
  await publishUserAction({
    user,
    event_type: 'mutation',
    event_scope: 'update',
    event_access: 'administration',
    message: `updates \`${input.map((i) => i.key).join(', ')}\` for entity setting \`${element.target_type}\``,
    context_data: { id: entitySettingId, entity_type: element.target_type, input }
  });
  return notify(BUS_TOPICS[ENTITY_TYPE_ENTITY_SETTING].EDIT_TOPIC, element, user);
};

export const entitySettingsEditField = async (context: AuthContext, user: AuthUser, entitySettingIds: string[], input: EditInput[]) => {
  return Promise.all(entitySettingIds.map((entitySettingId) => entitySettingEditField(context, user, entitySettingId, input)));
};

// -- INITIALIZATION --

export const addEntitySetting = async (context: AuthContext, user: AuthUser, entitySetting: Record<string, typeAvailableSetting>) => {
  const created = await createEntity(context, user, entitySetting, ENTITY_TYPE_ENTITY_SETTING);
  await notify(BUS_TOPICS[ENTITY_TYPE_ENTITY_SETTING].ADDED_TOPIC, created, user);
};

export const initCreateEntitySettings = async (context: AuthContext, user: AuthUser) => {
  // First check existing
  const subTypes = await queryDefaultSubTypes(context, user);
  // Get all current settings
  const entitySettings = await listAllEntities<BasicStoreEntityEntitySetting>(context, SYSTEM_USER, [ENTITY_TYPE_ENTITY_SETTING], { connectionFormat: false });
  const currentEntityTypes = entitySettings.map((e) => e.target_type);
  for (let index = 0; index < subTypes.edges.length; index += 1) {
    const entityType = subTypes.edges[index].node.id;
    // If setting not yet initialize, do it
    if (!currentEntityTypes.includes(entityType)) {
      const availableSettings = getAvailableSettings(entityType);
      const entitySetting: Record<string, typeAvailableSetting> = {
        target_type: entityType
      };
      availableSettings.forEach((key) => {
        if (defaultEntitySetting[key] !== undefined) {
          entitySetting[key] = defaultEntitySetting[key];
        }
      });
      await addEntitySetting(context, SYSTEM_USER, entitySetting);
    }
  }
};
