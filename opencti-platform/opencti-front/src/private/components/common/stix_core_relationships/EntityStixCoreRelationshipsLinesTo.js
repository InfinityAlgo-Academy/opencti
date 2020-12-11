import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { pathOr } from 'ramda';
import ListLinesContent from '../../../../components/list_lines/ListLinesContent';
import {
  EntityStixCoreRelationshipLineTo,
  EntityStixCoreRelationshipLineToDummy,
} from './EntityStixCoreRelationshipLineTo';

const nbOfRowsToLoad = 50;

class EntityStixCoreRelationshipsLinesToTo extends Component {
  render() {
    const {
      initialLoading,
      dataColumns,
      relay,
      entityLink,
      paginationOptions,
    } = this.props;
    return (
      <ListLinesContent
        initialLoading={initialLoading}
        loadMore={relay.loadMore.bind(this)}
        hasMore={relay.hasMore.bind(this)}
        isLoading={relay.isLoading.bind(this)}
        dataList={pathOr(
          [],
          ['stixCoreRelationships', 'edges'],
          this.props.data,
        )}
        globalCount={pathOr(
          nbOfRowsToLoad,
          ['stixCoreRelationships', 'pageInfo', 'globalCount'],
          this.props.data,
        )}
        LineComponent={<EntityStixCoreRelationshipLineTo />}
        DummyLineComponent={<EntityStixCoreRelationshipLineToDummy />}
        dataColumns={dataColumns}
        nbOfRowsToLoad={nbOfRowsToLoad}
        paginationOptions={paginationOptions}
        entityLink={entityLink}
      />
    );
  }
}

EntityStixCoreRelationshipsLinesToTo.propTypes = {
  classes: PropTypes.object,
  paginationOptions: PropTypes.object,
  dataColumns: PropTypes.object.isRequired,
  data: PropTypes.object,
  relay: PropTypes.object,
  stixCoreRelationships: PropTypes.object,
  initialLoading: PropTypes.bool,
  entityLink: PropTypes.string,
};

export const entityStixCoreRelationshipsLinesToQuery = graphql`
  query EntityStixCoreRelationshipsLinesToPaginationQuery(
    $fromTypes: [String]
    $toId: String
    $toRole: String
    $relationship_type: String
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: StixCoreRelationshipsOrdering
    $orderMode: OrderingMode
  ) {
    ...EntityStixCoreRelationshipsLinesTo_data
      @arguments(
        fromTypes: $fromTypes
        toId: $toId
        toRole: $toRole
        relationship_type: $relationship_type
        search: $search
        count: $count
        cursor: $cursor
        orderBy: $orderBy
        orderMode: $orderMode
      )
  }
`;

export default createPaginationContainer(
  EntityStixCoreRelationshipsLinesToTo,
  {
    data: graphql`
      fragment EntityStixCoreRelationshipsLinesTo_data on Query
      @argumentDefinitions(
        fromTypes: { type: "[String]" }
        toId: { type: "String" }
        toRole: { type: "String" }
        relationship_type: { type: "String" }
        search: { type: "String" }
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "ID" }
        orderBy: {
          type: "StixCoreRelationshipsOrdering"
          defaultValue: start_time
        }
        orderMode: { type: "OrderingMode", defaultValue: asc }
      ) {
        stixCoreRelationships(
          fromTypes: $fromTypes
          toId: $toId
          toRole: $toRole
          relationship_type: $relationship_type
          search: $search
          first: $count
          after: $cursor
          orderBy: $orderBy
          orderMode: $orderMode
        ) @connection(key: "Pagination_stixCoreRelationships") {
          edges {
            node {
              ...EntityStixCoreRelationshipLineTo_node
            }
          }
          pageInfo {
            endCursor
            hasNextPage
            globalCount
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.data && props.data.stixCoreRelationships;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        fromTypes: fragmentVariables.fromTypes,
        toId: fragmentVariables.toId,
        toRole: fragmentVariables.toRole,
        relationship_type: fragmentVariables.relationship_type,
        search: fragmentVariables.search,
        count,
        cursor,
        orderBy: fragmentVariables.orderBy,
        orderMode: fragmentVariables.orderMode,
      };
    },
    query: entityStixCoreRelationshipsLinesToQuery,
  },
);
