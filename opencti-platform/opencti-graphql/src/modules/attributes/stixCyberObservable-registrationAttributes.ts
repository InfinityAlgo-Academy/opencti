import * as R from 'ramda';
import type { AttributeDefinition, } from '../../schema/attribute-definition';
import { schemaAttributesDefinition } from '../../schema/schema-attributes';
import {
  ENTITY_AUTONOMOUS_SYSTEM,
  ENTITY_CREDENTIAL,
  ENTITY_CRYPTOGRAPHIC_KEY,
  ENTITY_DIRECTORY,
  ENTITY_DOMAIN_NAME,
  ENTITY_EMAIL_ADDR,
  ENTITY_EMAIL_MESSAGE,
  ENTITY_EMAIL_MIME_PART_TYPE,
  ENTITY_FINANCIAL_ACCOUNT,
  ENTITY_FINANCIAL_ASSET,
  ENTITY_FINANCIAL_TRANSACTION,
  ENTITY_HASHED_OBSERVABLE_ARTIFACT,
  ENTITY_HASHED_OBSERVABLE_STIX_FILE,
  ENTITY_HASHED_OBSERVABLE_X509_CERTIFICATE,
  ENTITY_HOSTNAME,
  ENTITY_IPV4_ADDR,
  ENTITY_IPV6_ADDR,
  ENTITY_MAC_ADDR,
  ENTITY_MEDIA_CONTENT,
  ENTITY_MUTEX,
  ENTITY_NETWORK_TRAFFIC,
  ENTITY_PAYMENT_CARD,
  ENTITY_PHONE_NUMBER,
  ENTITY_PROCESS,
  ENTITY_SOFTWARE,
  ENTITY_TEXT,
  ENTITY_TRACKING_NUMBER,
  ENTITY_URL,
  ENTITY_USER_ACCOUNT,
  ENTITY_USER_AGENT,
  ENTITY_WINDOWS_REGISTRY_KEY,
  ENTITY_WINDOWS_REGISTRY_VALUE_TYPE
} from '../../schema/stixCyberObservable';
import { ABSTRACT_STIX_CYBER_OBSERVABLE } from '../../schema/general';
import { ENTITY_TYPE_USER } from '../../schema/internalObject';

