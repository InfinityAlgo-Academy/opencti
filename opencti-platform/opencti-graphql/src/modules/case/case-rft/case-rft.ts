import { ENTITY_TYPE_CONTAINER_CASE } from '../case-types';
import { NAME_FIELD, normalizeName } from '../../../schema/identifier';
import type { ModuleDefinition } from '../../../schema/module';
import { registerDefinition } from '../../../schema/module';
import { createdBy, objectAssignee, objectMarking, objectParticipant } from '../../../schema/stixRefRelationship';
import type { StixCaseRft, StoreEntityCaseRft } from './case-rft-types';
import { ENTITY_TYPE_CONTAINER_CASE_RFT } from './case-rft-types';
import convertCaseRftToStix from './case-rft-converter';

const CASE_RFT_DEFINITION: ModuleDefinition<StoreEntityCaseRft, StixCaseRft> = {
  type: {
    id: 'case-rft',
    name: ENTITY_TYPE_CONTAINER_CASE_RFT,
    category: ENTITY_TYPE_CONTAINER_CASE,
    aliased: false
  },
  identifier: {
    definition: {
      [ENTITY_TYPE_CONTAINER_CASE_RFT]: [{ src: NAME_FIELD }, { src: 'created' }]
    },
    resolvers: {
      name(data: object) {
        return normalizeName(data);
      },
    },
  },
  attributes: [
    { name: 'name', label: 'Name', type: 'string', format: 'short', mandatoryType: 'external', editDefault: true, multiple: false, upsert: true, isFilterable: true },
    { name: 'created', label: 'Created', type: 'date', mandatoryType: 'external', editDefault: true, multiple: false, upsert: true, isFilterable: false },
    { name: 'takedown_types', label: 'Takedown types', type: 'string', format: 'vocabulary', vocabularyCategory: 'request_for_takedown_types_ov', mandatoryType: 'customizable', editDefault: true, multiple: true, upsert: true, isFilterable: true },
    { name: 'severity', label: 'Severity', type: 'string', format: 'vocabulary', vocabularyCategory: 'case_severity_ov', mandatoryType: 'customizable', editDefault: true, multiple: false, upsert: true, isFilterable: true },
    { name: 'priority', label: 'Priority', type: 'string', format: 'vocabulary', vocabularyCategory: 'case_priority_ov', mandatoryType: 'customizable', editDefault: true, multiple: false, upsert: true, isFilterable: true },
  ],
  relations: [],
  relationsRefs: [createdBy, objectMarking, objectAssignee, objectParticipant],
  representative: (stix: StixCaseRft) => {
    return stix.name;
  },
  converter: convertCaseRftToStix
};

registerDefinition(CASE_RFT_DEFINITION);
