/* eslint-disable camelcase,no-case-declarations */
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import * as R from 'ramda';
import jsonCanonicalize from 'canonicalize';
import { DatabaseError, FunctionalError, UnsupportedError } from '../config/errors';
import { convertEntityTypeToStixType } from './schemaUtils';
import * as I from './internalObject';
import { isInternalObject } from './internalObject';
import * as D from './stixDomainObject';
import {
  ENTITY_TYPE_ATTACK_PATTERN,
  isStixDomainObject,
  isStixDomainObjectIdentity,
  isStixDomainObjectLocation,
  isStixObjectAliased,
} from './stixDomainObject';
import * as M from './stixMetaObject';
import { isStixMetaObject } from './stixMetaObject';
import * as C from './stixCyberObservable';
import { isStixCyberObservable, isStixCyberObservableHashedObservable } from './stixCyberObservable';
import { BASE_TYPE_RELATION, OASIS_NAMESPACE, OPENCTI_NAMESPACE, OPENCTI_PLATFORM_UUID } from './general';
import { isInternalRelationship } from './internalRelationship';
import { isStixCoreRelationship } from './stixCoreRelationship';
import { isStixMetaRelationship } from './stixMetaRelationship';
import { isStixSightingRelationship } from './stixSightingRelationship';
import { isStixCyberObservableRelationship } from './stixCyberObservableRelationship';
import { isNotEmptyField } from '../database/utils';

// region hashes
const MD5 = 'MD5';
const SHA_1 = 'SHA-1';
const SHA_256 = 'SHA-256';
const SHA_512 = 'SHA-512';
const SHA3_256 = 'SHA3-256';
const SHA3_512 = 'SHA3-512';
const SSDEEP = 'SSDEEP';
const transformObjectToUpperKeys = (data) => {
  return Object.fromEntries(Object.entries(data).map(([k, v]) => [k.toUpperCase(), v]));
};
export const INTERNAL_FROM_FIELD = 'i_relations_from';
export const INTERNAL_TO_FIELD = 'i_relations_to';
export const NAME_FIELD = 'name';
export const FIRST_SEEN = 'first_seen';
export const LAST_SEEN = 'last_seen';
export const START_TIME = 'start_time';
export const STOP_TIME = 'stop_time';
export const VALID_FROM = 'valid_from';
export const FIRST_OBSERVED = 'first_observed';
export const LAST_OBSERVED = 'last_observed';
export const VALID_UNTIL = 'valid_until';
export const REVOKED = 'revoked';
export const X_MITRE_ID_FIELD = 'x_mitre_id';
export const X_DETECTION = 'x_opencti_detection';
// endregion

