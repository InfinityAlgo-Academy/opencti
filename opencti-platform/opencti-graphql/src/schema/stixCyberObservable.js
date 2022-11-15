import * as R from 'ramda';
import {
  ABSTRACT_STIX_CYBER_OBSERVABLE,
  ABSTRACT_STIX_CYBER_OBSERVABLE_HASHED_OBSERVABLE,
  buildRefRelationKey,
  schemaTypes,
} from './general';
import {
  RELATION_CREATED_BY,
  RELATION_EXTERNAL_REFERENCE,
  RELATION_OBJECT,
  RELATION_OBJECT_LABEL,
  RELATION_OBJECT_MARKING,
} from './stixMetaRelationship';
import { RELATION_RELATED_TO } from './stixCoreRelationship';
import { STIX_SIGHTING_RELATIONSHIP } from './stixSightingRelationship';

export const ENTITY_AUTONOMOUS_SYSTEM = 'Autonomous-System';
export const ENTITY_DIRECTORY = 'Directory';
export const ENTITY_DOMAIN_NAME = 'Domain-Name';
export const ENTITY_EMAIL_ADDR = 'Email-Addr';
export const ENTITY_EMAIL_MESSAGE = 'Email-Message';
export const ENTITY_EMAIL_MIME_PART_TYPE = 'Email-Mime-Part-Type';
export const ENTITY_HASHED_OBSERVABLE_ARTIFACT = 'Artifact';
export const ENTITY_HASHED_OBSERVABLE_STIX_FILE = 'StixFile'; // Because File already used
export const ENTITY_HASHED_OBSERVABLE_X509_CERTIFICATE = 'X509-Certificate';
export const ENTITY_IPV4_ADDR = 'IPv4-Addr';
export const ENTITY_IPV6_ADDR = 'IPv6-Addr';
export const ENTITY_MAC_ADDR = 'Mac-Addr';
export const ENTITY_MUTEX = 'Mutex';
export const ENTITY_NETWORK_TRAFFIC = 'Network-Traffic';
export const ENTITY_PROCESS = 'Process';
export const ENTITY_SOFTWARE = 'Software';
export const ENTITY_URL = 'Url';
export const ENTITY_USER_ACCOUNT = 'User-Account';
export const ENTITY_WINDOWS_REGISTRY_KEY = 'Windows-Registry-Key';
export const ENTITY_WINDOWS_REGISTRY_VALUE_TYPE = 'Windows-Registry-Value-Type';
export const ENTITY_CRYPTOGRAPHIC_KEY = 'Cryptographic-Key'; // Custom
export const ENTITY_CRYPTOGRAPHIC_WALLET = 'Cryptocurrency-Wallet'; // Custom
export const ENTITY_HOSTNAME = 'Hostname'; // Custom
export const ENTITY_TEXT = 'Text'; // Custom
export const ENTITY_USER_AGENT = 'User-Agent'; // Custom
export const ENTITY_BANK_ACCOUNT = 'Bank-Account'; // Custom
export const ENTITY_PHONE_NUMBER = 'Phone-Number'; // Custom
export const ENTITY_PAYMENT_CARD = 'Payment-Card'; // Custom
export const ENTITY_MEDIA_CONTENT = 'Media-Content'; // Custom

const STIX_CYBER_OBSERVABLES_HASHED_OBSERVABLES = [
  ENTITY_HASHED_OBSERVABLE_ARTIFACT,
  ENTITY_HASHED_OBSERVABLE_STIX_FILE,
  ENTITY_HASHED_OBSERVABLE_X509_CERTIFICATE,
];
schemaTypes.register(ABSTRACT_STIX_CYBER_OBSERVABLE_HASHED_OBSERVABLE, STIX_CYBER_OBSERVABLES_HASHED_OBSERVABLES);
const STIX_CYBER_OBSERVABLES = [
  ENTITY_AUTONOMOUS_SYSTEM,
  ENTITY_DIRECTORY,
  ENTITY_DOMAIN_NAME,
  ENTITY_EMAIL_ADDR,
  ENTITY_EMAIL_MESSAGE,
  ENTITY_EMAIL_MIME_PART_TYPE,
  ENTITY_HASHED_OBSERVABLE_ARTIFACT,
  ENTITY_HASHED_OBSERVABLE_STIX_FILE,
  ENTITY_HASHED_OBSERVABLE_X509_CERTIFICATE,
  ENTITY_IPV4_ADDR,
  ENTITY_IPV6_ADDR,
  ENTITY_MAC_ADDR,
  ENTITY_MUTEX,
  ENTITY_NETWORK_TRAFFIC,
  ENTITY_PROCESS,
  ENTITY_SOFTWARE,
  ENTITY_URL,
  ENTITY_USER_ACCOUNT,
  ENTITY_WINDOWS_REGISTRY_KEY,
  ENTITY_WINDOWS_REGISTRY_VALUE_TYPE,
  ENTITY_CRYPTOGRAPHIC_KEY,
  ENTITY_CRYPTOGRAPHIC_WALLET,
  ENTITY_HOSTNAME,
  ENTITY_USER_AGENT,
  ENTITY_TEXT,
  ENTITY_BANK_ACCOUNT,
  ENTITY_PHONE_NUMBER,
  ENTITY_PAYMENT_CARD,
  ENTITY_MEDIA_CONTENT,
];
schemaTypes.register(ABSTRACT_STIX_CYBER_OBSERVABLE, STIX_CYBER_OBSERVABLES);

