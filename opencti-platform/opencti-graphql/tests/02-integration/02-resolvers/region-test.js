import gql from 'graphql-tag';
import { queryAsAdmin } from '../../utils/testQuery';
import { elLoadByIds } from '../../../src/database/elasticSearch';

const LIST_QUERY = gql`
  query regions(
    $first: Int
    $after: ID
    $orderBy: RegionsOrdering
    $orderMode: OrderingMode
    $filters: [RegionsFiltering]
    $filterMode: FilterMode
    $search: String
  ) {
    regions(
      first: $first
      after: $after
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
      filterMode: $filterMode
      search: $search
    ) {
      edges {
        node {
          id
          name
          description
        }
      }
    }
  }
`;

const READ_QUERY = gql`
  query region($id: String!) {
    region(id: $id) {
      id
      standard_id
      name
      description
      subRegions {
        edges {
          node {
            id
            standard_id
          }
        }
      }
      parentRegions {
        edges {
          node {
            id
            standard_id
          }
        }
      }
      isSubRegion
      toStix
    }
  }
`;

describe('Region resolver standard behavior', () => {
  let regionInternalId;
  const regionStixId = 'identity--e0afe8b4-8615-46cb-abe1-cf7e08c1f0ca';
  it('should region created', async () => {
    const CREATE_QUERY = gql`
      mutation RegionAdd($input: RegionAddInput) {
        regionAdd(input: $input) {
          id
          name
          description
        }
      }
    `;
    // Create the region
    const REGION_TO_CREATE = {
      input: {
        name: 'Region',
        stix_id: regionStixId,
        description: 'Region description',
      },
    };
    const region = await queryAsAdmin({
      query: CREATE_QUERY,
      variables: REGION_TO_CREATE,
    });
    expect(region).not.toBeNull();
    expect(region.data.regionAdd).not.toBeNull();
    expect(region.data.regionAdd.name).toEqual('Region');
    regionInternalId = region.data.regionAdd.id;
  });
  it('should region loaded by internal id', async () => {
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: regionInternalId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.region).not.toBeNull();
    expect(queryResult.data.region.id).toEqual(regionInternalId);
    expect(queryResult.data.region.toStix.length).toBeGreaterThan(5);
  });
  it('should region loaded by stix id', async () => {
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: regionStixId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.region).not.toBeNull();
    expect(queryResult.data.region.id).toEqual(regionInternalId);
  });
  it('should region subregions be accurate', async () => {
    const region = await elLoadByIds('location--bc9f5d2c-7209-4b24-903e-587c7cf00ab1');
    const queryResult = await queryAsAdmin({
      query: READ_QUERY,
      variables: { id: region.internal_id },
    });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.region).not.toBeNull();
    expect(queryResult.data.region.standard_id).toEqual('location--18b66e49-2a27-5a87-a91c-4e45f789fdde');
    expect(queryResult.data.region.isSubRegion).toBeFalsy();
    expect(queryResult.data.region.subRegions.edges.length).toEqual(1);
    expect(queryResult.data.region.subRegions.edges[0].node.standard_id).toEqual(
      'location--5f92df88-37cd-5060-9aa8-bc58053a572b'
    );
  });
  it('should region parent regions be accurate', async () => {
    const region = await elLoadByIds('location--6bf1f67a-6a55-4e4d-b237-6cdda97baef2');
    const queryResult = await queryAsAdmin({
      query: READ_QUERY,
      variables: { id: region.internal_id },
    });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.region).not.toBeNull();
    expect(queryResult.data.region.standard_id).toEqual('location--5f92df88-37cd-5060-9aa8-bc58053a572b');
    expect(queryResult.data.region.isSubRegion).toBeTruthy();
    expect(queryResult.data.region.parentRegions.edges.length).toEqual(1);
    expect(queryResult.data.region.parentRegions.edges[0].node.standard_id).toEqual(
      'location--18b66e49-2a27-5a87-a91c-4e45f789fdde'
    );
  });
  it('should list regions', async () => {
    const queryResult = await queryAsAdmin({ query: LIST_QUERY, variables: { first: 10 } });
    expect(queryResult.data.regions.edges.length).toEqual(3);
  });
  it('should update region', async () => {
    const UPDATE_QUERY = gql`
      mutation RegionEdit($id: ID!, $input: EditInput!) {
        regionEdit(id: $id) {
          fieldPatch(input: $input) {
            id
            name
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: UPDATE_QUERY,
      variables: { id: regionInternalId, input: { key: 'name', value: ['Region - test'] } },
    });
    expect(queryResult.data.regionEdit.fieldPatch.name).toEqual('Region - test');
  });
  it('should context patch region', async () => {
    const CONTEXT_PATCH_QUERY = gql`
      mutation RegionEdit($id: ID!, $input: EditContext) {
        regionEdit(id: $id) {
          contextPatch(input: $input) {
            id
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: CONTEXT_PATCH_QUERY,
      variables: { id: regionInternalId, input: { focusOn: 'description' } },
    });
    expect(queryResult.data.regionEdit.contextPatch.id).toEqual(regionInternalId);
  });
  it('should context clean region', async () => {
    const CONTEXT_PATCH_QUERY = gql`
      mutation RegionEdit($id: ID!) {
        regionEdit(id: $id) {
          contextClean {
            id
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: CONTEXT_PATCH_QUERY,
      variables: { id: regionInternalId },
    });
    expect(queryResult.data.regionEdit.contextClean.id).toEqual(regionInternalId);
  });
  it('should add relation in region', async () => {
    const RELATION_ADD_QUERY = gql`
      mutation RegionEdit($id: ID!, $input: StixMetaRelationshipAddInput!) {
        regionEdit(id: $id) {
          relationAdd(input: $input) {
            id
            from {
              ... on Region {
                objectMarking {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: RELATION_ADD_QUERY,
      variables: {
        id: regionInternalId,
        input: {
          toId: 'marking-definition--78ca4366-f5b8-4764-83f7-34ce38198e27',
          relationship_type: 'object-marking',
        },
      },
    });
    expect(queryResult.data.regionEdit.relationAdd.from.objectMarking.edges.length).toEqual(1);
  });
  it('should delete relation in region', async () => {
    const RELATION_DELETE_QUERY = gql`
      mutation RegionEdit($id: ID!, $toId: String!, $relationship_type: String!) {
        regionEdit(id: $id) {
          relationDelete(toId: $toId, relationship_type: $relationship_type) {
            id
            objectMarking {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: RELATION_DELETE_QUERY,
      variables: {
        id: regionInternalId,
        toId: 'marking-definition--78ca4366-f5b8-4764-83f7-34ce38198e27',
        relationship_type: 'object-marking',
      },
    });
    expect(queryResult.data.regionEdit.relationDelete.objectMarking.edges.length).toEqual(0);
  });
  it('should region deleted', async () => {
    const DELETE_QUERY = gql`
      mutation regionDelete($id: ID!) {
        regionEdit(id: $id) {
          delete
        }
      }
    `;
    // Delete the region
    await queryAsAdmin({
      query: DELETE_QUERY,
      variables: { id: regionInternalId },
    });
    // Verify is no longer found
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: regionStixId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.region).toBeNull();
  });
});
