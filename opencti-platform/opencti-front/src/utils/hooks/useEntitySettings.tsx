import { graphql, useFragment } from 'react-relay';
import * as Yup from 'yup';
import { ObjectSchema, ObjectShape, Schema } from 'yup';
import useAuth from './useAuth';
import { useFormatter } from '../../components/i18n';
import {
  useEntitySettingsConnection_entitySettings$data,
  useEntitySettingsConnection_entitySettings$key,
} from './__generated__/useEntitySettingsConnection_entitySettings.graphql';

export const entitySettingsFragment = graphql`
  fragment useEntitySettingsConnection_entitySettings on EntitySettingConnection {
    edges {
      node {
        id
        target_type
        platform_entity_files_ref
        platform_hidden_type
        enforce_reference
        mandatoryAttributes
        scaleAttributes {
          name
          scale
        }
        defaultValuesAttributes {
          name
          type
          defaultValues {
            id
            name
          }
        }
      }
    }
  }
`;

export type EntitySetting = useEntitySettingsConnection_entitySettings$data['edges'][0]['node'];

const useEntitySettings = (entityType?: string | string[]): EntitySetting[] => {
  const { entitySettings } = useAuth();
  const entityTypes = Array.isArray(entityType) ? entityType : [entityType];
  return useFragment<useEntitySettingsConnection_entitySettings$key>(
    entitySettingsFragment,
    entitySettings,
  )
    .edges.map(({ node }) => node)
    .filter(({ target_type }) => (entityType ? entityTypes.includes(target_type) : true));
};

export const useIsHiddenEntities = (...types: string[]): boolean => {
  const { me } = useAuth();
  return useEntitySettings(types)
    .filter((node) => node.platform_hidden_type !== null)
    .every((node) => node.platform_hidden_type || me.default_hidden_types.includes(node.target_type));
};

export const useIsHiddenEntity = (id: string): boolean => {
  const { me } = useAuth();
  return useEntitySettings(id).some((node) => node.platform_hidden_type !== null
    && (node.platform_hidden_type || me.default_hidden_types.includes(node.target_type)));
};

export const useIsEnforceReference = (id: string): boolean => {
  return useEntitySettings(id).some(
    (node) => node.enforce_reference !== null && node.enforce_reference,
  );
};

export const useYupSchemaBuilder = (
  id: string,
  existingShape: ObjectShape,
  isCreation: boolean,
  exclusions?: string[],
): ObjectSchema<{ [p: string]: unknown }> => {
  // simplest case: we're in update mode, so we do not need all mandatory fields
  if (!isCreation) {
    return Yup.object().shape(existingShape);
  }

  // we're in creation mode, let's find if all mandatory fields are set
  const { t } = useFormatter();
  const entitySettings = useEntitySettings(id).at(0);
  if (!entitySettings) {
    throw Error(`Invalid type for setting: ${id}`);
  }
  const mandatoryAttributes = [...entitySettings.mandatoryAttributes];
  // In creation, if enforce_reference is activated, externalReferences is required
  if (entitySettings.enforce_reference === true) {
    mandatoryAttributes.push('externalReferences');
  }
  const existingKeys = Object.keys(existingShape);

  const newShape: ObjectShape = Object.fromEntries(
    mandatoryAttributes
      .filter((attr) => !(exclusions ?? []).includes(attr))
      .map((attrName: string) => {
        if (existingKeys.includes(attrName)) {
          const validator: Schema = (existingShape[attrName] as Schema)
            .transform((v) => ((Array.isArray(v) && v.length === 0) ? undefined : v))
            .required(t('This field is required'));
          return [attrName, validator];
        }
        const validator = Yup.mixed()
          .transform((v) => ((Array.isArray(v) && v.length === 0) ? undefined : v))
          .required(t('This field is required'));
        return [attrName, validator];
      }),
  );
  return Yup.object().shape({ ...existingShape, ...newShape });
};

export const useSchemaCreationValidation = (
  id: string,
  existingShape: ObjectShape,
  exclusions?: string[],
): ObjectSchema<{ [p: string]: unknown }> => {
  return useYupSchemaBuilder(id, existingShape, true, exclusions);
};

export const useSchemaEditionValidation = (
  id: string,
  existingShape: ObjectShape,
  exclusions?: string[],
): ObjectSchema<{ [p: string]: unknown }> => {
  return useYupSchemaBuilder(id, existingShape, false, exclusions);
};

export default useEntitySettings;
