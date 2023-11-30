import { describe, expect, it } from 'vitest';

import { ADMIN_USER, buildStandardUser, testContext } from '../../utils/testQuery';
import { isStixMatchFilterGroup_MockableForUnitTests } from '../../../src/utils/filtering/filtering-stix/stix-filtering';

import stixReports from '../../data/stream-events/stream-event-stix2-reports.json';
import stixIndicators from '../../data/stream-events/stream-event-stix2-indicators.json';
import stixBundle from '../../data/DATA-TEST-STIX2_v2.json';
import type { FilterGroup } from '../../../src/generated/graphql';

const stixReport = stixReports[0]; //  confidence 3, revoked=false, labels=report, TLP:TEST
const stixIndicator = stixIndicators[0]; // confidence 75, revoked=true, no label

const TLP_CLEAR_ID = 'marking-definition--613f2e26-407d-48c7-9eca-b8e91df99dc9';
const WHITE_TLP = { standard_id: TLP_CLEAR_ID, internal_id: '' };

// we build a mock resolution map during the testing below
const MOCK_RESOLUTION_MAP: Map<string, string> = new Map();

const testManyStix = async (stixs: any[], callback: (stix: any) => Promise<boolean>): Promise<[match: number, notMatch: number]> => {
  const results = await Promise.all(stixs.map(async (stix) => callback(stix)));
  return [
    results.reduce((acc, cur) => (cur ? acc + 1 : acc), 0),
    results.reduce((acc, cur) => (!cur ? acc + 1 : acc), 0),
  ];
};

const makeCallback = (filterGroup: FilterGroup): (stix: any) => Promise<boolean> => {
  return async (stix: any) => isStixMatchFilterGroup_MockableForUnitTests(testContext, ADMIN_USER, stix, filterGroup, MOCK_RESOLUTION_MAP);
};

