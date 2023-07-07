import { isStixCyberObservable } from './stixCyberObservable';
import { isStixDomainObject } from './stixDomainObject';
import { isStixMetaObject } from './stixMetaObject';
import { isInternalObject } from './internalObject';
import { ABSTRACT_BASIC_OBJECT, ABSTRACT_STIX_CORE_OBJECT, ABSTRACT_STIX_OBJECT, buildRefRelationKey } from './general';
import { isStixRelationshipExceptRef } from './stixRelationship';
import { RELATION_CREATED_BY, RELATION_EXTERNAL_REFERENCE, RELATION_KILL_CHAIN_PHASE, RELATION_OBJECT, RELATION_OBJECT_ASSIGNEE, RELATION_OBJECT_LABEL, RELATION_OBJECT_MARKING, RELATION_OBJECT_PARTICIPANT } from './stixRefRelationship';
import { RELATION_INDICATES, RELATION_RELATED_TO, RELATION_TARGETS } from './stixCoreRelationship';
import { RELATION_PARTICIPATE_TO } from './internalRelationship';
import type { StoreObject } from '../types/store';

export const INTERNAL_EXPORTABLE_TYPES = [RELATION_PARTICIPATE_TO];

export const isStixCoreObject = (type: string) => isStixDomainObject(type) || isStixCyberObservable(type) || type === ABSTRACT_STIX_CORE_OBJECT;
export const isStixObject = (type: string) => isStixCoreObject(type) || isStixMetaObject(type) || type === ABSTRACT_STIX_OBJECT;
export const isBasicObject = (type: string) => isInternalObject(type) || isStixObject(type) || type === ABSTRACT_BASIC_OBJECT;
export const isStixExportableData = (instance: StoreObject) => isStixObject(instance.entity_type)
  || isStixRelationshipExceptRef(instance.entity_type) || INTERNAL_EXPORTABLE_TYPES.includes(instance.entity_type);

export const stixCoreObjectOptions = {
  StixCoreObjectsFilter: {
    createdBy: buildRefRelationKey(RELATION_CREATED_BY),
    markedBy: buildRefRelationKey(RELATION_OBJECT_MARKING),
    assigneeTo: buildRefRelationKey(RELATION_OBJECT_ASSIGNEE),
    participant: buildRefRelationKey(RELATION_OBJECT_PARTICIPANT),
    labelledBy: buildRefRelationKey(RELATION_OBJECT_LABEL),
    objectContains: buildRefRelationKey(RELATION_OBJECT),
    hasExternalReference: buildRefRelationKey(RELATION_EXTERNAL_REFERENCE),
    killChainPhase: buildRefRelationKey(RELATION_KILL_CHAIN_PHASE),
    indicates: buildRefRelationKey(RELATION_INDICATES),
    elementId: buildRefRelationKey('*'),
    creator: 'creator_id',
    hashes_MD5: 'hashes.MD5',
    hashes_SHA1: 'hashes.SHA-1',
    hashes_SHA256: 'hashes.SHA-256',
    hashes_SHA512: 'hashes.SHA-512',
    targets: buildRefRelationKey(RELATION_TARGETS),
    relatedTo: buildRefRelationKey(RELATION_RELATED_TO),
  },
  StixCoreObjectsOrdering: {}
};