export const normalizeName = (name) => {
  return (name || '').toLowerCase().trim();
};
const stixCyberObservableContribution = {
  definition: {
    // Observables
    [C.ENTITY_AUTONOMOUS_SYSTEM]: [{ src: 'number' }],
    [C.ENTITY_DIRECTORY]: [{ src: 'path' }],
    [C.ENTITY_DOMAIN_NAME]: [{ src: 'value' }],
    [C.ENTITY_EMAIL_ADDR]: [{ src: 'value' }],
    [C.ENTITY_EMAIL_MESSAGE]: [{ src: 'from', dest: 'from_ref' }, { src: 'subject' }, { src: 'body' }],
    [C.ENTITY_HASHED_OBSERVABLE_ARTIFACT]: [{ src: 'hashes' }, { src: 'url' }],
    [C.ENTITY_HASHED_OBSERVABLE_STIX_FILE]: [[{ src: 'hashes' }], [{ src: 'name' }]],
    [C.ENTITY_HASHED_OBSERVABLE_X509_CERTIFICATE]: [
      [{ src: 'hashes' }],
      [{ src: 'serial_number' }],
      [{ src: 'subject' }],
    ],
    [C.ENTITY_IPV4_ADDR]: [{ src: 'value' }],
    [C.ENTITY_IPV6_ADDR]: [{ src: 'value' }],
    [C.ENTITY_MAC_ADDR]: [{ src: 'value' }],
    [C.ENTITY_MUTEX]: [{ src: NAME_FIELD }],
    [C.ENTITY_NETWORK_TRAFFIC]: [
      { src: 'start' },
      { src: 'src', dest: 'src_ref' },
      { src: 'dst', dest: 'dst_ref' },
      { src: 'src_port' },
      { src: 'dst_port' },
      { src: 'protocols' },
    ],
    [C.ENTITY_PROCESS]: () => uuidv4(), // No standard_id
    [C.ENTITY_SOFTWARE]: [{ src: NAME_FIELD }, { src: 'cpe' }, { src: 'vendor' }, { src: 'version' }],
    [C.ENTITY_URL]: [{ src: 'value' }],
    [C.ENTITY_USER_ACCOUNT]: [{ src: 'account_type' }, { src: 'user_id' }, { src: 'account_login' }],
    [C.ENTITY_WINDOWS_REGISTRY_KEY]: [{ src: 'attribute_key' }, { src: 'values' }],
    [C.ENTITY_CRYPTOGRAPHIC_KEY]: [{ src: 'value' }],
    [C.ENTITY_CRYPTOGRAPHIC_WALLET]: [{ src: 'value' }],
    [C.ENTITY_HOSTNAME]: [{ src: 'value' }],
    [C.ENTITY_USER_AGENT]: [{ src: 'value' }],
    [C.ENTITY_TEXT]: [{ src: 'value' }],
    // Types embedded
    [C.ENTITY_EMAIL_MIME_PART_TYPE]: [], // ALL
    [C.ENTITY_X509_V3_EXTENSIONS_TYPE]: [], // ALL
    [C.ENTITY_WINDOWS_REGISTRY_VALUE_TYPE]: [], // ALL
  },
  resolvers: {
    from(from) {
      return from?.standard_id;
    },
    src(src) {
      return src?.standard_id;
    },
    dst(dst) {
      return dst?.standard_id;
    },
    hashes(data) {
      // Uppercase the object keys (md5 == MD5)
      const hashes = transformObjectToUpperKeys(data);
      // Get the key from stix rules
      if (hashes[MD5]) return { [MD5]: hashes[MD5] };
      if (hashes[SHA_1]) return { [SHA_1]: hashes[SHA_1] };
      if (hashes[SHA_256]) return { [SHA_256]: hashes[SHA_256] };
      if (hashes[SHA_512]) return { [SHA_512]: hashes[SHA_512] };
      if (hashes[SHA3_256]) return { [SHA3_256]: hashes[SHA3_256] };
      if (hashes[SHA3_512]) return { [SHA3_512]: hashes[SHA3_512] };
      if (hashes[SSDEEP]) return { [SSDEEP]: hashes[SSDEEP] };
      return undefined;
    },
  },
};
const stixEntityContribution = {
  definition: {
    // Internal
    [I.ENTITY_TYPE_SETTINGS]: () => OPENCTI_PLATFORM_UUID,
    [I.ENTITY_TYPE_MIGRATION_STATUS]: [{ src: 'internal_id' }],
    [I.ENTITY_TYPE_MIGRATION_REFERENCE]: [], // ALL
    [I.ENTITY_TYPE_GROUP]: [{ src: NAME_FIELD }],
    [I.ENTITY_TYPE_USER]: [{ src: 'user_email' }],
    [I.ENTITY_TYPE_ROLE]: [{ src: NAME_FIELD }],
    [I.ENTITY_TYPE_CAPABILITY]: [{ src: NAME_FIELD }],
    [I.ENTITY_TYPE_CONNECTOR]: [{ src: 'internal_id' }],
    [I.ENTITY_TYPE_RULE_MANAGER]: [{ src: 'internal_id' }],
    [I.ENTITY_TYPE_RULE]: [{ src: 'internal_id' }],
    [I.ENTITY_TYPE_HISTORY]: [{ src: 'internal_id' }],
    [I.ENTITY_TYPE_WORKSPACE]: [], // ALL
    [I.ENTITY_TYPE_TAXII_COLLECTION]: [], // ALL
    [I.ENTITY_TYPE_TASK]: [], // ALL
    [I.ENTITY_TYPE_RETENTION_RULE]: [], // ALL
    [I.ENTITY_TYPE_SYNC]: [], // ALL
    [I.ENTITY_TYPE_STREAM_COLLECTION]: [], // ALL
    [I.ENTITY_TYPE_USER_SUBSCRIPTION]: [], // ALL
    [I.ENTITY_TYPE_STATUS_TEMPLATE]: [{ src: NAME_FIELD }], // ALL
    [I.ENTITY_TYPE_STATUS]: [{ src: 'template_id' }, { src: 'type' }], // ALL
    // Stix Domain
    [D.ENTITY_TYPE_ATTACK_PATTERN]: [[{ src: X_MITRE_ID_FIELD }], [{ src: NAME_FIELD }]],
    [D.ENTITY_TYPE_CAMPAIGN]: [{ src: NAME_FIELD }],
    [D.ENTITY_TYPE_CONTAINER_NOTE]: () => uuidv4(), // No standard_id
    [D.ENTITY_TYPE_CONTAINER_OBSERVED_DATA]: [{ src: 'objects' }],
    [D.ENTITY_TYPE_CONTAINER_OPINION]: () => uuidv4(), // No standard_id
    [D.ENTITY_TYPE_CONTAINER_REPORT]: [{ src: NAME_FIELD }, { src: 'published' }],
    [D.ENTITY_TYPE_COURSE_OF_ACTION]: [[{ src: X_MITRE_ID_FIELD }], [{ src: NAME_FIELD }]],
    [D.ENTITY_TYPE_IDENTITY_INDIVIDUAL]: [{ src: NAME_FIELD }, { src: 'identity_class' }],
    [D.ENTITY_TYPE_IDENTITY_ORGANIZATION]: [{ src: NAME_FIELD }, { src: 'identity_class' }],
    [D.ENTITY_TYPE_IDENTITY_SECTOR]: [{ src: NAME_FIELD }, { src: 'identity_class' }],
    [D.ENTITY_TYPE_IDENTITY_SYSTEM]: [{ src: NAME_FIELD }, { src: 'identity_class' }],
    [D.ENTITY_TYPE_INDICATOR]: [{ src: 'pattern' }],
    [D.ENTITY_TYPE_INFRASTRUCTURE]: [{ src: NAME_FIELD }],
    [D.ENTITY_TYPE_INTRUSION_SET]: [{ src: NAME_FIELD }],
    [D.ENTITY_TYPE_LOCATION_CITY]: [{ src: NAME_FIELD }, { src: 'x_opencti_location_type' }],
    [D.ENTITY_TYPE_LOCATION_COUNTRY]: [{ src: NAME_FIELD }, { src: 'x_opencti_location_type' }],
    [D.ENTITY_TYPE_LOCATION_REGION]: [{ src: NAME_FIELD }, { src: 'x_opencti_location_type' }],
    [D.ENTITY_TYPE_LOCATION_POSITION]: [{ src: NAME_FIELD }, { src: 'latitude' }, { src: 'longitude' }],
    [D.ENTITY_TYPE_MALWARE]: [{ src: NAME_FIELD }],
    [D.ENTITY_TYPE_THREAT_ACTOR]: [{ src: NAME_FIELD }],
    [D.ENTITY_TYPE_TOOL]: [{ src: NAME_FIELD }],
    [D.ENTITY_TYPE_VULNERABILITY]: [{ src: NAME_FIELD }],
    [D.ENTITY_TYPE_INCIDENT]: [{ src: NAME_FIELD }],
    // Stix Meta
    [M.ENTITY_TYPE_MARKING_DEFINITION]: [{ src: 'definition' }, { src: 'definition_type' }],
    [M.ENTITY_TYPE_LABEL]: [{ src: 'value' }],
    [M.ENTITY_TYPE_KILL_CHAIN_PHASE]: [{ src: 'phase_name' }, { src: 'kill_chain_name' }],
    [M.ENTITY_TYPE_EXTERNAL_REFERENCE]: [[{ src: 'url' }], [{ src: 'source_name' }, { src: 'external_id' }]],
  },
  resolvers: {
    name(data) {
      return normalizeName(data);
    },
    published(data) {
      return data instanceof Date ? data.toISOString() : data;
    },
    first_observed(data) {
      return data instanceof Date ? data.toISOString() : data;
    },
    last_observed(data) {
      return data instanceof Date ? data.toISOString() : data;
    },
    objects(data) {
      return data.map((o) => o.standard_id).sort();
    },
  },
};
const resolveContribution = (type) => {
  return isStixCyberObservable(type) ? stixCyberObservableContribution : stixEntityContribution;
};
export const idGen = (type, raw, data, namespace) => {
  if (R.isEmpty(data)) {
    const contrib = resolveContribution(type);
    const properties = contrib.definition[type];
    throw UnsupportedError(`Cant create key for ${type} from empty data`, { data: raw, properties });
  }
  const dataCanonicalize = jsonCanonicalize(data);
  return uuidv5(dataCanonicalize, namespace);
};
export const idGenFromData = (type, data) => {
  const dataCanonicalize = jsonCanonicalize(data);
  const uuid = uuidv5(dataCanonicalize, OPENCTI_NAMESPACE);
  return `${convertEntityTypeToStixType(type)}--${uuid}`;
};
export const fieldsContributingToStandardId = (instance, keys) => {
  const instanceType = instance.entity_type;
  const isRelation = instance.base_type === BASE_TYPE_RELATION;
  if (isRelation) return false;
  const contrib = resolveContribution(instanceType);
  const properties = contrib.definition[instanceType];
  if (!properties) {
    throw DatabaseError(`Unknown definition for type ${instanceType}`);
  }
  // Handle specific case of dedicated generation function
  if (!Array.isArray(properties)) {
    return false;
  }
  // Handle specific case of all
  if (properties.length === 0) {
    return true;
  }
  const targetKeys = R.map((k) => (k.includes('.') ? R.head(k.split('.')) : k), keys);
  const propertiesToKeep = R.map((t) => t.src, R.flatten(properties));
  return R.filter((p) => R.includes(p, targetKeys), propertiesToKeep);
};
export const isFieldContributingToStandardId = (instance, keys) => {
  const keysIncluded = fieldsContributingToStandardId(instance, keys);
  return keysIncluded.length > 0;
};
const filteredIdContributions = (contrib, way, data) => {
  const propertiesToKeep = R.flatten(R.map((t) => t.src, way));
  const dataRelated = R.pick(propertiesToKeep, data);
  if (R.isEmpty(dataRelated)) {
    return {};
  }
  const objectData = {};
  const entries = Object.entries(dataRelated);
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const [key, value] = entry;
    const prop = R.find((e) => R.includes(key, e.src), way);
    const { src, dest } = prop;
    const destKey = dest || src;
    const resolver = contrib.resolvers[src];
    if (resolver) {
      objectData[destKey] = value ? resolver(value) : value;
    } else {
      objectData[destKey] = value;
    }
  }
  return R.filter((keyValue) => !R.isEmpty(keyValue) && !R.isNil(keyValue), objectData);
};

