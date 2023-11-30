import channelTypeDefs from './event.graphql';
import convertEventToStix from './event-converter';
import { NAME_FIELD, normalizeName } from '../../schema/identifier';
import channelResolvers from './event-resolver';
import { ENTITY_TYPE_EVENT, type StixEvent, type StoreEntityEvent } from './event-types';
import { RELATION_LOCATED_AT } from '../../schema/stixCoreRelationship';
import {
  ENTITY_TYPE_LOCATION_CITY,
  ENTITY_TYPE_LOCATION_COUNTRY,
  ENTITY_TYPE_LOCATION_POSITION,
  ENTITY_TYPE_LOCATION_REGION
} from '../../schema/stixDomainObject';
import { REL_EXTENDED } from '../../database/stix';
import { ABSTRACT_STIX_DOMAIN_OBJECT } from '../../schema/general';
import { type ModuleDefinition, registerDefinition } from '../../schema/module';
import { objectOrganization } from '../../schema/stixRefRelationship';

const EVENT_DEFINITION: ModuleDefinition<StoreEntityEvent, StixEvent> = {
  type: {
    id: 'events',
    name: ENTITY_TYPE_EVENT,
    category: ABSTRACT_STIX_DOMAIN_OBJECT,
    aliased: true
  },
  graphql: {
    schema: channelTypeDefs,
    resolver: channelResolvers,
  },
  identifier: {
    definition: {
      [ENTITY_TYPE_EVENT]: [{ src: NAME_FIELD }]
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
    { name: 'event_types', type: 'string', mandatoryType: 'customizable', editDefault: true, multiple: true, upsert: true, label: 'Event types' },
    { name: 'start_time', type: 'date', mandatoryType: 'customizable', editDefault: true, multiple: false, upsert: true, label: 'Start date' },
    { name: 'stop_time', type: 'date', mandatoryType: 'customizable', editDefault: true, multiple: false, upsert: true, label: 'End date' },
  ],
  relations: [
    {
      name: RELATION_LOCATED_AT,
      targets: [
        { name: ENTITY_TYPE_LOCATION_REGION, type: REL_EXTENDED },
        { name: ENTITY_TYPE_LOCATION_COUNTRY, type: REL_EXTENDED },
        { name: ENTITY_TYPE_LOCATION_CITY, type: REL_EXTENDED },
        { name: ENTITY_TYPE_LOCATION_POSITION, type: REL_EXTENDED },
      ]
    }
  ],
  relationsRefs: [
    objectOrganization
  ],
  representative: (stix: StixEvent) => {
    return stix.name;
  },
  converter: convertEventToStix
};

registerDefinition(EVENT_DEFINITION);