export const isStixCyberObservableHashedObservable = (type) => R.includes(type, STIX_CYBER_OBSERVABLES_HASHED_OBSERVABLES);
export const isStixCyberObservable = (type) => R.includes(type, STIX_CYBER_OBSERVABLES) || type === ABSTRACT_STIX_CYBER_OBSERVABLE;

export const stixCyberObservableOptions = {
  StixCyberObservablesFilter: {
    createdBy: buildRefRelationKey(RELATION_CREATED_BY),
    markedBy: buildRefRelationKey(RELATION_OBJECT_MARKING),
    labelledBy: buildRefRelationKey(RELATION_OBJECT_LABEL),
    relatedTo: buildRefRelationKey(RELATION_RELATED_TO),
    objectContained: buildRefRelationKey(RELATION_OBJECT),
    containedBy: buildRefRelationKey(RELATION_OBJECT), // ASK SAM
    hasExternalReference: buildRefRelationKey(RELATION_EXTERNAL_REFERENCE),
    sightedBy: buildRefRelationKey(STIX_SIGHTING_RELATIONSHIP),
    hashes_MD5: 'hashes.MD5',
    hashes_SHA1: 'hashes.SHA-1',
    hashes_SHA256: 'hashes.SHA-256',
  },
  StixCyberObservablesOrdering: {}
};