const generateDataUUID = (type, data) => {
  const contrib = resolveContribution(type);
  const properties = contrib.definition[type];
  if (!properties) {
    throw DatabaseError(`Unknown definition for type ${type}`);
  }
  // Handle specific case of dedicated generation function
  if (!Array.isArray(properties)) {
    return properties();
  }
  if (properties.length === 0) {
    return data;
  }
  // In same case ID have multiple possibility for his generation.
  let uuidData;
  const haveDiffWays = Array.isArray(R.head(properties));
  if (haveDiffWays) {
    for (let index = 0; index < properties.length; index += 1) {
      const way = properties[index];
      uuidData = filteredIdContributions(contrib, way, data);
      if (!R.isEmpty(uuidData)) break; // Stop as soon as a correct id is find
    }
  } else {
    uuidData = filteredIdContributions(contrib, properties, data);
  }
  return uuidData;
};
const generateStixUUID = (type, data) => {
  const dataUUID = generateDataUUID(type, data);
  return idGen(type, data, dataUUID, OASIS_NAMESPACE);
};
const generateObjectUUID = (type, data) => {
  const dataUUID = generateDataUUID(type, data);
  return idGen(type, data, dataUUID, OPENCTI_NAMESPACE);
};

const generateObjectId = (type, data) => {
  const uuid = generateObjectUUID(type, data);
  return `${convertEntityTypeToStixType(type)}--${uuid}`;
};
const generateStixId = (type, data) => {
  const uuid = generateStixUUID(type, data);
  return `${convertEntityTypeToStixType(type)}--${uuid}`;
};

