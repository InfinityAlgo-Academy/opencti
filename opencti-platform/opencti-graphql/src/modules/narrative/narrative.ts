import narrativeTypeDefs from './narrative.graphql';
import convertNarrativeToStix from './narrative-converter';
import { NAME_FIELD, normalizeName } from '../../schema/identifier';
import narrativeResolvers from './narrative-resolver';
import { ENTITY_TYPE_NARRATIVE, StoreEntityNarrative } from './narrative-types';
import type { ModuleDefinition } from '../../types/module';
import { registerDefinition } from '../../types/module';

const NARRATIVE_DEFINITION: ModuleDefinition<StoreEntityNarrative> = {
  type: {
    id: 'narratives',
    name: ENTITY_TYPE_NARRATIVE,
    category: 'StixDomainEntity',
    aliased: true
  },
  graphql: {
    schema: narrativeTypeDefs,
    resolver: narrativeResolvers,
  },
  identifier: {
    definition: {
      [ENTITY_TYPE_NARRATIVE]: [{ src: NAME_FIELD }]
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
  ],
  relations: [],
  converter: convertNarrativeToStix
};

registerDefinition(NARRATIVE_DEFINITION);
