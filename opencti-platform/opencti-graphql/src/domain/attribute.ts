import * as R from 'ramda';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { elAttributeValues } from '../database/engine';
import { schemaAttributesDefinition } from '../schema/schema-attributes';
import { buildPagination, isNotEmptyField } from '../database/utils';
import type { AuthContext, AuthUser } from '../types/user';
import type { QueryRuntimeAttributesArgs } from '../generated/graphql';
import { defaultScale, getAttributesConfiguration } from '../modules/entitySetting/entitySetting-utils';
import { schemaRelationsRefDefinition } from '../schema/schema-relationsRef';
import type { RelationRefDefinition } from '../schema/relationRef-definition';
import type { BasicStoreEntityEntitySetting } from '../modules/entitySetting/entitySetting-types';
import { internalFindByIds } from '../database/middleware-loader';
import type { BasicStoreEntity } from '../types/store';
import { telemetry } from '../config/tracing';

interface ScaleAttribute {
  name: string
  scale: string
}

export interface DefaultValue {
  id: string
  name: string
}

interface AttributeConfigMeta {
  name: string
  type: string
  mandatory: boolean
  mandatoryType: string
  multiple: boolean
  label?: string
  defaultValues?: DefaultValue[]
  scale?: string
}

// Returns a filtered list of AttributeConfigMeta objects built from schema attributes definition and
// stored entity settings attributes configuration (only attributes that can be customized in entity settings)
export const queryAttributesDefinition = async (context: AuthContext, user: AuthUser, entitySetting: BasicStoreEntityEntitySetting): Promise<AttributeConfigMeta[]> => {
  const queryAttributesDefinitionFn = async () => {
    if (!entitySetting) {
      return [];
    }
    const attributesConfiguration: AttributeConfigMeta[] = [];
    // From schema attributes
    const attributesDefinition = schemaAttributesDefinition.getAttributes(entitySetting.target_type);
    attributesDefinition.forEach((attr) => {
      if (attr.mandatoryType === 'external' || attr.mandatoryType === 'customizable' || attr.scalable) {
        const attributeConfig: AttributeConfigMeta = {
          name: attr.name,
          label: attr.label,
          type: attr.type,
          mandatoryType: attr.mandatoryType,
          multiple: attr.multiple,
          mandatory: false,
        };
        if (attr.mandatoryType === 'external') {
          attributeConfig.mandatory = true;
        }
        if (attr.scalable) { // return default scale
          attributeConfig.scale = defaultScale;
        }
        attributesConfiguration.push(attributeConfig);
      }
    });

    // From schema relations ref
    const relationsRef: RelationRefDefinition[] = schemaRelationsRefDefinition.getRelationsRef(entitySetting.target_type);
    relationsRef.forEach((rel) => {
      if (rel.mandatoryType === 'external' || rel.mandatoryType === 'customizable') {
        const attributeConfig: AttributeConfigMeta = {
          name: rel.inputName,
          label: rel.label,
          type: 'string',
          mandatoryType: rel.mandatoryType,
          multiple: rel.multiple,
          mandatory: false,
        };
        if (rel.mandatoryType === 'external') {
          attributeConfig.mandatory = true;
        }
        attributesConfiguration.push(attributeConfig);
      }
    });

    // override with stored attributes configuration in entitySettings
    const userDefinedAttributes = getAttributesConfiguration(entitySetting);
    userDefinedAttributes?.forEach((userDefinedAttr) => {
      const customizableAttr = attributesConfiguration.find((a) => a.name === userDefinedAttr.name);
      if (customizableAttr) {
        if (customizableAttr.mandatoryType === 'customizable' && isNotEmptyField(userDefinedAttr.mandatory)) {
          customizableAttr.mandatory = userDefinedAttr.mandatory;
        }
        if (isNotEmptyField(userDefinedAttr.default_values)) {
          customizableAttr.defaultValues = userDefinedAttr.default_values?.map((v) => ({ id: v } as DefaultValue));
        }
        if (customizableAttr.scale && isNotEmptyField(userDefinedAttr.scale)) {
          // override default scale
          customizableAttr.scale = JSON.stringify(userDefinedAttr.scale);
        }
      }
    });
    // Resolve default values ref
    const resolveRef = (attributes: AttributeConfigMeta[]) => {
      return Promise.all(attributes.map((attr) => {
        if (attr.name !== 'objectMarking' && relationsRef.map((ref) => ref.inputName).includes(attr.name)) {
          return internalFindByIds(context, user, attr.defaultValues?.map((v) => v.id) ?? [])
            .then((data) => ({
              ...attr,
              defaultValues: data.map((v) => ({
                id: v.internal_id,
                name: (v as BasicStoreEntity).name
              }))
            }));
        }
        return {
          ...attr,
          defaultValues: attr.defaultValues?.map((v) => ({
            id: v.id,
            name: v.id
          }))
        };
      }));
    };
    return resolveRef(attributesConfiguration);
  };

  return telemetry(context, user, 'ATTRIBUTES', {
    [SemanticAttributes.DB_NAME]: 'attributes_domain',
    [SemanticAttributes.DB_OPERATION]: 'attributes_definition',
  }, queryAttributesDefinitionFn);
};

export const getScaleAttributesForSetting = async (context: AuthContext, user: AuthUser, entitySetting: BasicStoreEntityEntitySetting): Promise<ScaleAttribute[]> => {
  const attributes = await queryAttributesDefinition(context, user, entitySetting);
  return attributes.filter((a) => a.scale).map((a) => ({ name: a.name, scale: a.scale ?? '' }));
};

export const getMandatoryAttributesForSetting = async (context: AuthContext, user: AuthUser, entitySetting: BasicStoreEntityEntitySetting): Promise<string[]> => {
  const attributes = await queryAttributesDefinition(context, user, entitySetting);
  return attributes.filter((a) => a.mandatory).map((a) => a.name);
};

export const getDefaultValuesAttributesForSetting = async (context: AuthContext, user: AuthUser, entitySetting: BasicStoreEntityEntitySetting) => {
  const attributes = await queryAttributesDefinition(context, user, entitySetting);
  return attributes.filter((a) => a.defaultValues).map((a) => ({ ...a, defaultValues: a.defaultValues ?? [] }));
};

const queryAttributeNames = async (types: string[]) => {
  const attributes = R.uniq(types.map((type) => schemaAttributesDefinition.getAttributeNames(type)).flat());
  const sortByLabel = R.sortBy(R.toLower);
  const finalResult = R.pipe(
    sortByLabel,
    R.map((n) => ({ node: { id: n, key: types[0], value: n } }))
  )(attributes);
  return buildPagination(0, null, finalResult, finalResult.length);
};

export const getRuntimeAttributeValues = (context: AuthContext, user: AuthUser, opts: QueryRuntimeAttributesArgs = {} as QueryRuntimeAttributesArgs) => {
  const { attributeName } = opts;
  return elAttributeValues(context, user, attributeName, opts);
};

export const getSchemaAttributeNames = (elementTypes: string[]) => {
  return queryAttributeNames(elementTypes);
};
