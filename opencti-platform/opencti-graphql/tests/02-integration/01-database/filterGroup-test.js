import { describe, expect, it } from 'vitest';
import gql from 'graphql-tag';
import { ADMIN_USER, queryAsAdmin, testContext } from '../../utils/testQuery';
import { addMarkingDefinition } from '../../../src/domain/markingDefinition';
import { distributionRelations } from '../../../src/database/middleware';
import { ENTITY_TYPE_MARKING_DEFINITION } from '../../../src/schema/stixMetaObject';
import { RELATION_OBJECT_MARKING } from '../../../src/schema/stixRefRelationship';
import {
  ABSTRACT_INTERNAL_OBJECT,
  ABSTRACT_STIX_CORE_OBJECT,
  ENTITY_TYPE_CONTAINER,
  ENTITY_TYPE_LOCATION,
  ID_INTERNAL
} from '../../../src/schema/general';
import {
  ENTITY_TYPE_CONTAINER_REPORT,
  ENTITY_TYPE_INTRUSION_SET,
  ENTITY_TYPE_MALWARE
} from '../../../src/schema/stixDomainObject';
import { IDS_FILTER, SOURCE_RELIABILITY_FILTER } from '../../../src/utils/filtering/filtering-constants';
import { storeLoadById } from '../../../src/database/middleware-loader';

// test queries involving dynamic filters

const REPORT_LIST_QUERY = gql`
    query reports(
        $filters: FilterGroup
    ) {
        reports(
            filters: $filters
        ) {
            edges {
                node {
                    id
                    name
                    description
                    published
                    report_types
                    confidence
                    objectMarking {
                        edges {
                            node {
                                id
                                standard_id
                                definition
                            }
                        }
                    }
                }
            }
        }
    }
`;

const LIST_QUERY = gql`
    query globalSearch(
        $filters: FilterGroup
    ) {
        globalSearch(
            filters: $filters
        ) {
            edges {
                node {
                    id
                    entity_type
                }
            }
        }
    }
`;

const READ_REPORT_QUERY = gql`
    query report($id: String!) {
        report(id: $id) {
            id
            standard_id
            name
        }
    }
`;

const READ_MARKING_QUERY = gql`
    query markingDefinition($id: String!) {
        markingDefinition(id: $id) {
            id
            standard_id
        }
    }
`;

