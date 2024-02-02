import { ENTITY_TYPE_THREAT_ACTOR_GROUP } from '../../../../src/schema/stixDomainObject';
import { ENTITY_TYPE_IDENTITY_ORGANIZATION } from '../../../../src/modules/organization/organization-types';
import { STIX_SIGHTING_RELATIONSHIP } from '../../../../src/schema/stixSightingRelationship';
import { type CsvMapperParsed, CsvMapperRepresentationType } from '../../../../src/modules/internal/csvMapper/csvMapper-types';

export const csvMapperMockSimpleSighting: Partial<CsvMapperParsed> = {
  id: 'mapper-mock-simple-relationship',
  has_header: true,
  separator: ';',
  representations: [
    {
      id: 'representation01',
      type: CsvMapperRepresentationType.Entity,
      target: {
        entity_type: ENTITY_TYPE_THREAT_ACTOR_GROUP,
      },
      attributes: [
        {
          key: 'name',
          column: {
            column_name: 'A',
          },
        },
      ]
    }, {
      id: 'representation02',
      type: CsvMapperRepresentationType.Entity,
      target: {
        entity_type: ENTITY_TYPE_IDENTITY_ORGANIZATION,
      },
      attributes: [
        {
          key: 'name',
          column: {
            column_name: 'B',
          },
        },
      ]
    },
    {
      id: 'representation01-SIGHTING-representation02',
      type: CsvMapperRepresentationType.Relationship,
      target: {
        entity_type: STIX_SIGHTING_RELATIONSHIP,
      },
      attributes: [
        {
          key: 'from',
          based_on: {
            representations: ['representation01'],
          }
        },
        {
          key: 'to',
          based_on: {
            representations: ['representation02'],
          }
        },
        {
          key: 'confidence',
          column: {
            column_name: 'C',
          },
        },
        {
          key: 'attribute_count',
          column: {
            column_name: 'D',
          },
        },
        {
          key: 'first_seen',
          column: {
            column_name: 'E',
          },
        },
        {
          key: 'last_seen',
          column: {
            column_name: 'F',
          },
        },
      ]
    },
  ]
};
