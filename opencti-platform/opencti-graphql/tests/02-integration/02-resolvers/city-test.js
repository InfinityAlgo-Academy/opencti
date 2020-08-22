import gql from 'graphql-tag';
import { queryAsAdmin } from '../../utils/testQuery';
import { elLoadByStixId } from '../../../src/database/elasticSearch';

const LIST_QUERY = gql`
  query cities(
    $first: Int
    $after: ID
    $orderBy: CitiesOrdering
    $orderMode: OrderingMode
    $filters: [CitiesFiltering]
    $filterMode: FilterMode
    $search: String
  ) {
    cities(
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
          standard_id
          stix_ids
          name
          description
        }
      }
    }
  }
`;

const READ_QUERY = gql`
  query city($id: String!) {
    city(id: $id) {
      id
      standard_id
      name
      description
      toStix
      country {
        id
        standard_id
        stix_ids
        name
      }
    }
  }
`;

describe('City resolver standard behavior', () => {
  let cityInternalId;
  const cityStixId = 'identity--861af688-581e-4571-a0d9-955c9096fb41';
  it('should city created', async () => {
    const CREATE_QUERY = gql`
      mutation CityAdd($input: CityAddInput) {
        cityAdd(input: $input) {
          id
          name
          description
        }
      }
    `;
    // Create the city
    const CITY_TO_CREATE = {
      input: {
        name: 'City',
        stix_id: cityStixId,
        description: 'City description',
      },
    };
    const city = await queryAsAdmin({
      query: CREATE_QUERY,
      variables: CITY_TO_CREATE,
    });
    expect(city).not.toBeNull();
    expect(city.data.cityAdd).not.toBeNull();
    expect(city.data.cityAdd.name).toEqual('City');
    cityInternalId = city.data.cityAdd.id;
  });
  it('should city loaded by internal id', async () => {
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: cityInternalId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.city).not.toBeNull();
    expect(queryResult.data.city.id).toEqual(cityInternalId);
    expect(queryResult.data.city.toStix.length).toBeGreaterThan(5);
  });
  it('should city loaded by stix id', async () => {
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: cityStixId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.city).not.toBeNull();
    expect(queryResult.data.city.id).toEqual(cityInternalId);
  });
  it('should city country to be accurate', async () => {
    const city = await elLoadByStixId('location--c3794ffd-0e71-4670-aa4d-978b4cbdc72c');
    const queryResult = await queryAsAdmin({
      query: READ_QUERY,
      variables: { id: city.internal_id },
    });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.city).not.toBeNull();
    expect(queryResult.data.city.standard_id).toEqual('location--b88c34a6-683e-56b9-92a7-a4ed189fde9a');
    expect(queryResult.data.city.country.standard_id).toEqual('location--57dbce2d-8b33-5671-aada-05850948ed30');
  });
  it('should list cities', async () => {
    const queryResult = await queryAsAdmin({ query: LIST_QUERY, variables: { first: 10 } });
    expect(queryResult.data.cities.edges.length).toEqual(2);
  });
  it('should update city', async () => {
    const UPDATE_QUERY = gql`
      mutation CityEdit($id: ID!, $input: EditInput!) {
        cityEdit(id: $id) {
          fieldPatch(input: $input) {
            id
            name
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: UPDATE_QUERY,
      variables: { id: cityInternalId, input: { key: 'name', value: ['City - test'] } },
    });
    expect(queryResult.data.cityEdit.fieldPatch.name).toEqual('City - test');
  });
  it('should context patch city', async () => {
    const CONTEXT_PATCH_QUERY = gql`
      mutation CityEdit($id: ID!, $input: EditContext) {
        cityEdit(id: $id) {
          contextPatch(input: $input) {
            id
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: CONTEXT_PATCH_QUERY,
      variables: { id: cityInternalId, input: { focusOn: 'description' } },
    });
    expect(queryResult.data.cityEdit.contextPatch.id).toEqual(cityInternalId);
  });
  it('should context clean city', async () => {
    const CONTEXT_PATCH_QUERY = gql`
      mutation CityEdit($id: ID!) {
        cityEdit(id: $id) {
          contextClean {
            id
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: CONTEXT_PATCH_QUERY,
      variables: { id: cityInternalId },
    });
    expect(queryResult.data.cityEdit.contextClean.id).toEqual(cityInternalId);
  });
  it('should add relation in city', async () => {
    const RELATION_ADD_QUERY = gql`
      mutation CityEdit($id: ID!, $input: StixMetaRelationshipAddInput!) {
        cityEdit(id: $id) {
          relationAdd(input: $input) {
            id
            from {
              ... on City {
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
        id: cityInternalId,
        input: {
          toId: 'marking-definition--78ca4366-f5b8-4764-83f7-34ce38198e27',
          relationship_type: 'object-marking',
        },
      },
    });
    expect(queryResult.data.cityEdit.relationAdd.from.objectMarking.edges.length).toEqual(1);
  });
  it('should delete relation in city', async () => {
    const RELATION_DELETE_QUERY = gql`
      mutation CityEdit($id: ID!, $toId: String!, $relationship_type: String!) {
        cityEdit(id: $id) {
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
        id: cityInternalId,
        toId: 'marking-definition--78ca4366-f5b8-4764-83f7-34ce38198e27',
        relationship_type: 'object-marking',
      },
    });
    expect(queryResult.data.cityEdit.relationDelete.objectMarking.edges.length).toEqual(0);
  });
  it('should city deleted', async () => {
    const DELETE_QUERY = gql`
      mutation cityDelete($id: ID!) {
        cityEdit(id: $id) {
          delete
        }
      }
    `;
    // Delete the city
    await queryAsAdmin({
      query: DELETE_QUERY,
      variables: { id: cityInternalId },
    });
    // Verify is no longer found
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: cityStixId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.city).toBeNull();
  });
});
