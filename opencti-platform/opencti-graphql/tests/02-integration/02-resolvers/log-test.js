import gql from 'graphql-tag';
import { queryAsAdmin } from '../../utils/testQuery';

const LIST_QUERY = gql`
  query logs(
    $first: Int
    $after: ID
    $orderBy: LogsOrdering
    $orderMode: OrderingMode
    $filters: [LogsFiltering]
    $filterMode: FilterMode
    $search: String
  ) {
    logs(
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
          event_type
          event_date
          event_user
          event_message
          event_data
        }
      }
    }
  }
`;

describe('Note resolver standard behavior', () => {
  it('should list notes', async () => {
    const queryResult = await queryAsAdmin({
      query: LIST_QUERY,
      variables: {
        first: 100,
        filters: [{ key: 'event_data_x_opencti_id', values: ['78ef0cb8-4397-4603-86b4-f1d60be7400d'] }],
      },
    });
    expect(queryResult.data.logs.edges.length).toEqual(1);
  });
});
