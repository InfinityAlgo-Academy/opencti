import type { AttributeDefinition } from '../../schema/attribute-definition';
import {
  confidence,
  created,
  lang,
  modified,
  relationshipType,
  revoked,
  specVersion,
  xOpenctiStixIds
} from '../../schema/attribute-definition';
import { schemaAttributesDefinition } from '../../schema/schema-attributes';
import { ABSTRACT_STIX_RELATIONSHIP } from '../../schema/general';

const stixRelationshipAttributes: Array<AttributeDefinition> = [
  xOpenctiStixIds,
  specVersion,
  created,
  modified,
  revoked,
  confidence,
  lang,
  relationshipType,
];
schemaAttributesDefinition.registerAttributes(ABSTRACT_STIX_RELATIONSHIP, stixRelationshipAttributes);
