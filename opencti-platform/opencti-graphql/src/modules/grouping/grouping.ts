import groupingTypeDefs from './grouping.graphql';
import convertGroupingToStix from './grouping-converter';
import { NAME_FIELD, normalizeName } from '../../schema/identifier';
import groupingResolvers from './grouping-resolver';
import { ENTITY_TYPE_CONTAINER_GROUPING, StoreEntityGrouping } from './grouping-types';
import type { ModuleDefinition } from '../../types/module';
import { registerDefinition } from '../../types/module';

const GROUPING_DEFINITION: ModuleDefinition<StoreEntityGrouping> = {
  type: {
    id: 'groupings',
    name: ENTITY_TYPE_CONTAINER_GROUPING,
    category: 'StixDomainEntity',
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
    { name: 'name', type: 'string', multiple: false, upsert: true },
    { name: 'description', type: 'string', multiple: false, upsert: true },
    { name: 'context', type: 'string', multiple: false, upsert: true },
    { name: 'x_opencti_graph_data', type: 'string', multiple: false, upsert: false },
  ],
  relations: [],
  converter: convertGroupingToStix
};

registerDefinition(GROUPING_DEFINITION);