const stixCyberObservableFieldsToBeUpdated = {
  [ENTITY_AUTONOMOUS_SYSTEM]: ['x_opencti_description', 'x_opencti_score', 'number', 'name', 'rir'],
  [ENTITY_DIRECTORY]: ['x_opencti_description', 'x_opencti_score', 'path', 'path_enc', 'ctime', 'mtime', 'atime'],
  [ENTITY_DOMAIN_NAME]: ['x_opencti_description', 'x_opencti_score', 'value'],
  [ENTITY_EMAIL_ADDR]: ['x_opencti_description', 'x_opencti_score', 'value', 'display_name'],
  [ENTITY_EMAIL_MESSAGE]: [
    'x_opencti_description',
    'x_opencti_score',
    'is_multipart',
    'attribute_date',
    'content_type',
    'message_id',
    'subject',
    'received_lines',
    'body',
  ],
  [ENTITY_EMAIL_MIME_PART_TYPE]: [
    'x_opencti_description',
    'x_opencti_score',
    'body',
    'content_type',
    'content_disposition',
  ],
  [ENTITY_HASHED_OBSERVABLE_ARTIFACT]: [
    'x_opencti_description',
    'x_opencti_score',
    'hashes',
    'mime_type',
    'payload_bin',
    'url',
    'encryption_algorithm',
    'decryption_key',
    'x_opencti_additional_names',
  ],
  [ENTITY_HASHED_OBSERVABLE_STIX_FILE]: [
    'x_opencti_description',
    'x_opencti_score',
    'hashes',
    'extensions',
    'size',
    'name',
    'name_enc',
    'magic_number_hex',
    'ctime',
    'mtime',
    'atime',
    'x_opencti_additional_names',
  ],
  [ENTITY_HASHED_OBSERVABLE_X509_CERTIFICATE]: [
    'x_opencti_description',
    'x_opencti_score',
    'is_self_signed',
    'version',
    'serial_number',
    'signature_algorithm',
    'issuer',
    'validity_not_before',
    'validity_not_after',
    'subject',
    'subject_public_key_algorithm',
    'subject_public_key_modulus',
    'subject_public_key_exponent',
    'basic_constraints',
    'name_constraints',
    'policy_constraints',
    'key_usage',
    'extended_key_usage',
    'subject_key_identifier',
    'authority_key_identifier',
    'subject_alternative_name',
    'issuer_alternative_name',
    'subject_directory_attributes',
    'crl_distribution_points',
    'inhibit_any_policy',
    'private_key_usage_period_not_before',
    'private_key_usage_period_not_after',
    'certificate_policies',
    'policy_mappings',
  ],
  [ENTITY_IPV4_ADDR]: ['x_opencti_description', 'x_opencti_score', 'value'],
  [ENTITY_IPV6_ADDR]: ['x_opencti_description', 'x_opencti_score', 'value'],
  [ENTITY_MAC_ADDR]: ['x_opencti_description', 'x_opencti_score', 'value'],
  [ENTITY_MUTEX]: ['x_opencti_description', 'x_opencti_score', 'name'],
  [ENTITY_NETWORK_TRAFFIC]: [
    'x_opencti_description',
    'x_opencti_score',
    'extensions',
    'start',
    'end',
    'is_active',
    'src_port',
    'dst_port',
    'protocols',
    'src_byte_count',
    'dst_byte_count',
    'src_packets',
    'dst_packets',
  ],
  [ENTITY_PROCESS]: [
    'x_opencti_description',
    'x_opencti_score',
    'extensions',
    'is_hidden',
    'pid',
    'created_time',
    'cwd',
    'command_line',
    'environment_variables',
  ],
  [ENTITY_SOFTWARE]: [
    'x_opencti_description',
    'x_opencti_score',
    'name',
    'cpe',
    'swid',
    'languages',
    'vendor',
    'version',
  ],
  [ENTITY_URL]: ['x_opencti_description', 'x_opencti_score', 'value'],
  [ENTITY_USER_ACCOUNT]: [
    'x_opencti_description',
    'x_opencti_score',
    'extensions',
    'user_id',
    'credential',
    'account_login',
    'account_type',
    'display_name',
    'is_service_account',
    'is_privileged',
    'can_escalate_privs',
    'is_disabled',
    'account_created',
    'account_expires',
    'credential_last_changed',
    'account_first_login',
    'account_last_login',
  ],
  [ENTITY_WINDOWS_REGISTRY_KEY]: [
    'x_opencti_description',
    'x_opencti_score',
    'attribute_key',
    'modified_time',
    'number_of_subkeys',
  ],
  [ENTITY_WINDOWS_REGISTRY_VALUE_TYPE]: ['x_opencti_description', 'x_opencti_score', 'name', 'data', 'data_type'],
  [ENTITY_CRYPTOGRAPHIC_KEY]: ['x_opencti_description', 'x_opencti_score', 'value'],
  [ENTITY_CRYPTOGRAPHIC_WALLET]: ['x_opencti_description', 'x_opencti_score', 'value'],
  [ENTITY_HOSTNAME]: ['x_opencti_description', 'x_opencti_score', 'value'],
  [ENTITY_TEXT]: ['x_opencti_description', 'x_opencti_score', 'value'],
  [ENTITY_USER_AGENT]: ['x_opencti_description', 'x_opencti_score', 'value'],
  [ENTITY_BANK_ACCOUNT]: ['x_opencti_description', 'x_opencti_score', 'iban', 'bic', 'number'],
  [ENTITY_PHONE_NUMBER]: ['x_opencti_description', 'x_opencti_score', 'value'],
  [ENTITY_PAYMENT_CARD]: ['x_opencti_description', 'x_opencti_score', 'number', 'expiration_date', 'cvv', 'holder_name'],
};
R.forEachObjIndexed((value, key) => schemaTypes.registerUpsertAttributes(key, value), stixCyberObservableFieldsToBeUpdated);

