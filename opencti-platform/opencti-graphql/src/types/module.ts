import type { StoreEntity } from './store';
import type { ConvertFn } from '../database/stix-converter';
import { registerStixDomainAliased, registerStixDomainType } from '../schema/stixDomainObject';
import { registerGraphqlSchema } from '../graphql/schema';
import { registerModelIdentifier } from '../schema/identifier';
import { schemaTypes } from '../schema/general';
import { registerStixDomainConverter } from '../database/stix-converter';
import {
  booleanAttributes,
  dateAttributes,
  dictAttributes, jsonAttributes,
  multipleAttributes,
  numericAttributes
} from '../schema/fieldDataAdapter';
import { STIX_CORE_RELATIONSHIPS } from '../schema/stixCoreRelationship';
import { STIX_CYBER_OBSERVABLE_RELATIONSHIPS } from '../schema/stixCyberObservableRelationship';
import {
  stixCoreRelationshipsMapping as coreRels,
  stixCyberObservableRelationshipsMapping as obsRels
} from '../database/stix';

export type AttrType = 'string' | 'date' | 'numeric' | 'boolean' | 'dictionary' | 'json';
export interface ModuleDefinition<T extends StoreEntity> {
  type: {
    id: string;
    name: string;
    aliased: boolean;
    category: 'StixDomainEntity';
  };
  graphql: {
    schema: any,
    resolver: any,
  };
  identifier: {
    definition: {
      [k: string]: Array<{ src: string }>
    };
    resolvers: {
      [f: string]: (data: object) => string
    };
  };
  attributes: Array<{
    name: string;
    type: AttrType;
    multiple: boolean;
    upsert: boolean;
  }>;
  relations: Array<{
    name: string;
    targets: Array<string>;
    type: 'StixCoreRelationship' | 'StixCyberObservableRelationship';
  }>;
  converter: ConvertFn<T>;
}

export const registerDefinition = <T extends StoreEntity>(definition: ModuleDefinition<T>) => {
  const attrsForType = (type: AttrType) => {
    return definition.attributes.filter((attr) => attr.type === type).map((attr) => attr.name);
  };
    // Register types
  if (definition.type.category === 'StixDomainEntity') {
    registerStixDomainType(definition.type.name);
    if (definition.type.aliased) {
      registerStixDomainAliased(definition.type.name);
    }
  }
  // Register graphQL schema
  registerGraphqlSchema(definition.graphql);
  // Register key identification
  registerModelIdentifier(definition.identifier);
  // Register attributes
  const attributes = definition.attributes.map((attr) => attr.name);
  schemaTypes.registerAttributes(definition.type.name, attributes);
  const upsertAttributes = definition.attributes.filter((attr) => attr.upsert).map((attr) => attr.name);
  schemaTypes.registerUpsertAttributes(definition.type.name, upsertAttributes);
  registerStixDomainConverter(definition.type.name, definition.converter);
  // Register attribute types
  dateAttributes.push(...attrsForType('date')); // --- dateAttributes
  numericAttributes.push(...attrsForType('numeric')); // --- numericAttributes
  booleanAttributes.push(...attrsForType('boolean')); // --- booleanAttributes
  dictAttributes.push(...attrsForType('dictionary')); // --- dictAttributes
  const multipleAttrs = definition.attributes.filter((attr) => attr.multiple).map((attr) => attr.name);
  multipleAttributes.push(...multipleAttrs); // --- multipleAttributes
  jsonAttributes.push(...attrsForType('json')); // --- jsonAttributes
  // Register relations
  definition.relations.forEach((source) => {
    if (source.type === 'StixCoreRelationship' && !STIX_CORE_RELATIONSHIPS.includes(source.type)) {
      STIX_CORE_RELATIONSHIPS.push(source.name);
    }
    if (source.type === 'StixCyberObservableRelationship' && !STIX_CYBER_OBSERVABLE_RELATIONSHIPS.includes(source.type)) {
      STIX_CYBER_OBSERVABLE_RELATIONSHIPS.push(source.name);
    }
    source.targets.forEach((target) => {
      const key: `${string}_${string}` = `${definition.type.name}_${target}`;
      const mapping = source.type === 'StixCoreRelationship' ? coreRels : obsRels;
      mapping[key] = [...(mapping[key] ?? []), source.name];
    });
  });
};
