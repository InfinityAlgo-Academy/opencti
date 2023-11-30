import groupingTypeDefs from './grouping.graphql';
import convertGroupingToStix from './grouping-converter';
import { NAME_FIELD, normalizeName } from '../../schema/identifier';
import groupingResolvers from './grouping-resolver';
import { ENTITY_TYPE_CONTAINER_GROUPING, type StixGrouping, type StoreEntityGrouping } from './grouping-types';
import { ABSTRACT_STIX_DOMAIN_OBJECT } from '../../schema/general';
import { type ModuleDefinition, registerDefinition } from '../../schema/module';

const GROUPING_DEFINITION: ModuleDefinition<StoreEntityGrouping, StixGrouping> = {
  type: {
    id: 'groupings',
    name: ENTITY_TYPE_CONTAINER_GROUPING,
    category: ABSTRACT_STIX_DOMAIN_OBJECT,
    aliased: true
  },
  graphql: {
    schema: groupingTypeDefs,
    resolver: groupingResolvers,
  },
  identifier: {
    definition: {
      [ENTITY_TYPE_CONTAINER_GROUPING]: [{ src: NAME_FIELD }, { src: 'context' }]
    },
    resolvers: {
      name(data: object) {
        return normalizeName(data);
      },
    },
  },
  attributes: [
    { name: 'name', type: 'string', mandatoryType: 'external', editDefault: true, multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', editDefault: true, multiple: false, upsert: true },
    { name: 'content', type: 'string', mandatoryType: 'customizable', editDefault: true, multiple: false, upsert: true },
    { name: 'content_mapping', type: 'string', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true },
    { name: 'context', type: 'string', mandatoryType: 'external', editDefault: true, multiple: false, upsert: true },
  ],
  relations: [],
  representative: (stix: StixGrouping) => {
    return stix.name;
  },
  converter: convertGroupingToStix
};

registerDefinition(GROUPING_DEFINITION);