export const generateInternalId = () => uuidv4();
export const generateWorkId = () => `opencti-work--${generateInternalId()}`;
export const generateStandardId = (type, data) => {
  // Entities
  if (isStixMetaObject(type)) return generateStixId(type, data);
  if (isStixDomainObject(type)) return generateStixId(type, data);
  if (isStixCyberObservable(type)) return generateStixId(type, data);
  if (isInternalObject(type)) return generateObjectId(type, data);
  // Relations
  if (isInternalRelationship(type)) return `internal-relationship--${generateInternalId()}`;
  if (isStixCoreRelationship(type)) return `relationship--${generateInternalId()}`;
  if (isStixMetaRelationship(type)) return `relationship-meta--${generateInternalId()}`;
  if (isStixCyberObservableRelationship(type)) return `relationship-meta--${generateInternalId()}`;
  if (isStixSightingRelationship(type)) return `sighting--${generateInternalId()}`;
  // Unknown
  throw UnsupportedError(`${type} is not supported by the platform`);
};
export const generateAliasesId = (aliases, instance = {}) => {
  const additionalFields = {};
  if (isStixDomainObjectIdentity(instance.entity_type)) {
    additionalFields.identity_class = instance.identity_class;
  }
  if (isStixDomainObjectLocation(instance.entity_type)) {
    additionalFields.x_opencti_location_type = instance.x_opencti_location_type;
  }
  if (instance.entity_type === ENTITY_TYPE_ATTACK_PATTERN && instance.x_mitre_id) {
    additionalFields.x_mitre_id = instance.x_mitre_id;
  }
  return R.map((a) => {
    const dataUUID = { name: normalizeName(a), ...additionalFields };
    const uuid = idGen('ALIAS', aliases, dataUUID, OPENCTI_NAMESPACE);
    return `aliases--${uuid}`;
  }, R.uniq(aliases));
};

