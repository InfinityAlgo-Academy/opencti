import { ENTITY_TYPE_EXTERNAL_REFERENCE } from '../schema/stixMetaObject';
import type { AuthContext, AuthUser } from '../types/user';
import type { BasicStoreEntityCsvMapper } from '../modules/internal/csvMapper/csvMapper-types';
import { sanitized, validate } from '../modules/internal/csvMapper/csvMapper-utils';
import { BundleBuilder } from './bundle-creator';
import { type InputType, mappingProcess } from './csv-mapper';
import { convertStoreToStix } from '../database/stix-converter';
import type { BasicStoreBase, StoreCommon } from '../types/store';
import { entityType } from '../schema/attribute-definition';
import { getEntitySettingFromCache } from '../modules/entitySetting/entitySetting-utils';
import { validateInputCreation } from '../schema/schema-validator';
import { parsingProcess } from './csv-parser';
import { isStixDomainObjectContainer } from '../schema/stixDomainObject';
import { objects } from '../schema/stixRefRelationship';
import { isEmptyField } from '../database/utils';

const validateInput = async (context: AuthContext, user: AuthUser, inputs: Record<string, InputType>[]) => {
  await Promise.all(inputs.map(async (input) => {
    const entity_type = input[entityType.name] as string;
    const entitySetting = await getEntitySettingFromCache(context, entity_type);
    if (entitySetting) {
      await validateInputCreation(context, user, entity_type, input, entitySetting);
    }
  }));
};

const inlineEntityTypes = [ENTITY_TYPE_EXTERNAL_REFERENCE];

export const bundleProcess = async (context: AuthContext, user: AuthUser, content: Buffer | string, mapper: BasicStoreEntityCsvMapper, entity?: BasicStoreBase) => {
  await validate(context, mapper);
  const sanitizedMapper = sanitized(mapper);

  const bundleBuilder = new BundleBuilder();
  let skipLine = sanitizedMapper.has_header;
  let records = await parsingProcess(content, mapper.separator);
  if (mapper.skipLineChar) {
    records = records.filter((record) => !record[0].startsWith(mapper.skipLineChar));
  }
  if (records) {
    await Promise.all((records.map(async (record: string[]) => {
      const isEmptyLine = record.length === 1 && isEmptyField(record[0]);
      // Handle header
      if (skipLine) {
        skipLine = false;
      } else if (!isEmptyLine) {
        // Compute input by representation
        const inputs = mappingProcess(sanitizedMapper, record);
        // Remove inline elements
        const withoutInlineInputs = inputs.filter((input) => !inlineEntityTypes.includes(input.entity_type as string));
        // Validate elements
        await validateInput(context, user, withoutInlineInputs);
        // Transform entity to stix
        const stixObjects = withoutInlineInputs.map((input) => convertStoreToStix(input as unknown as StoreCommon));
        // Add to bundle
        bundleBuilder.addObjects(stixObjects);
      }
    })));
  }
  // Handle container
  if (entity && isStixDomainObjectContainer(entity.entity_type)) {
    const refs = bundleBuilder.ids();
    const stixEntity = {
      ...convertStoreToStix(entity),
      [objects.stixName]: refs
    };
    bundleBuilder.addObject(stixEntity);
  }

  return bundleBuilder.build();
};
