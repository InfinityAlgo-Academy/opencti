import * as R from 'ramda';
import { version as uuidVersion } from 'uuid';
import uuidTime from 'uuid-time';
import { FunctionalError } from '../config/errors';
import { isStixDomainObjectIdentity, isStixDomainObjectLocation } from '../schema/stixDomainObject';
import { ENTITY_HASHED_OBSERVABLE_STIX_FILE } from '../schema/stixCyberObservable';
import {
  isStixInternalMetaRelationship,
  isStixMetaRelationship,
  RELATION_CREATED_BY,
} from '../schema/stixMetaRelationship';
import { isStixObject } from '../schema/stixCoreObject';
import { isStixCoreRelationship } from '../schema/stixCoreRelationship';
import { isStixSightingRelationship } from '../schema/stixSightingRelationship';
import { isStixCyberObservableRelationship } from '../schema/stixCyberObservableRelationship';
import { isMultipleAttribute } from '../schema/fieldDataAdapter';

const MAX_TRANSIENT_STIX_IDS = 50;
export const STIX_SPEC_VERSION = '2.1';

export const convertTypeToStixType = (type) => {
  if (isStixDomainObjectIdentity(type)) {
    return 'identity';
  }
  if (isStixDomainObjectLocation(type)) {
    return 'location';
  }
  if (type === ENTITY_HASHED_OBSERVABLE_STIX_FILE) {
    return 'file';
  }
  if (isStixCoreRelationship(type)) {
    return 'relationship';
  }
  return type.toLowerCase();
};

const BASIC_FIELDS = [
  'id',
  'x_opencti_id',
  'type',
  'spec_version',
  'source_ref',
  'x_opencti_source_ref',
  'target_ref',
  'x_opencti_target_ref',
  'start_time',
  'stop_time',
];
export const stixDataConverter = (data) => {
  let finalData = data;
  // Relationships
  if (finalData.from) {
    finalData = R.pipe(
      R.dissoc('from'),
      R.assoc('source_ref', data.from.standard_id),
      R.assoc('x_opencti_source_ref', data.from.internal_id)
    )(finalData);
  }
  if (finalData.to) {
    finalData = R.pipe(
      R.dissoc('to'),
      R.assoc('target_ref', data.to.standard_id),
      R.assoc('x_opencti_target_ref', data.to.internal_id)
    )(finalData);
  }
  // Specific input cases
  if (finalData.stix_id) {
    finalData = R.pipe(R.dissoc('stix_id'), R.assoc('x_opencti_stix_ids', [data.stix_id]))(finalData);
  } else {
    finalData = R.dissoc('stix_id', finalData);
  }
  // Inner relations
  if (finalData.object) {
    const objectSet = Array.isArray(finalData.object) ? finalData.object : [finalData.object];
    const objects = R.map((m) => m.standard_id, objectSet);
    finalData = R.pipe(R.dissoc('object'), R.assoc('object_refs', objects))(finalData);
  } else {
    finalData = R.dissoc('object', finalData);
  }
  if (finalData.objectMarking) {
    const markingSet = Array.isArray(finalData.objectMarking) ? finalData.objectMarking : [finalData.objectMarking];
    const markings = R.map((m) => m.standard_id, markingSet);
    finalData = R.pipe(R.dissoc('objectMarking'), R.assoc('object_marking_refs', markings))(finalData);
  } else {
    finalData = R.dissoc('objectMarking', finalData);
  }
  if (finalData.createdBy) {
    const creator = Array.isArray(finalData.createdBy) ? R.head(finalData.createdBy) : finalData.createdBy;
    finalData = R.pipe(R.dissoc('createdBy'), R.assoc('created_by_ref', creator.standard_id))(finalData);
  } else {
    finalData = R.dissoc('createdBy', finalData);
  }
  // Embedded relations
  if (finalData.objectLabel) {
    const labelSet = Array.isArray(finalData.objectLabel) ? finalData.objectLabel : [finalData.objectLabel];
    const labels = R.map((m) => m.value, labelSet);
    finalData = R.pipe(R.dissoc('objectLabel'), R.assoc('labels', labels))(finalData);
  } else {
    finalData = R.dissoc('objectLabel', finalData);
  }
  if (finalData.killChainPhases) {
    const killSet = Array.isArray(finalData.killChainPhases) ? finalData.killChainPhases : [finalData.killChainPhases];
    const kills = R.map((k) => R.pick(['kill_chain_name', 'phase_name'], k), killSet);
    finalData = R.pipe(R.dissoc('killChainPhases'), R.assoc('kill_chain_phases', kills))(finalData);
  } else {
    finalData = R.dissoc('killChainPhases', finalData);
  }
  if (finalData.externalReferences) {
    const externalSet = Array.isArray(finalData.externalReferences)
      ? finalData.externalReferences
      : [finalData.externalReferences];
    const externals = R.map(
      (e) => R.pick(['source_name', 'description', 'url', 'hashes', 'external_id'], e),
      externalSet
    );
    finalData = R.pipe(R.dissoc('externalReferences'), R.assoc('external_references', externals))(finalData);
  } else {
    finalData = R.dissoc('externalReferences', finalData);
  }
  // Final filtering
  const filteredData = {};
  const entries = Object.entries(finalData);
  for (let index = 0; index < entries.length; index += 1) {
    const [key, val] = entries[index];
    if (key.startsWith('i_') || key === 'x_opencti_graph_data' || val === null) {
      // Internal opencti attributes.
    } else if (key.startsWith('attribute_')) {
      // Stix but reserved keywords
      const targetKey = key.replace('attribute_', '');
      filteredData[targetKey] = val;
    } else if (!isMultipleAttribute(key) && !key.endsWith('_refs')) {
      filteredData[key] = Array.isArray(val) ? R.head(val) : val;
    } else {
      filteredData[key] = val;
    }
  }
  return filteredData;
};
export const buildStixData = (data, onlyBase = false) => {
  const type = data.entity_type;
  // general
  const rawData = R.pipe(
    R.assoc('id', data.standard_id),
    R.assoc('x_opencti_id', data.internal_id),
    R.assoc('type', convertTypeToStixType(type)),
    R.dissoc('_index'),
    R.dissoc('standard_id'),
    R.dissoc('internal_id'),
    R.dissoc('parent_types'),
    R.dissoc('base_type'),
    R.dissoc('entity_type'),
    R.dissoc('update'),
    // Relations
    R.dissoc('fromId'),
    R.dissoc('fromRole'),
    R.dissoc('fromType'),
    R.dissoc('toId'),
    R.dissoc('toRole'),
    R.dissoc('toType'),
    R.dissoc('connections')
  )(data);
  const stixData = stixDataConverter(rawData);
  if (onlyBase) {
    return R.pick(BASIC_FIELDS, stixData);
  }
  return stixData;
};