describe('Complex filters combinations for elastic queries', () => {
  let report1InternalId;
  let report2InternalId;
  let report3InternalId;
  let report4InternalId;
  const report1StixId = 'report--994491f0-f114-4e41-bcf0-3288c0324f01';
  const report2StixId = 'report--994491f0-f114-4e41-bcf0-3288c0324f02';
  const report3StixId = 'report--994491f0-f114-4e41-bcf0-3288c0324f03';
  const report4StixId = 'report--994491f0-f114-4e41-bcf0-3288c0324f04';
  let marking1StixId;
  let marking1Id;
  let marking2StixId;
  let marking2Id;
  it('should testing environnement created', async () => {
    const CREATE_QUERY = gql`
        mutation ReportAdd($input: ReportAddInput!) {
            reportAdd(input: $input) {
                id
                standard_id
                name
            }
        }
    `;
    // Create a marking
    const marking1Input = {
      definition_type: 'TLP',
      definition: 'TLP:NEW',
      x_opencti_order: 1,
    };
    const marking2Input = {
      definition_type: 'TEST',
      definition: 'TEST:2',
      x_opencti_order: 2,
    };
    const marking1 = await addMarkingDefinition(testContext, ADMIN_USER, marking1Input);
    marking1StixId = marking1.standard_id;
    marking1Id = marking1.id;
    const marking2 = await addMarkingDefinition(testContext, ADMIN_USER, marking2Input);
    marking2StixId = marking2.standard_id;
    marking2Id = marking2.id;
    // Create the reports
    const REPORT1 = {
      input: {
        name: 'Report1',
        stix_id: report1StixId,
        description: 'Report description',
        published: '2023-09-26T00:47:35.000Z',
        objectMarking: [marking1StixId, marking2StixId],
        report_types: ['threat-report'],
        confidence: 10,
      },
    };
    const REPORT2 = {
      input: {
        name: 'Report2',
        stix_id: report2StixId,
        description: 'Report1',
        published: '2023-09-15T00:51:35.000Z',
        objectMarking: [marking2StixId],
        report_types: ['threat-report', 'internal-report'],
        confidence: 20,
      },
    };
    const REPORT3 = {
      input: {
        name: 'Report3',
        stix_id: report3StixId,
        published: '2021-01-10T22:00:00.000Z',
        report_types: ['internal-report'],
        confidence: 30,
      },
    };
    const REPORT4 = {
      input: {
        name: 'Report4',
        stix_id: report4StixId,
        published: '2023-09-15T00:51:35.000Z',
        objectMarking: [marking2StixId],
        confidence: 40,
      },
    };
    const report1 = await queryAsAdmin({
      query: CREATE_QUERY,
      variables: REPORT1,
    });
    const report2 = await queryAsAdmin({
      query: CREATE_QUERY,
      variables: REPORT2,
    });
    const report3 = await queryAsAdmin({
      query: CREATE_QUERY,
      variables: REPORT3,
    });
    const report4 = await queryAsAdmin({
      query: CREATE_QUERY,
      variables: REPORT4,
    });
    expect(report1).not.toBeNull();
    expect(report1.data.reportAdd).not.toBeNull();
    expect(report1.data.reportAdd.name).toEqual('Report1');
    expect(report2).not.toBeNull();
    expect(report2.data.reportAdd).not.toBeNull();
    expect(report2.data.reportAdd.name).toEqual('Report2');
    expect(report3).not.toBeNull();
    expect(report3.data.reportAdd).not.toBeNull();
    expect(report3.data.reportAdd.name).toEqual('Report3');
    expect(report4).not.toBeNull();
    expect(report4.data.reportAdd).not.toBeNull();
    expect(report4.data.reportAdd.name).toEqual('Report4');
    report1InternalId = report1.data.reportAdd.id;
    report2InternalId = report2.data.reportAdd.id;
    report3InternalId = report3.data.reportAdd.id;
    report4InternalId = report4.data.reportAdd.id;
  });
  it('should list entities according to filters', async () => {
    let queryResult;
    // --- 01. No result --- //
    queryResult = await queryAsAdmin({ query: REPORT_LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'and',
          filters: [{
            key: 'report_types',
            operator: 'eq',
            values: ['unexistingType'],
            mode: 'or',
          }],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.reports.edges.length).toEqual(0);
    // --- 02. No filters --- //
    queryResult = await queryAsAdmin({ query: REPORT_LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'and',
          filters: [],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.reports.edges.length).toEqual(5); // the 4 reports created + the report in DATA-TEST-STIX2_v2.json
    queryResult = await queryAsAdmin({ query: REPORT_LIST_QUERY });
    expect(queryResult.data.reports.edges.length).toEqual(5);
    // --- 03. one filter --- //
    queryResult = await queryAsAdmin({ query: REPORT_LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'and',
          filters: [
            {
              key: 'report_types',
              operator: 'eq',
              values: ['threat-report'],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.reports.edges.length).toEqual(3); // the reports created + the report in DATA-TEST-STIX2_v2.json
    // --- 04. filters with different operators --- //
    // (report_types = threat-report) AND (report_types != internal-report)
    queryResult = await queryAsAdmin({ query: REPORT_LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'and',
          filters: [
            {
              key: 'report_types',
              operator: 'eq',
              values: ['threat-report'],
              mode: 'or',
            },
            {
              key: 'report_types',
              operator: 'not_eq',
              values: ['internal-report'],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.reports.edges.length).toEqual(2); // report1 and the report in DATA-TEST-STIX2_v2.json
    expect(queryResult.data.reports.edges.map((n) => n.node.name)).includes('Report1').toBeTruthy();
    expect(queryResult.data.reports.edges.map((n) => n.node.name)).includes('A demo report for testing purposes').toBeTruthy();
    // --- 05. filters with different modes for the main filter group --- //
    // (published after 20/09/2023) OR (published before 30/12/2021)
    queryResult = await queryAsAdmin({ query: REPORT_LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: 'published',
              operator: 'gt',
              values: ['2023-09-20T00:47:35.000Z'],
              mode: 'or',
            },
            {
              key: 'published',
              operator: 'lt',
              values: ['2021-12-30T00:47:35.000Z'],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.reports.edges.length).toEqual(3); // report1 and report3 and report in DATA-TEST-STIX2_v2.json
    expect(queryResult.data.reports.edges.map((n) => n.node.name).includes('Report1')).toBeTruthy();
    expect(queryResult.data.reports.edges.map((n) => n.node.name).includes('Report3')).toBeTruthy();
    expect(queryResult.data.reports.edges.map((n) => n.node.name)).includes('A demo report for testing purposes').toBeTruthy();
    // (published after 20/09/2023) AND (published before 30/12/2021)
    queryResult = await queryAsAdmin({ query: REPORT_LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'and',
          filters: [
            {
              key: 'published',
              operator: 'gt',
              values: ['2023-09-20T00:47:35.000Z'],
              mode: 'or',
            },
            {
              key: 'published',
              operator: 'lt',
              values: ['2021-12-30T00:47:35.000Z'],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.reports.edges.length).toEqual(0);
    // --- 06. filters with different modes between the values of a filter --- //
    // (report_types = internal-report OR threat-report)
    queryResult = await queryAsAdmin({ query: REPORT_LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'and',
          filters: [
            {
              key: 'report_types',
              operator: 'eq',
              values: ['internal-report', 'threat-report'],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.reports.edges.length).toEqual(4); // 3 of the reports created + the report in DATA-TEST-STIX2_v2.json
    // (report_types = internal-report AND threat-report)
    queryResult = await queryAsAdmin({ query: REPORT_LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'and',
          filters: [
            {
              key: 'report_types',
              operator: 'eq',
              values: ['internal-report', 'threat-report'],
              mode: 'and',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.reports.edges.length).toEqual(1);
    expect(queryResult.data.reports.edges[0].node.name).toEqual('Report2');
    // --- 07. filters and filter groups --- //
    // (report_types = threat-report AND published before 30/12/2021)
    queryResult = await queryAsAdmin({ query: REPORT_LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'and',
          filters: [
            {
              key: 'report_types',
              operator: 'eq',
              values: ['threat-report'],
              mode: 'or',
            },
            {
              key: 'published',
              operator: 'lt',
              values: ['2023-09-20T00:47:35.000Z'],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.reports.edges.length).toEqual(2);
    expect(queryResult.data.reports.edges.map((n) => n.node.name)).includes('Report2').toBeTruthy();
    expect(queryResult.data.reports.edges.map((n) => n.node.name)).includes('A demo report for testing purposes').toBeTruthy();
    //  (published before 20/09/2023) AND (report_types = threat-report OR objects malwareXX)
    queryResult = await queryAsAdmin({ query: REPORT_LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'and',
          filters: [
            {
              key: 'published',
              operator: 'lt',
              values: ['2023-09-20T00:47:35.000Z'],
              mode: 'or',
            }
          ],
          filterGroups: [
            {
              mode: 'or',
              filters: [
                {
                  key: 'report_types',
                  operator: 'eq',
                  values: ['threat-report'],
                  mode: 'or',
                },
                {
                  key: 'objects',
                  operator: 'eq',
                  values: ['malware--21c45dbe-54ec-5bb7-b8cd-9f27cc518714'],
                  mode: 'or',
                }
              ],
              filterGroups: [],
            },
          ],
        },
      } });
    expect(queryResult.data.reports.edges.length).toEqual(2);
    expect(queryResult.data.reports.edges.map((n) => n.node.name)).includes('Report2').toBeTruthy();
    expect(queryResult.data.reports.edges.map((n) => n.node.name)).includes('A demo report for testing purposes').toBeTruthy();
    // (marking = marking1 AND marking2) OR (report_types = threat-report AND published before 20/09/2023)
    queryResult = await queryAsAdmin({ query: REPORT_LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: 'objectMarking',
              operator: 'eq',
              values: [marking1Id, marking2Id],
              mode: 'and',
            }
          ],
          filterGroups: [
            {
              mode: 'and',
              filters: [
                {
                  key: 'report_types',
                  operator: 'eq',
                  values: ['threat-report'],
                  mode: 'or',
                },
                {
                  key: 'published',
                  operator: 'lt',
                  values: ['2023-09-20T00:47:35.000Z'],
                  mode: 'or',
                }
              ],
              filterGroups: [],
            },
          ],
        },
      } });
    expect(queryResult.data.reports.edges.length).toEqual(3);
    expect(queryResult.data.reports.edges.map((n) => n.node.name).includes('Report1')).toBeTruthy();
    expect(queryResult.data.reports.edges.map((n) => n.node.name).includes('Report2')).toBeTruthy();
    expect(queryResult.data.reports.edges.map((n) => n.node.name)).includes('A demo report for testing purposes').toBeTruthy();
    // --- 08. complex filter combination with groups and filters imbrication --- //
    // (confidence > 50)
    // OR
    //    [(confidence > 15)
    //    AND
    //        [(report_types != internal-report)
    //        OR
    //            (report_types = (internal-report OR threat-report)
    //            AND
    //            marking = marking2
    //            )
    //        ]
    //    ]
    queryResult = await queryAsAdmin({ query: REPORT_LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: 'confidence',
              operator: 'gt',
              values: ['50'],
              mode: 'or',
            }
          ],
          filterGroups: [
            {
              mode: 'and',
              filters: [
                {
                  key: 'confidence',
                  operator: 'gt',
                  values: ['15'],
                  mode: 'or',
                }
              ],
              filterGroups: [
                {
                  mode: 'or',
                  filters: [
                    {
                      key: 'report_types',
                      operator: 'not_eq',
                      values: ['internal-report'],
                      mode: 'or',
                    }
                  ],
                  filterGroups: [{
                    mode: 'and',
                    filters: [
                      {
                        key: 'report_types',
                        operator: 'eq',
                        values: ['internal-report', 'threat-report'],
                        mode: 'or',
                      },
                      {
                        key: 'objectMarking',
                        operator: 'eq',
                        values: [marking2Id],
                        mode: 'and',
                      }
                    ],
                    filterGroups: [],
                  }],
                }
              ],
            },
          ],
        },
      } });
    expect(queryResult.data.reports.edges.length).toEqual(2);
    expect(queryResult.data.reports.edges.map((n) => n.node.name).includes('Report2')).toBeTruthy();
    expect(queryResult.data.reports.edges.map((n) => n.node.name).includes('Report4')).toBeTruthy();
    // --- 09. complex filter combination with several groups at the same level --- //
    // [(confidence > 25) AND (marking = marking2)]
    // OR
    // [(confidence <= 10) AND (report_types = threat-report OR marking = marking1))]
    queryResult = await queryAsAdmin({ query: REPORT_LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [],
          filterGroups: [
            {
              mode: 'and',
              filters: [
                {
                  key: 'confidence',
                  operator: 'gt',
                  values: ['25'],
                  mode: 'or',
                },
                {
                  key: 'objectMarking',
                  operator: 'eq',
                  values: [marking2Id],
                  mode: 'or',
                }
              ],
              filterGroups: [],
            },
            {
              mode: 'and',
              filters: [
                {
                  key: 'confidence',
                  operator: 'lte',
                  values: ['10'],
                  mode: 'or',
                }
              ],
              filterGroups: [{
                mode: 'or',
                filters: [
                  {
                    key: 'report_types',
                    operator: 'eq',
                    values: ['threat-report'],
                    mode: 'or',
                  },
                  {
                    key: 'objectMarking',
                    operator: 'eq',
                    values: [marking1Id],
                    mode: 'or',
                  }
                ],
                filterGroups: [],
              }],
            }
          ],
        },
      } });
    expect(queryResult.data.reports.edges.length).toEqual(3);
    expect(queryResult.data.reports.edges.map((n) => n.node.name).includes('Report4')).toBeTruthy();
    expect(queryResult.data.reports.edges.map((n) => n.node.name).includes('Report1')).toBeTruthy();
    expect(queryResult.data.reports.edges.map((n) => n.node.name)).includes('A demo report for testing purposes').toBeTruthy();
    // --- 10. filter with 'nil' operator --- //
    // test for 'nil': objectMarking is empty
    queryResult = await queryAsAdmin({ query: REPORT_LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'and',
          filters: [
            {
              key: 'objectMarking',
              operator: 'nil',
              values: [],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.reports.edges.length).toEqual(1);
    expect(queryResult.data.reports.edges[0].node.name).toEqual('Report3');
    // test for 'not_nil': objectMarking is not empty
    queryResult = await queryAsAdmin({ query: REPORT_LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'and',
          filters: [
            {
              key: 'objectMarking',
              operator: 'not_nil',
              values: [],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.reports.edges.length).toEqual(4);
    expect(queryResult.data.reports.edges.map((n) => n.node.name).includes('Report3')).toBeFalsy();
    // --- 11. Aggregation with filters --- //
    // count the number of entities with each marking
    const distributionArgs = {
      field: ID_INTERNAL,
      isTo: true,
      operation: 'count',
      relationship_type: RELATION_OBJECT_MARKING,
      fromTypes: [ENTITY_TYPE_CONTAINER_REPORT],
      toRole: 'object-marking_to',
      toTypes: [ENTITY_TYPE_MARKING_DEFINITION],
    };
    const distribution = await distributionRelations(testContext, ADMIN_USER, distributionArgs);
    // there are 3 markings involved in a relationship with a report: the 2 markings created + the marking of the report in DATA-TEST-STIX2_v2
    expect(distribution.length).toEqual(3);
    const distributionCount = new Map(distribution.map((n) => [n.label, n.value])); // Map<marking internal_id, count>
    expect(distributionCount.get(marking1Id)).toEqual(1); // marking1 is used 1 time (in Report1)
    expect(distributionCount.get(marking2Id)).toEqual(3); // marking2 is used 3 times
    // --- 12. Multi keys --- //
    // (name = Report1) OR (description = Report1)
    queryResult = await queryAsAdmin({ query: REPORT_LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'and',
          filters: [
            {
              key: ['name', 'description'],
              operator: 'eq',
              values: ['Report1'],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.reports.edges.length).toEqual(2);
    expect(queryResult.data.reports.edges.map((n) => n.node.name).includes('Report1')).toBeTruthy();
    expect(queryResult.data.reports.edges.map((n) => n.node.name).includes('Report2')).toBeTruthy();
    // --- 13. combinations of operators and modes with entity_type filter (test the correct injection of parent types) --- //
    // (entity_type = Malware)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: 'entity_type',
              operator: 'eq',
              values: [ENTITY_TYPE_MALWARE],
              mode: 'and',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.globalSearch.edges.length).toEqual(2);
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: 'entity_type',
              operator: 'eq',
              values: [ENTITY_TYPE_MALWARE],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.globalSearch.edges.length).toEqual(2);
    // (entity_type = Report OR container)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: 'entity_type',
              operator: 'eq',
              values: [ENTITY_TYPE_CONTAINER_REPORT, ENTITY_TYPE_CONTAINER],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.globalSearch.edges.length).toEqual(8); // 8 containers: 4 reports in this file + 1 report, 1 note, 1 observed-data, 1 opinion in DATA-TEST-STIXv2_v2
    // (entity_type = Report AND container)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: 'entity_type',
              operator: 'eq',
              values: [ENTITY_TYPE_CONTAINER_REPORT, ENTITY_TYPE_CONTAINER],
              mode: 'and',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.globalSearch.edges.length).toEqual(5); // 5 reports
    // (entity_type = Report AND container AND Stix-Core-Object)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: 'entity_type',
              operator: 'eq',
              values: [ABSTRACT_STIX_CORE_OBJECT, ENTITY_TYPE_CONTAINER_REPORT, ENTITY_TYPE_CONTAINER, ABSTRACT_INTERNAL_OBJECT],
              mode: 'and',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.globalSearch.edges.length).toEqual(5); // 5 reports
    // (entity_type = Malware OR Software)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: 'entity_type',
              operator: 'eq',
              values: [ENTITY_TYPE_MALWARE, 'Software'],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.globalSearch.edges.length).toEqual(3); // 2 malware + 1 software (in DATA-TEST-STIX2_v2.json)
    // (entity_type = Malware) OR (entity_type = Software)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: 'entity_type',
              operator: 'eq',
              values: [ENTITY_TYPE_MALWARE],
              mode: 'or',
            }
          ],
          filterGroups: [
            {
              mode: 'or',
              filters: [
                {
                  key: 'entity_type',
                  operator: 'eq',
                  values: ['Software'],
                  mode: 'or',
                }
              ],
              filterGroups: [],
            }
          ],
        },
      } });
    expect(queryResult.data.globalSearch.edges.length).toEqual(3); // 2 malware + 1 software (in DATA-TEST-STIX2_v2.json)
    // (entity_type = Malware AND Software)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: 'entity_type',
              operator: 'eq',
              values: [ENTITY_TYPE_MALWARE, 'Software'],
              mode: 'and',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.globalSearch.edges.length).toEqual(0);
    // (entity_type = Malware) AND (entity_type = Software)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'and',
          filters: [
            {
              key: 'entity_type',
              operator: 'eq',
              values: [ENTITY_TYPE_MALWARE],
              mode: 'and',
            }
          ],
          filterGroups: [
            {
              mode: 'and',
              filters: [
                {
                  key: 'entity_type',
                  operator: 'eq',
                  values: ['Software'],
                  mode: 'and',
                }
              ],
              filterGroups: [],
            }
          ],
        },
      } });
    expect(queryResult.data.globalSearch.edges.length).toEqual(0);
    // (entity_type != Malware OR != Software)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'and',
          filters: [
            {
              key: 'entity_type',
              operator: 'not_eq',
              values: [ENTITY_TYPE_MALWARE, 'Software'],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    const entitiesNumber = queryResult.data.globalSearch.edges.length; // all the entities
    // (entity_type != Malware AND != Software)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'and',
          filters: [
            {
              key: 'entity_type',
              operator: 'not_eq',
              values: [ENTITY_TYPE_MALWARE, 'Software'],
              mode: 'and',
            }
          ],
          filterGroups: [],
        },
      } });
    const entitiesNumberWithoutMalwaresAndSoftware = queryResult.data.globalSearch.edges.length; // all the entities except Malwares and Softwares
    expect(entitiesNumber - entitiesNumberWithoutMalwaresAndSoftware).toEqual(3); // 2 malwares + 1 software
    // (entity_type != Report AND != Container)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: 'entity_type',
              operator: 'not_eq',
              values: [ENTITY_TYPE_CONTAINER_REPORT, ENTITY_TYPE_CONTAINER],
              mode: 'and',
            }
          ],
          filterGroups: [],
        },
      } });
    const entitiesExceptContainerNumber = queryResult.data.globalSearch.edges.length; // all the entities that are not containers
    // (entity_type != Report OR != Container)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: 'entity_type',
              operator: 'not_eq',
              values: [ENTITY_TYPE_CONTAINER_REPORT, ENTITY_TYPE_CONTAINER],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    const entitiesExceptReportsNumber = queryResult.data.globalSearch.edges.length; // all the entities that are not reports
    expect(entitiesExceptReportsNumber - entitiesExceptContainerNumber).toEqual(3); // number of containers that are not reports: 3 = 1 note, 1 observed-data, 1 opinion
    // --- 14. combinations of operators and modes with the special filter key 'ids' --- //
    // (id(stix/internal/standard) = standard-XX OR standard-YY)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: IDS_FILTER,
              operator: 'eq',
              values: ['course-of-action--ae56a49d-5281-45c5-ab95-70a1439c338e', 'attack-pattern--2fc04aa5-48c1-49ec-919a-b88241ef1d17'],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.globalSearch.edges.length).toEqual(2);
    // (id(stix/internal/standard) = internal-XX OR stix-XX)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: IDS_FILTER,
              operator: 'eq',
              values: [report1InternalId, report1StixId],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.globalSearch.edges.length).toEqual(1);
    // (id(stix/internal/standard) = internal-XX AND stix-XX) -> not supported
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: IDS_FILTER,
              operator: 'eq',
              values: [report1InternalId, report1StixId],
              mode: 'and',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.errors[0].message).toEqual('Unsupported filter: \'And\' operator between values of a filter with key = \'ids\' is not supported');
    // --- 15. combinations of operators and modes with the special filter key 'source_reliability' --- //
    // (source_reliability = A - Completely reliable)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 20,
        filters: {
          mode: 'or',
          filters: [
            {
              key: SOURCE_RELIABILITY_FILTER,
              operator: 'eq',
              values: ['A - Completely reliable'],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.globalSearch.edges.length).toEqual(6);
    // (source_reliability = A - Completely reliable OR B - Usually reliable)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: SOURCE_RELIABILITY_FILTER,
              operator: 'eq',
              values: ['A - Completely reliable', 'B - Usually reliable'],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.globalSearch.edges.length).toEqual(9); // 6 entities with source_reliability A + 3 with source_reliability B
    // (source_reliability = A - Completely reliable AND B - Usually reliable)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: SOURCE_RELIABILITY_FILTER,
              operator: 'eq',
              values: ['A - Completely reliable', 'B - Usually reliable'],
              mode: 'and',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.globalSearch.edges.length).toEqual(0);
    // (source_reliability != A - Completely reliable AND != B - Usually reliable)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: SOURCE_RELIABILITY_FILTER,
              operator: 'not_eq',
              values: ['A - Completely reliable', 'B - Usually reliable'],
              mode: 'and',
            }
          ],
          filterGroups: [],
        },
      } });
    const numberOfEntitiesWithSourceReliabilityNotAAndNotB = queryResult.data.globalSearch.edges.length;
    // (source_reliability != A - Completely reliable OR != B - Usually reliable)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 10,
        filters: {
          mode: 'or',
          filters: [
            {
              key: SOURCE_RELIABILITY_FILTER,
              operator: 'not_eq',
              values: ['A - Completely reliable', 'B - Usually reliable'],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    const numberOfEntitiesWithSourceReliabilityNotAOrNotB = queryResult.data.globalSearch.edges.length;
    expect(numberOfEntitiesWithSourceReliabilityNotAOrNotB - numberOfEntitiesWithSourceReliabilityNotAAndNotB).toEqual(9); // number of entities with source_reliability A or B
    // --- 16. filters with a relationship type key --- //
    const location = await storeLoadById(testContext, ADMIN_USER, 'location--c3794ffd-0e71-4670-aa4d-978b4cbdc72c', ENTITY_TYPE_LOCATION);
    const locationInternalId = location.internal_id;
    const intrusionSet = await storeLoadById(testContext, ADMIN_USER, 'intrusion-set--18854f55-ac7c-4634-bd9a-352dd07613b7', ENTITY_TYPE_INTRUSION_SET);
    const intrusionSetInternalId = intrusionSet.internal_id;
    // (objects = internal-id-of-a-location)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 20,
        filters: {
          mode: 'or',
          filters: [
            {
              key: 'objects',
              operator: 'eq',
              values: [locationInternalId],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.globalSearch.edges.length).toEqual(1); // 1 report contains this location
    // (targets = internal-id-of-a-location)
    queryResult = await queryAsAdmin({ query: LIST_QUERY,
      variables: {
        first: 20,
        filters: {
          mode: 'or',
          filters: [
            {
              key: 'targets',
              operator: 'eq',
              values: [locationInternalId],
              mode: 'or',
            }
          ],
          filterGroups: [],
        },
      } });
    expect(queryResult.data.globalSearch.edges.length).toEqual(1); // 1 intrusion-set targets this location
    expect(queryResult.data.globalSearch.edges[0].node.id).toEqual(intrusionSetInternalId);
  });
  it('should test environnement deleted', async () => {
    const DELETE_REPORT_QUERY = gql`
        mutation reportDelete($id: ID!) {
            reportEdit(id: $id) {
                delete
            }
        }
    `;
    const DELETE_MARKING_QUERY = gql`
        mutation markingDefinitionDelete($id: ID!) {
            markingDefinitionEdit(id: $id) {
                delete
            }
        }
    `;
    // Delete the reports
    await queryAsAdmin({
      query: DELETE_REPORT_QUERY,
      variables: { id: report1InternalId },
    });
    await queryAsAdmin({
      query: DELETE_REPORT_QUERY,
      variables: { id: report2InternalId },
    });
    await queryAsAdmin({
      query: DELETE_REPORT_QUERY,
      variables: { id: report3InternalId },
    });
    await queryAsAdmin({
      query: DELETE_REPORT_QUERY,
      variables: { id: report4InternalId },
    });
    await queryAsAdmin({
      query: DELETE_MARKING_QUERY,
      variables: { id: marking1Id },
    });
    await queryAsAdmin({
      query: DELETE_MARKING_QUERY,
      variables: { id: marking2Id },
    });
    // Verify is no longer found
    let queryResult;
    queryResult = await queryAsAdmin({ query: READ_REPORT_QUERY, variables: { id: report1StixId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.report).toBeNull();
    queryResult = await queryAsAdmin({ query: READ_REPORT_QUERY, variables: { id: report2StixId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.report).toBeNull();
    queryResult = await queryAsAdmin({ query: READ_REPORT_QUERY, variables: { id: report3StixId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.report).toBeNull();
    queryResult = await queryAsAdmin({ query: READ_REPORT_QUERY, variables: { id: report4StixId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.report).toBeNull();
    queryResult = await queryAsAdmin({ query: READ_MARKING_QUERY, variables: { id: marking1StixId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.markingDefinition).toBeNull();
    queryResult = await queryAsAdmin({ query: READ_MARKING_QUERY, variables: { id: marking2StixId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.markingDefinition).toBeNull();
  });
});