export const generateAliasesIdsForInstance = (instance) => {
  if (isStixObjectAliased(instance.entity_type)) {
    const aliases = [instance.name, ...(instance.aliases || []), ...(instance.x_opencti_aliases || [])];
    return generateAliasesId(aliases, instance);
  }
  return [];
};
const getHashIds = (type, hashes) => {
  const ids = [];
  if (isStixCyberObservableHashedObservable(type) && isNotEmptyField(hashes)) {
    const hashIds = Object.entries(hashes)
      .map(([, s]) => s)
      .filter((s) => isNotEmptyField(s));
    ids.push(...hashIds);
  }
  return ids;
};
export const getInstanceIds = (instance, withoutInternal = false) => {
  const ids = [];
  if (!withoutInternal) {
    ids.push(instance.internal_id);
  }
  ids.push(instance.standard_id);
  if (instance.x_opencti_stix_ids) {
    ids.push(...instance.x_opencti_stix_ids);
  }
  ids.push(...generateAliasesIdsForInstance(instance));
  ids.push(...getHashIds(instance.entity_type, instance.hashes));
  return R.uniq(ids);
};
export const getInputIds = (type, input) => {
  const ids = [input.standard_id || generateStandardId(type, input)];
  if (isNotEmptyField(input.internal_id)) {
    ids.push(input.internal_id);
  }
  if (isNotEmptyField(input.stix_id)) {
    ids.push(input.stix_id);
  }
  ids.push(...generateAliasesIdsForInstance(input));
  ids.push(...getHashIds(type, input.hashes));
  return R.uniq(ids);
};
export const getInstanceIdentifiers = (instance) => {
  const base = {
    _index: instance._index,
    standard_id: instance.standard_id,
    internal_id: instance.internal_id,
    entity_type: instance.entity_type,
    created_at: instance.created_at,
  };
  if (instance.identity_class) {
    base.identity_class = instance.identity_class;
  }
  if (instance.x_opencti_location_type) {
    base.x_opencti_location_type = instance.x_opencti_location_type;
  }
  // Need to put everything needed to identified a relationship
  if (instance.relationship_type) {
    base.relationship_type = instance.relationship_type;
    if (!instance.from) {
      throw FunctionalError('Inconsistent from to identify', { id: instance.id, from: instance.fromId });
    }
    base.from = instance.from;
    if (!instance.to) {
      throw FunctionalError('Inconsistent to to identify', { id: instance.id, to: instance.toId });
    }
    base.to = instance.to;
  }
  return base;
};
