import { graphql } from 'react-relay';

// eslint-disable-next-line import/prefer-default-export
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
