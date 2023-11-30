import { v4 as uuidv4 } from 'uuid';
import { normalizeName } from '../../schema/identifier';
import { ABSTRACT_INTERNAL_OBJECT } from '../../schema/general';
import { type ModuleDefinition, registerDefinition } from '../../schema/module';
import { ENTITY_TYPE_INGESTION_RSS, type StixIngestionRss, type StoreEntityIngestionRss } from './ingestion-types';
import { convertIngestionRssToStix } from './ingestion-converter';
import ingestionTypeDefs from './ingestion-rss.graphql';
import ingestionRssResolvers from './ingestion-rss-resolver';

const INGESTION_RSS_DEFINITION: ModuleDefinition<StoreEntityIngestionRss, StixIngestionRss> = {
  type: {
    id: 'ingestion-rss',
    name: ENTITY_TYPE_INGESTION_RSS,
    category: ABSTRACT_INTERNAL_OBJECT,
    aliased: false
  },
  graphql: {
    schema: ingestionTypeDefs,
    resolver: ingestionRssResolvers,
  },
  identifier: {
    definition: {
      [ENTITY_TYPE_INGESTION_RSS]: () => uuidv4(),
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
    { name: 'uri', type: 'string', mandatoryType: 'customizable', editDefault: true, multiple: false, upsert: true },
    { name: 'user_id', type: 'string', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true },
    { name: 'report_types', type: 'string', mandatoryType: 'external', editDefault: true, multiple: true, upsert: true },
    { name: 'created_by_ref', type: 'string', mandatoryType: 'external', editDefault: true, multiple: false, upsert: true },
    { name: 'object_marking_refs', type: 'string', mandatoryType: 'external', editDefault: true, multiple: true, upsert: true },
    { name: 'current_state_date', type: 'date', mandatoryType: 'external', editDefault: true, multiple: false, upsert: true },
    { name: 'ingestion_running', type: 'boolean', mandatoryType: 'external', editDefault: true, multiple: false, upsert: true },
  ],
  relations: [],
  representative: (stix: StixIngestionRss) => {
    return stix.name;
  },
  converter: convertIngestionRssToStix
};

registerDefinition(INGESTION_RSS_DEFINITION);
