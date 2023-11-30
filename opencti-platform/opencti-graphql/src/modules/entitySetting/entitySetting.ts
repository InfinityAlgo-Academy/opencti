import type { StixEntitySetting, StoreEntityEntitySetting } from './entitySetting-types';
import { ENTITY_TYPE_ENTITY_SETTING } from './entitySetting-types';
import { ABSTRACT_INTERNAL_OBJECT } from '../../schema/general';
import entitySettingResolvers from './entitySetting-resolvers';
import entitySettingTypeDefs from './entitySetting.graphql';
import convertEntitySettingToStix from './entitySetting-converter';
import { attributeConfiguration, } from './entitySetting-utils';
import { type ModuleDefinition, registerDefinition } from '../../schema/module';
import { validateEntitySettingCreation, validateEntitySettingUpdate } from './entitySetting-validators';

const TARGET_TYPE = 'target_type';

const ENTITY_SETTING_DEFINITION: ModuleDefinition<StoreEntityEntitySetting, StixEntitySetting> = {
  type: {
    id: 'entitysettings',
    name: ENTITY_TYPE_ENTITY_SETTING,
    category: ABSTRACT_INTERNAL_OBJECT,
    aliased: false
  },
  graphql: {
    schema: entitySettingTypeDefs,
    resolver: entitySettingResolvers,
  },
  identifier: {
    definition: {
      [ENTITY_TYPE_ENTITY_SETTING]: [{ src: TARGET_TYPE }]
    },
    resolvers: {
      target_type(data: object) {
        return (data as unknown as string).toUpperCase();
      },
    },
  },
  attributes: [
    { name: 'target_type', type: 'string', mandatoryType: 'internal', editDefault: false, multiple: false, upsert: false },
    { name: 'platform_entity_files_ref', type: 'boolean', mandatoryType: 'external', editDefault: true, multiple: false, upsert: false },
    { name: 'platform_hidden_type', type: 'boolean', mandatoryType: 'external', editDefault: true, multiple: false, upsert: false },
    { name: 'enforce_reference', type: 'boolean', mandatoryType: 'external', editDefault: true, multiple: false, upsert: false },
    { name: 'attributes_configuration', type: 'json', mandatoryType: 'no', editDefault: false, multiple: false, upsert: false, schemaDef: attributeConfiguration },
    { name: 'availableSettings', type: 'string', mandatoryType: 'no', editDefault: false, multiple: true, upsert: false },
  ],
  relations: [],
  validators: {
    validatorCreation: validateEntitySettingCreation,
    validatorUpdate: validateEntitySettingUpdate
  },
  representative: (stix: StixEntitySetting) => {
    return stix.target_type;
  },
  converter: convertEntitySettingToStix
};

registerDefinition(ENTITY_SETTING_DEFINITION);
