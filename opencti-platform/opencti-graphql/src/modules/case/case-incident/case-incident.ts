import caseIncidentTypeDefs from './case-incident.graphql';
import {
  ENTITY_TYPE_CONTAINER_CASE_INCIDENT,
  type StixCaseIncident,
  type StoreEntityCaseIncident
} from './case-incident-types';
import { ENTITY_TYPE_CONTAINER_CASE } from '../case-types';
import { NAME_FIELD, normalizeName } from '../../../schema/identifier';
import type { ModuleDefinition } from '../../../schema/module';
import { registerDefinition } from '../../../schema/module';
import caseIncidentResolvers from './case-incident-resolvers';
import convertCaseIncidentToStix from './case-incident-converter';
import { createdBy, objectAssignee, objectMarking, objectParticipant } from '../../../schema/stixRefRelationship';

const CASE_INCIDENT_DEFINITION: ModuleDefinition<StoreEntityCaseIncident, StixCaseIncident> = {
  type: {
    id: 'case-incident',
    name: ENTITY_TYPE_CONTAINER_CASE_INCIDENT,
    category: ENTITY_TYPE_CONTAINER_CASE,
    aliased: false
  },
  graphql: {
    schema: caseIncidentTypeDefs,
    resolver: caseIncidentResolvers,
  },
  identifier: {
    definition: {
      [ENTITY_TYPE_CONTAINER_CASE_INCIDENT]: [{ src: NAME_FIELD }, { src: 'created' }]
    },
    resolvers: {
      name(data: object) {
        return normalizeName(data);
      },
    },
  },
  attributes: [
    { name: 'created', type: 'date', mandatoryType: 'external', editDefault: true, multiple: false, upsert: true },
    { name: 'severity', type: 'string', mandatoryType: 'customizable', editDefault: true, multiple: false, upsert: true },
    { name: 'priority', type: 'string', mandatoryType: 'customizable', editDefault: true, multiple: false, upsert: true },
    { name: 'response_types', type: 'string', mandatoryType: 'customizable', editDefault: true, multiple: true, upsert: true, label: 'Incident type' },
  ],
  relations: [],
  relationsRefs: [createdBy, objectMarking, objectAssignee, objectParticipant],
  representative: (stix: StixCaseIncident) => {
    return stix.name;
  },
  converter: convertCaseIncidentToStix
};

registerDefinition(CASE_INCIDENT_DEFINITION);