export const convertStixMetaRelationshipToStix = (data) => {
  const entityType = data.entity_type;
  let finalData = buildStixData(data.from, true);
  if (isStixInternalMetaRelationship(entityType)) {
    finalData = R.assoc(entityType.replace('-', '_'), [buildStixData(data.to)], finalData);
  } else {
    finalData = R.assoc(
      `${entityType.replace('-', '_')}_ref${entityType !== RELATION_CREATED_BY ? 's' : ''}`,
      entityType !== RELATION_CREATED_BY ? [data.to.standard_id] : data.to.standard_id,
      finalData
    );
  }
  return finalData;
};

export const convertStixCyberObservableRelationshipToStix = (data) => {
  const entityType = data.entity_type;
  let finalData = buildStixData(data.from, true);
  finalData = R.assoc(`${entityType.replace('-', '_')}_ref`, data.to.standard_id, finalData);
  return finalData;
};

export const convertDataToStix = (data, type) => {
  if (!data) {
    /* istanbul ignore next */
    throw FunctionalError('No data provided to STIX converter');
  }
  const entityType = data.entity_type;
  const onlyBase = type === 'delete';
  let finalData;
  if (isStixObject(entityType)) {
    finalData = buildStixData(data, onlyBase);
  }
  if (isStixCoreRelationship(entityType)) {
    finalData = buildStixData(data, onlyBase);
  }
  if (isStixSightingRelationship(entityType)) {
    finalData = buildStixData(data, onlyBase);
  }
  if (isStixMetaRelationship(entityType)) {
    finalData = convertStixMetaRelationshipToStix(data);
  }
  if (isStixCyberObservableRelationship(entityType)) {
    finalData = convertStixCyberObservableRelationshipToStix(data);
  }
  if (!finalData) {
    throw FunctionalError(`The converter is not able to convert this type of entity: ${entityType}`);
  }
  return finalData;
};

export const onlyStableStixIds = (ids = []) => R.filter((n) => uuidVersion(R.split('--', n)[1]) !== 1, ids);

export const cleanStixIds = (ids, maxStixIds = MAX_TRANSIENT_STIX_IDS) => {
  const keptIds = [];
  const transientIds = [];
  const wIds = Array.isArray(ids) ? ids : [ids];
  for (let index = 0; index < wIds.length; index += 1) {
    const stixId = wIds[index];
    const segments = stixId.split('--');
    const [, uuid] = segments;
    const isTransient = uuidVersion(uuid) === 1;
    if (isTransient) {
      const timestamp = uuidTime.v1(uuid);
      transientIds.push({ id: stixId, uuid, timestamp });
    } else {
      keptIds.push({ id: stixId, uuid });
    }
  }
  const orderedTransient = R.sort((a, b) => b.timestamp - a.timestamp, transientIds);
  const keptTimedIds = orderedTransient.length > maxStixIds ? orderedTransient.slice(0, maxStixIds) : orderedTransient;
  // Return the new list
  return R.map((s) => s.id, [...keptIds, ...keptTimedIds]);
};