const stixCyberObservablesAttributes = {
  [ENTITY_AUTONOMOUS_SYSTEM]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'number',
    'name',
    'rir',
  ],
  [ENTITY_DIRECTORY]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'path',
    'path_enc',
    'ctime',
    'mtime',
    'atime',
  ],
  [ENTITY_DOMAIN_NAME]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'value',
  ],
  [ENTITY_EMAIL_ADDR]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'value',
    'display_name',
  ],
  [ENTITY_EMAIL_MESSAGE]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'is_multipart',
    'attribute_date',
    'content_type',
    'message_id',
    'subject',
    'received_lines',
    'body',
  ],
  [ENTITY_EMAIL_MIME_PART_TYPE]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'body',
    'content_type',
    'content_disposition',
  ],
  [ENTITY_HASHED_OBSERVABLE_ARTIFACT]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'mime_type',
    'hashes',
    'payload_bin',
    'url',
    'encryption_algorithm',
    'decryption_key',
    'x_opencti_additional_names',
  ],
  [ENTITY_HASHED_OBSERVABLE_STIX_FILE]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'hashes',
    'extensions',
    'size',
    'name',
    'name_enc',
    'magic_number_hex',
    'ctime',
    'mtime',
    'atime',
    'x_opencti_additional_names',
    'obsContent',
  ],
  [ENTITY_HASHED_OBSERVABLE_X509_CERTIFICATE]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'hashes',
    'is_self_signed',
    'version',
    'serial_number',
    'signature_algorithm',
    'issuer',
    'validity_not_before',
    'validity_not_after',
    'subject',
    'subject_public_key_algorithm',
    'subject_public_key_modulus',
    'subject_public_key_exponent',
    'basic_constraints',
    'name_constraints',
    'policy_constraints',
    'key_usage',
    'extended_key_usage',
    'subject_key_identifier',
    'authority_key_identifier',
    'subject_alternative_name',
    'issuer_alternative_name',
    'subject_directory_attributes',
    'crl_distribution_points',
    'inhibit_any_policy',
    'private_key_usage_period_not_before',
    'private_key_usage_period_not_after',
    'certificate_policies',
    'policy_mappings',
  ],
  [ENTITY_IPV4_ADDR]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'value',
  ],
  [ENTITY_IPV6_ADDR]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'value',
  ],
  [ENTITY_MAC_ADDR]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'value',
  ],
  [ENTITY_MUTEX]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'name',
  ],
  [ENTITY_NETWORK_TRAFFIC]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'extensions',
    'start',
    'end',
    'is_active',
    'src_port',
    'dst_port',
    'protocols',
    'src_byte_count',
    'dst_byte_count',
    'src_packets',
    'dst_packets',
  ],
  [ENTITY_PROCESS]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'extensions',
    'is_hidden',
    'pid',
    'created_time',
    'cwd',
    'command_line',
    'environment_variables',
    // windows-process-ext
    'aslr_enabled',
    'dep_enabled',
    'priority',
    'owner_sid',
    'window_title',
    'startup_info',
    'integrity_level',
    // windows-service-ext
    'service_name',
    'descriptions',
    'display_name',
    'group_name',
    'start_type',
    'service_type',
    'service_status',
  ],
  [ENTITY_SOFTWARE]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'name',
    'cpe',
    'swid',
    'languages',
    'vendor',
    'version',
  ],
  [ENTITY_URL]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'value',
  ],
  [ENTITY_USER_ACCOUNT]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'extensions',
    'user_id',
    'credential',
    'account_login',
    'account_type',
    'display_name',
    'is_service_account',
    'is_privileged',
    'can_escalate_privs',
    'is_disabled',
    'account_created',
    'account_expires',
    'credential_last_changed',
    'account_first_login',
    'account_last_login',
  ],
  [ENTITY_WINDOWS_REGISTRY_KEY]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'attribute_key',
    'modified_time',
    'number_of_subkeys',
  ],
  [ENTITY_WINDOWS_REGISTRY_VALUE_TYPE]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'name',
    'data',
    'data_type',
  ],
  [ENTITY_CRYPTOGRAPHIC_KEY]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'value',
  ],
  [ENTITY_CRYPTOGRAPHIC_WALLET]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'value',
  ],
  [ENTITY_HOSTNAME]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'value',
  ],
  [ENTITY_TEXT]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'value',
  ],
  [ENTITY_USER_AGENT]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'value',
  ],
  [ENTITY_BANK_ACCOUNT]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'iban',
    'bic',
    'account_number',
  ],
  [ENTITY_PHONE_NUMBER]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'value',
  ],
  [ENTITY_PAYMENT_CARD]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'card_number',
    'expiration_date',
    'cvv',
    'holder_name'
  ],
  [ENTITY_MEDIA_CONTENT]: [
    'internal_id',
    'standard_id',
    'entity_type',
    'x_opencti_stix_ids',
    'spec_version',
    'created_at',
    'i_created_at_day',
    'i_created_at_month',
    'i_created_at_year',
    'updated_at',
    'x_opencti_description',
    'x_opencti_score',
    'title',
    'content',
    'media_category',
    'url',
    'publication_date',
  ],
};
R.forEachObjIndexed((value, key) => schemaTypes.registerAttributes(key, value), stixCyberObservablesAttributes);
