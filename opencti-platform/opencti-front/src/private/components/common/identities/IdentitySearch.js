import { graphql } from 'react-relay';

export const identitySearchIdentitiesSearchQuery = graphql`
  query IdentitySearchIdentitiesSearchQuery(
    $types: [String]
    $search: String
    $first: Int
  ) {
    identities(types: $types, search: $search, first: $first) {
      edges {
        node {
          id
          standard_id
          identity_class
          name
          entity_type
        }
      }
    }
  }
`;

export const identitySearchCreatorsSearchQuery = graphql`
  query IdentitySearchCreatorsSearchQuery($search: String, $first: Int) {
    creators(search: $search, first: $first) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;
