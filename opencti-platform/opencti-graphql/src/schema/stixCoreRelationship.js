import * as R from 'ramda';
import { ABSTRACT_STIX_CORE_RELATIONSHIP, schemaTypes } from './general';

export const RELATION_DELIVERS = 'delivers';
export const RELATION_TARGETS = 'targets';
export const RELATION_USES = 'uses';
export const RELATION_ATTRIBUTED_TO = 'attributed-to';
export const RELATION_COMPROMISES = 'compromises';
export const RELATION_ORIGINATES_FROM = 'originates-from';
export const RELATION_INVESTIGATES = 'investigates';
export const RELATION_MITIGATES = 'mitigates';
export const RELATION_LOCATED_AT = 'located-at';
export const RELATION_INDICATES = 'indicates';
export const RELATION_BASED_ON = 'based-on';
export const RELATION_COMMUNICATES_WITH = 'communicates-with';
export const RELATION_CONSISTS_OF = 'consists-of';
export const RELATION_CONTROLS = 'controls';
export const RELATION_HAS = 'has';
export const RELATION_HOSTS = 'hosts';
export const RELATION_OWNS = 'owns';
export const RELATION_AUTHORED_BY = 'authored-by';
export const RELATION_BEACONS_TO = 'beacons-to';
export const RELATION_EXFILTRATE_TO = 'exfiltrate-to';
export const RELATION_DOWNLOADS = 'downloads';
export const RELATION_DROPS = 'drops';
export const RELATION_EXPLOITS = 'exploits';
export const RELATION_VARIANT_OF = 'variant-of';
export const RELATION_CHARACTERIZES = 'characterizes';
export const RELATION_ANALYSIS_OF = 'analysis-of';
export const RELATION_STATIC_ANALYSIS_OF = 'static-analysis-of';
export const RELATION_DYNAMIC_ANALYSIS_OF = 'dynamic-analysis-of';
export const RELATION_IMPERSONATES = 'impersonates';
export const RELATION_REMEDIATES = 'remediates';
export const RELATION_RELATED_TO = 'related-to';
export const RELATION_DERIVED_FROM = 'derived-from';
export const RELATION_DUPLICATE_OF = 'duplicate-of';
export const RELATION_PART_OF = 'part-of'; // Extension
export const RELATION_SUBTECHNIQUE_OF = 'subtechnique-of'; // Extension
export const RELATION_REVOKED_BY = 'revoked-by'; // Extension
const STIX_CORE_RELATIONSHIPS = [
  RELATION_DELIVERS,
  RELATION_TARGETS,
  RELATION_USES,
  RELATION_BEACONS_TO,
  RELATION_ATTRIBUTED_TO,
  RELATION_EXFILTRATE_TO,
  RELATION_COMPROMISES,
  RELATION_DOWNLOADS,
  RELATION_EXPLOITS,
  RELATION_CHARACTERIZES,
  RELATION_ANALYSIS_OF,
  RELATION_STATIC_ANALYSIS_OF,
  RELATION_DYNAMIC_ANALYSIS_OF,
  RELATION_DERIVED_FROM,
  RELATION_DUPLICATE_OF,
  RELATION_ORIGINATES_FROM,
  RELATION_INVESTIGATES,
  RELATION_LOCATED_AT,
  RELATION_BASED_ON,
  RELATION_HOSTS,
  RELATION_OWNS,
  RELATION_COMMUNICATES_WITH,
  RELATION_MITIGATES,
  RELATION_CONTROLS,
  RELATION_HAS,
  RELATION_CONSISTS_OF,
  RELATION_INDICATES,
  RELATION_VARIANT_OF,
  RELATION_IMPERSONATES,
  RELATION_REMEDIATES,
  RELATION_RELATED_TO,
  RELATION_DROPS,
  RELATION_PART_OF,
  RELATION_SUBTECHNIQUE_OF,
  RELATION_REVOKED_BY,
];
schemaTypes.register(ABSTRACT_STIX_CORE_RELATIONSHIP, STIX_CORE_RELATIONSHIPS);
export const isStixCoreRelationship = (type) =>
  R.includes(type, STIX_CORE_RELATIONSHIPS) || type === ABSTRACT_STIX_CORE_RELATIONSHIP;
// endregion

export const stixCoreRelationshipsAttributes = [
  'internal_id',
  'standard_id',
  'entity_type',
  'created_at',
  'i_created_at_day',
  'i_created_at_month',
  'i_created_at_year',
  'updated_at',
  'x_opencti_stix_ids',
  'spec_version',
  'revoked',
  'confidence',
  'lang',
  'created',
  'modified',
  'relationship_type',
  'description',
  'start_time',
  'i_start_time_day',
  'i_start_time_month',
  'i_start_time_year',
  'stop_time',
  'i_stop_time_day',
  'i_stop_time_month',
  'i_stop_time_year',
];
R.map(
  (stixCoreRelationshipType) =>
    schemaTypes.registerAttributes(stixCoreRelationshipType, stixCoreRelationshipsAttributes),
  STIX_CORE_RELATIONSHIPS
);