describe('Stix Filtering', () => {
  it('throws error when filter group is invalid', async () => {
    const multipleKeys = {
      mode: 'and',
      filters: [
        { key: ['entity_type'], mode: 'or', operator: 'eq', values: ['Report'] }, // valid
        { key: ['createdBy', 'objectAssignee'], mode: 'or', operator: 'eq', values: ['id1'] }, // invalid
      ],
      filterGroups: [],
    } as FilterGroup;
    await expect(() => isStixMatchFilterGroup_MockableForUnitTests(testContext, ADMIN_USER, stixReport, multipleKeys, MOCK_RESOLUTION_MAP)).rejects.toThrowError('Stix filtering can only be executed on a unique filter key');

    const multipleKeysNested = {
      mode: 'and',
      filters: [],
      filterGroups: [{
        mode: 'and',
        filters: [
          { key: ['entity_type'], mode: 'or', operator: 'eq', values: ['Report'] }, // valid
          { key: ['createdBy', 'objectAssignee'], mode: 'or', operator: 'eq', values: ['id1'] }, // invalid
        ],
        filterGroups: [],
      }],
    } as FilterGroup;

    await expect(() => isStixMatchFilterGroup_MockableForUnitTests(testContext, ADMIN_USER, stixReport, multipleKeysNested, MOCK_RESOLUTION_MAP)).rejects.toThrowError('Stix filtering can only be executed on a unique filter key');

    const unhandledKeys = {
      mode: 'and',
      filters: [
        { key: ['entity_type'], mode: 'or', operator: 'eq', values: ['Report'] }, // valid
        { key: ['bad_key'], mode: 'or', operator: 'eq', values: ['id1'] }, // invalid
      ],
      filterGroups: [],
    } as FilterGroup;

    await expect(() => isStixMatchFilterGroup_MockableForUnitTests(testContext, ADMIN_USER, stixReport, unhandledKeys, MOCK_RESOLUTION_MAP)).rejects.toThrowError('Stix filtering is not compatible with the provided filter key ["bad_key"]');

    const unhandledKeysNested = {
      mode: 'and',
      filters: [],
      filterGroups: [{
        mode: 'and',
        filters: [
          { key: ['entity_type'], mode: 'or', operator: 'eq', values: ['Report'] }, // valid
          { key: ['bad_key'], mode: 'or', operator: 'eq', values: ['id1'] }, // invalid
        ],
        filterGroups: [],
      }],
    } as FilterGroup;

    await expect(() => isStixMatchFilterGroup_MockableForUnitTests(testContext, ADMIN_USER, stixReport, unhandledKeysNested, MOCK_RESOLUTION_MAP)).rejects.toThrowError('Stix filtering is not compatible with the provided filter key ["bad_key"]');

    const notArrayKeys = {
      mode: 'and',
      filters: [
        { key: 'entity_type', mode: 'or', operator: 'eq', values: ['Report'] }, // invalid
      ],
      filterGroups: [],
    } as unknown as FilterGroup;

    await expect(() => isStixMatchFilterGroup_MockableForUnitTests(testContext, ADMIN_USER, stixReport, notArrayKeys, MOCK_RESOLUTION_MAP)).rejects.toThrowError('The provided filter key is not an array - got "entity_type"');
  });

  it('prevent access to stix object according to marking', async () => {
    const filterGroup = {
      mode: 'and',
      filters: [{
        key: ['entity_type'],
        mode: 'or',
        operator: 'eq',
        values: ['Report']
      }],
      filterGroups: [],
    } as FilterGroup;

    const WHITE_USER = buildStandardUser([WHITE_TLP]);
    expect(await isStixMatchFilterGroup_MockableForUnitTests(testContext, WHITE_USER, stixReport, filterGroup, MOCK_RESOLUTION_MAP)).toEqual(false);
  });

  it('matches stix objects with basic filter groups', async () => {
    let filterGroup = {
      mode: 'and',
      filters: [{
        key: ['entity_type'],
        mode: 'or',
        operator: 'eq',
        values: ['Report']
      }],
      filterGroups: [],
    } as FilterGroup;
    expect(await isStixMatchFilterGroup_MockableForUnitTests(testContext, ADMIN_USER, stixReport, filterGroup, MOCK_RESOLUTION_MAP)).toEqual(true);
    expect(await isStixMatchFilterGroup_MockableForUnitTests(testContext, ADMIN_USER, stixIndicator, filterGroup, MOCK_RESOLUTION_MAP)).toEqual(false);

    filterGroup = {
      mode: 'and',
      filters: [{
        key: ['entity_type'],
        mode: 'or',
        operator: 'eq',
        values: ['Report', 'Indicator']
      }],
      filterGroups: [],
    } as FilterGroup;

    expect(await isStixMatchFilterGroup_MockableForUnitTests(testContext, ADMIN_USER, stixReport, filterGroup, MOCK_RESOLUTION_MAP)).toEqual(true);
    expect(await isStixMatchFilterGroup_MockableForUnitTests(testContext, ADMIN_USER, stixIndicator, filterGroup, MOCK_RESOLUTION_MAP)).toEqual(true);
  });

  //--------------------------------------------------------------------------------------------------------------------
  // Now testing complex filters with edge cases
  describe('Complex filtering cases', () => {
    it('using all types of filter keys (string, numeric, boolean)', async () => {
      MOCK_RESOLUTION_MAP.set('id-for-label-indicator', 'indicator');
      MOCK_RESOLUTION_MAP.set('id-for-marking-tlp:green', 'marking-definition--613f2e26-407d-48c7-9eca-b8e91df99dc9');

      const filterGroup = {
        mode: 'and',
        filters: [],
        filterGroups: [
          {
            mode: 'and',
            filters: [
              { key: ['entity_type'], mode: 'or', operator: 'eq', values: ['Report', 'Indicator'] },
              { key: ['confidence'], mode: 'and', operator: 'gt', values: ['25'] }
            ],
            filterGroups: [],
          },
          {
            mode: 'and',
            filters: [
              { key: ['revoked'], mode: 'or', operator: 'eq', values: ['true'] },
              { key: ['objectLabel'], mode: 'or', operator: 'eq', values: ['id-for-label-indicator'] },
              { key: ['objectMarking'], mode: 'or', operator: 'eq', values: ['id-for-marking-tlp:green'] }
            ],
            filterGroups: [],
          },
        ],
      } as FilterGroup;
      expect(await isStixMatchFilterGroup_MockableForUnitTests(testContext, ADMIN_USER, stixReport, filterGroup, MOCK_RESOLUTION_MAP)).toEqual(false);
      expect(await isStixMatchFilterGroup_MockableForUnitTests(testContext, ADMIN_USER, stixIndicator, filterGroup, MOCK_RESOLUTION_MAP)).toEqual(true);
    });

    it('using mixed entity types', async () => {
      let filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Malware', 'Software'], mode: 'or' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([3, 61]); // 2 malware + 1 software

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Malware'], mode: 'or' }],
        filterGroups: [
          {
            mode: 'or',
            filters: [{ key: ['entity_type'], operator: 'eq', values: ['Software'], mode: 'or' }],
            filterGroups: [],
          }
        ],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([3, 61]); // 2 malware + 1 software

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Malware', 'Software'], mode: 'and' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([0, 64]); // nothing is both malware and software

      filterGroup = {
        mode: 'and',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Malware'], mode: 'or' }],
        filterGroups: [
          {
            mode: 'or',
            filters: [{ key: ['entity_type'], operator: 'eq', values: ['Software'], mode: 'or' }],
            filterGroups: [],
          }
        ],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([0, 64]); // nothing is both malware and software

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'not_eq', values: ['Malware', 'Software'], mode: 'and' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([61, 3]); // all but malware and software
    });

    it('using several filter keys that need resolution', async () => {
      MOCK_RESOLUTION_MAP.set('id-for-coa', 'course-of-action--ae56a49d-5281-45c5-ab95-70a1439c338e');
      MOCK_RESOLUTION_MAP.set('id-for-attack-pattern', 'attack-pattern--2fc04aa5-48c1-49ec-919a-b88241ef1d17');

      let filterGroup = {
        mode: 'and',
        filters: [
          { key: ['fromId'], operator: 'eq', values: ['id-for-coa'], mode: 'or' },
          { key: ['toId'], operator: 'eq', values: ['id-for-attack-pattern'], mode: 'or' },
        ],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([1, 63]); // 1 "mitigates" rel

      // same test, reverse order
      filterGroup = {
        mode: 'and',
        filters: [
          { key: ['toId'], operator: 'eq', values: ['id-for-attack-pattern'], mode: 'or' },
          { key: ['fromId'], operator: 'eq', values: ['id-for-coa'], mode: 'or' },
        ],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([1, 63]); // 1 "mitigates" rel
    });

    it('using parent entity types', async () => {
      let filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Basic-Object'], mode: 'or' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([38, 26]); // 38 objects, 26 rel

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Stix-Object'], mode: 'or' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([38, 26]); // all objects are stix-objects

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Internal-Object'], mode: 'or' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([0, 64]); // no internal-objects in bundle

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Stix-Meta-Object'], mode: 'or' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([3, 61]); // 3 Markings

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Stix-Core-Object'], mode: 'or' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([35, 29]); // all but the 3 markings and 26 rel

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Stix-Domain-Object'], mode: 'or' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([34, 30]); // 34 SDO among the 35 core-objects

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Stix-Cyber-Observable'], mode: 'or' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([1, 63]); // only 1 (a software)

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Basic-Relationship'], mode: 'or' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([26, 38]); // 26 rel

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Stix-Relationship'], mode: 'or' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([26, 38]); // all of rels are Stix-rel

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Internal-Relationship'], mode: 'or' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([0, 64]); // no internal-rel in bundle

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Stix-Core-Relationship'], mode: 'or' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([24, 40]); // 24/26 rels are Stix-core-rel

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Stix-Sighting-Relationship'], mode: 'or' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([2, 62]); // 2/24 rels are Stix-sighting-rel

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Stix-Ref-Relationship'], mode: 'or' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([0, 64]); // no ref-rel in bundle
    });

    it('using combination of child and parent entity types', async () => {
      let filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Malware', 'Stix-Domain-Object'], mode: 'or' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([34, 30]); // Malware are SDO, so all 34 SDO

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Malware', 'Stix-Domain-Object'], mode: 'and' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([2, 62]); // Malware AND SDO => only 2 malware

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Report', 'Container'], mode: 'or' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([4, 60]); // 1 report, 1 Note, 1 Opinion, 1 Observed-Data

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Report', 'Container'], mode: 'and' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([1, 63]); // only 1 report which is a Container

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Software', 'Stix-Domain-Object'], mode: 'or' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([35, 29]); // Software is NOT an SDO, so 34 SDO + 1 Software

      filterGroup = {
        mode: 'or',
        filters: [{ key: ['entity_type'], operator: 'eq', values: ['Software', 'Stix-Domain-Object'], mode: 'and' }],
        filterGroups: [],
      } as FilterGroup;
      expect(await testManyStix(stixBundle.objects, makeCallback(filterGroup))).toEqual([0, 64]); // Software is NOT an SDO, so 0 matching both
    });
  });
});