const stixCyberObservableAttributes: Array<AttributeDefinition> = [
  { name: 'x_opencti_description', label: 'Observable description', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  { name: 'x_opencti_score', label: 'Score', type: 'numeric', precision: 'integer', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
];
schemaAttributesDefinition.registerAttributes(ABSTRACT_STIX_CYBER_OBSERVABLE, stixCyberObservableAttributes);

const hashDefinition: AttributeDefinition = {
  name: 'hashes',
  label: 'Hashes',
  type: 'object',
  format: 'standard',
  editDefault: false,
  mappings: [
    { name: 'MD5', label: 'MD5', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'SHA-1', label: 'SHA-1', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'SHA-256', label: 'SHA-256', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'SHA-512', label: 'SHA-512', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'SHA3-256', label: 'SHA3-256', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: false },
    { name: 'SHA3-512', label: 'SHA3-512', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: false },
    { name: 'SSDEEP', label: 'SSDEEP', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'SDHASH', label: 'SDHASH', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: false },
    { name: 'TLSH', label: 'TLSH', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: false },
    { name: 'LZJD', label: 'LZJD', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: false },
  ],
  mandatoryType: 'no',
  isFilterable: true,
  multiple: false,
  upsert: true
};

const stixCyberObservablesAttributes: { [k: string]: Array<AttributeDefinition> } = {
  [ENTITY_AUTONOMOUS_SYSTEM]: [
    { name: 'number', label: 'Autonomous system number', type: 'numeric', precision: 'integer', mandatoryType: 'external', editDefault: true, multiple: false, upsert: true, isFilterable: true },
    { name: 'name', label: 'Name', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'rir', label: 'RIR', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_DIRECTORY]: [
    { name: 'path', label: 'Path', type: 'string', format: 'short', mandatoryType: 'external', editDefault: true, multiple: false, upsert: true, isFilterable: true },
    { name: 'path_enc', label: 'Path encoding', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'ctime', label: 'Ctime', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'mtime', label: 'Mtime', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'atime', label: 'Atime', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_DOMAIN_NAME]: [
    { name: 'value', label: 'Value', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_EMAIL_ADDR]: [
    { name: 'value', label: 'Value', type: 'string', format: 'short', mandatoryType: 'external', editDefault: true, multiple: false, upsert: true, isFilterable: true },
    { name: 'display_name', label: 'Display name', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_EMAIL_MESSAGE]: [
    { name: 'is_multipart', label: 'Multipart', type: 'boolean', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'attribute_date', label: 'Email date', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'content_type', label: 'Content type', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'message_id', label: 'Message ID', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'subject', label: 'Subject', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'received_lines', label: 'Received lines', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: true, upsert: true, isFilterable: true },
    { name: 'body', label: 'Body', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_EMAIL_MIME_PART_TYPE]: [
    { name: 'body', label: 'Body', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'content_type', label: 'Content type', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'content_disposition', label: 'Content disposition', format: 'short', type: 'string', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_HASHED_OBSERVABLE_ARTIFACT]: [
    hashDefinition,
    { name: 'mime_type', label: 'Mime type', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'payload_bin', label: 'Payload', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'url', label: 'URL', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'encryption_algorithm', label: 'Encryption algorithm', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'decryption_key', label: 'Decryption key', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'x_opencti_additional_names', label: 'Additional names', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: true, upsert: true, isFilterable: true },
  ],
  [ENTITY_HASHED_OBSERVABLE_STIX_FILE]: [
    hashDefinition,
    { name: 'extensions', label: 'Extensions', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'size', label: 'File size', type: 'numeric', precision: 'long', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'name', label: 'Name', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'name_enc', label: 'Name encoding', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'magic_number_hex', label: 'Magic number hex', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'ctime', label: 'Ctime', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'mtime', label: 'Mtime', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'atime', label: 'Atime', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'x_opencti_additional_names', label: 'Additional names', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: true, upsert: true, isFilterable: true },
    { name: 'mime_type', label: 'Mime type', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_HASHED_OBSERVABLE_X509_CERTIFICATE]: [
    hashDefinition,
    { name: 'is_self_signed', label: 'Self signed', type: 'boolean', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'version', label: 'Version', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'serial_number', label: 'Serial number', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'signature_algorithm', label: 'Signature algorithm', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'issuer', label: 'Issuer', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'validity_not_before', label: 'Validity not before', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'validity_not_after', label: 'Validity not after', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'subject', label: 'Subject', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'subject_public_key_algorithm', label: 'Subject public key algorithm', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'subject_public_key_modulus', label: 'Subject public key modulus', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'subject_public_key_exponent', label: 'Subject public key exponent', type: 'numeric', precision: 'integer', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'basic_constraints', label: 'Basic constraints', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'name_constraints', label: 'Name constraints', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'policy_constraints', label: 'Policy constraints', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'key_usage', label: 'Key usage', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'extended_key_usage', label: 'Extended key usage', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'subject_key_identifier', label: 'Subject key identifier', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'authority_key_identifier', label: 'Authority key identifier', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'subject_alternative_name', label: 'Subject alternative name', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'issuer_alternative_name', label: 'Issuer alternative name', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'subject_directory_attributes', label: 'Subject directory attributes', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'crl_distribution_points', label: 'CRL distribution points', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'inhibit_any_policy', label: 'Inhibit any policy', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'private_key_usage_period_not_before', label: 'Private key usage not before', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'private_key_usage_period_not_after', label: 'Private key usage not after', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'certificate_policies', label: 'Certifiate policies', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'policy_mappings', label: 'Policy mappings', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_IPV4_ADDR]: [
    { name: 'value', label: 'Value', type: 'string', format: 'short', mandatoryType: 'external', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_IPV6_ADDR]: [
    { name: 'value', label: 'Value', type: 'string', format: 'short', mandatoryType: 'external', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_MAC_ADDR]: [
    { name: 'value', label: 'Value', type: 'string', format: 'short', mandatoryType: 'external', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_MUTEX]: [
    { name: 'name', label: 'Name', type: 'string', format: 'short', mandatoryType: 'external', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_NETWORK_TRAFFIC]: [
    { name: 'extensions', label: 'Extensions', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'start', label: 'Network traffic start date', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'end', label: 'Network traffic end date', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'is_active', label: 'Network traffic active', type: 'boolean', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'src_port', label: 'SRC port', type: 'numeric', precision: 'integer', editDefault: false, mandatoryType: 'no', multiple: false, upsert: true, isFilterable: true },
    { name: 'dst_port', label: 'DST port', type: 'numeric', precision: 'integer', editDefault: false, mandatoryType: 'no', multiple: false, upsert: true, isFilterable: true },
    { name: 'protocols', label: 'Protocols', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: true, upsert: true, isFilterable: true },
    { name: 'src_byte_count', label: 'SRC byte count', type: 'numeric', precision: 'integer', editDefault: false, mandatoryType: 'no', multiple: false, upsert: true, isFilterable: true },
    { name: 'dst_byte_count', label: 'DST byte count', type: 'numeric', precision: 'integer', editDefault: false, mandatoryType: 'no', multiple: false, upsert: true, isFilterable: true },
    { name: 'src_packets', label: 'SRC packets', type: 'numeric', precision: 'integer', editDefault: false, mandatoryType: 'no', multiple: false, upsert: true, isFilterable: true },
    { name: 'dst_packets', label: 'DST packets', type: 'numeric', precision: 'integer', editDefault: false, mandatoryType: 'no', multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_PROCESS]: [
    { name: 'extensions', label: 'Extensions', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'is_hidden', label: 'Hidden', type: 'boolean', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'pid', label: 'PID', type: 'numeric', precision: 'long', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'created_time', label: 'Process creation date', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'cwd', label: 'CWD', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'command_line', label: 'Command line', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'environment_variables', label: 'Environment variables', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: true, upsert: true, isFilterable: true },
    // windows-process-ext
    { name: 'aslr_enabled', label: 'ASLR enabled', type: 'boolean', mandatoryType: 'no', editDefault: false, multiple: false, upsert: false, isFilterable: true },
    { name: 'dep_enabled', label: 'DEP enabled', type: 'boolean', mandatoryType: 'no', editDefault: false, multiple: false, upsert: false, isFilterable: true },
    { name: 'priority', label: 'Priority', type: 'string', format: 'vocabulary', vocabularyCategory: 'case_priority_ov', mandatoryType: 'no', editDefault: false, multiple: false, upsert: false, isFilterable: true },
    { name: 'owner_sid', label: 'Owner sid', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: false, isFilterable: true },
    { name: 'window_title', label: 'Window title', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: false, isFilterable: true },
    // { name: 'startup_info', label: 'Startup information', type: 'json', mandatoryType: 'no', editDefault: false, multiple: false, upsert: false, isFilterable: false },
    // TODO introduce later
    { name: 'integrity_level', label: 'Integrity level', type: 'string', format: 'vocabulary', vocabularyCategory: 'integrity_level_ov', mandatoryType: 'no', editDefault: false, multiple: false, upsert: false, isFilterable: true },
    // windows-service-ext
    { name: 'service_name', label: 'Service name', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: false, isFilterable: true },
    { name: 'descriptions', label: 'Descriptions', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: true, upsert: false, isFilterable: true },
    { name: 'display_name', label: 'Display name', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: false, isFilterable: true },
    { name: 'group_name', label: 'Group name', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: false, isFilterable: true },
    { name: 'start_type', label: 'Start type', type: 'string', format: 'vocabulary', vocabularyCategory: 'start_type_ov', mandatoryType: 'no', editDefault: false, multiple: false, upsert: false, isFilterable: true },
    { name: 'service_type', label: 'Service type', type: 'string', format: 'vocabulary', vocabularyCategory: 'service_type_ov', mandatoryType: 'no', editDefault: false, multiple: false, upsert: false, isFilterable: true },
    { name: 'service_status', label: 'Service status', type: 'string', format: 'vocabulary', vocabularyCategory: 'service_status_ov', mandatoryType: 'no', editDefault: false, multiple: false, upsert: false, isFilterable: true },
    // Missing serviceDlls
  ],
  [ENTITY_SOFTWARE]: [
    { name: 'name', label: 'Name', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'cpe', label: 'CPE', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'swid', label: 'SWID', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'languages', label: 'Languages', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: true, upsert: true, isFilterable: true },
    { name: 'vendor', label: 'Vendor', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'version', label: 'Version', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_URL]: [
    { name: 'value', label: 'Value', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_USER_ACCOUNT]: [
    { name: 'extensions', label: 'Extensions', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    {
      name: 'user_id',
      label: 'User ID',
      type: 'string',
      format: 'id',
      entityTypes: [ENTITY_TYPE_USER],
      mandatoryType: 'no',
      editDefault: false,
      multiple: false,
      upsert: true,
      isFilterable: true
    },
    { name: 'credential', label: 'Credential', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'account_login', label: 'Account login', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'account_type', label: 'Account type', type: 'string', format: 'vocabulary', vocabularyCategory: 'account_type_ov', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'display_name', label: 'Display name', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'is_service_account', label: 'Service account', type: 'boolean', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'is_privileged', label: 'Privileged', type: 'boolean', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'can_escalate_privs', label: 'Can escalate privs', type: 'boolean', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'is_disabled', label: 'Disabled', type: 'boolean', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'account_created', label: 'Account creation date', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'account_expires', label: 'Account expiration date', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'credential_last_changed', label: 'Credential last modification date', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'account_first_login', label: 'Account first login date', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'account_last_login', label: 'Account last login date', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_WINDOWS_REGISTRY_KEY]: [
    { name: 'attribute_key', label: 'Key', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'modified_time', label: 'Key modification date', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'number_of_subkeys', label: 'Number of sub-keys', type: 'numeric', precision: 'integer', editDefault: false, mandatoryType: 'no', multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_WINDOWS_REGISTRY_VALUE_TYPE]: [
    { name: 'name', label: 'Name', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'data', label: 'Data', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'data_type', label: 'Data type', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_CRYPTOGRAPHIC_KEY]: [
    { name: 'value', label: 'Value', type: 'string', format: 'short', mandatoryType: 'external', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_HOSTNAME]: [
    { name: 'value', label: 'Value', type: 'string', format: 'short', mandatoryType: 'external', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_FINANCIAL_ACCOUNT]: [
    { name: 'account_number', label: 'Account Number', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'bic_number', label: 'BIC Number', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'iban_number', label: 'IBAN Number', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'account_type', label: 'Account Type', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'account_status', label: 'Account Status', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'currency_code', label: 'Currency Code', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_FINANCIAL_ASSET]: [
    { name: 'asset_name', label: 'Asset Name', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'asset_type', label: 'Asset Type', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'asset_value', label: 'Asset Value', type: 'numeric', precision: 'float', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'currency_code', label: 'Currency Code', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_FINANCIAL_TRANSACTION]: [
    { name: 'transaction_date', label: 'Transaction Date', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'transaction_value', label: 'Transaction Value', type: 'numeric', precision: 'float', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'currency_code', label: 'Currency Code', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_TEXT]: [
    { name: 'value', label: 'Value', type: 'string', format: 'short', mandatoryType: 'external', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_USER_AGENT]: [
    { name: 'value', label: 'Value', type: 'string', format: 'short', mandatoryType: 'external', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_PHONE_NUMBER]: [
    { name: 'value', label: 'Value', type: 'string', format: 'short', mandatoryType: 'external', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_PAYMENT_CARD]: [
    { name: 'card_number', label: 'Card number', type: 'string', format: 'short', mandatoryType: 'external', editDefault: true, multiple: false, upsert: false, isFilterable: true },
    { name: 'expiration_date', label: 'Expiration date', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'cvv', label: 'CVV', type: 'numeric', precision: 'integer', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'holder_name', label: 'Holder name', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_MEDIA_CONTENT]: [
    { name: 'title', label: 'Title', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'content', label: 'Content', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'media_category', label: 'Media category', type: 'string', format: 'short', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
    { name: 'url', label: 'URL', type: 'string', format: 'short', mandatoryType: 'external', editDefault: true, multiple: false, upsert: false, isFilterable: true },
    { name: 'publication_date', label: 'Media publication date', type: 'date', mandatoryType: 'no', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_CREDENTIAL]: [
    { name: 'value', label: 'Value', type: 'string', format: 'short', mandatoryType: 'external', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
  [ENTITY_TRACKING_NUMBER]: [
    { name: 'value', label: 'Value', type: 'string', format: 'short', mandatoryType: 'external', editDefault: false, multiple: false, upsert: true, isFilterable: true },
  ],
};
R.forEachObjIndexed((value, key) => schemaAttributesDefinition.registerAttributes(key as string, value), stixCyberObservablesAttributes);
