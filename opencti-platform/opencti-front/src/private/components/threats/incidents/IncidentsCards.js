import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { pathOr } from 'ramda';
import ListCardsContent from '../../../../components/list_cards/ListCardsContent';
import { IncidentCard, IncidentCardDummy } from './IncidentCard';

const nbOfCardsToLoad = 25;

class IncidentsCards extends Component {
  render() {
    const { initialLoading, relay } = this.props;
    return (
      <ListCardsContent
        initialLoading={initialLoading}
        loadMore={relay.loadMore.bind(this)}
        hasMore={relay.hasMore.bind(this)}
        isLoading={relay.isLoading.bind(this)}
        dataList={pathOr([], ['incidents', 'edges'], this.props.data)}
        globalCount={pathOr(
          nbOfCardsToLoad,
          ['incidents', 'pageInfo', 'globalCount'],
          this.props.data,
        )}
        CardComponent={<IncidentCard />}
        DummyCardComponent={<IncidentCardDummy />}
        nbOfCardsToLoad={nbOfCardsToLoad}
      />
    );
  }
}

IncidentsCards.propTypes = {
  classes: PropTypes.object,
  paginationOptions: PropTypes.object,
  data: PropTypes.object,
  relay: PropTypes.object,
  incidents: PropTypes.object,
  initialLoading: PropTypes.bool,
  searchTerm: PropTypes.string,
};

export const incidentsCardsQuery = graphql`
  query IncidentsCardsPaginationQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: IncidentsOrdering
    $orderMode: OrderingMode
  ) {
    ...IncidentsCards_data
      @arguments(
        search: $search
        count: $count
        cursor: $cursor
        orderBy: $orderBy
        orderMode: $orderMode
      )
  }
`;

export default createPaginationContainer(
  IncidentsCards,
  {
    data: graphql`
      fragment IncidentsCards_data on Query
        @argumentDefinitions(
          search: { type: "String" }
          count: { type: "Int", defaultValue: 25 }
          cursor: { type: "ID" }
          orderBy: { type: "IncidentsOrdering", defaultValue: "name" }
          orderMode: { type: "OrderingMode", defaultValue: "asc" }
        ) {
        incidents(
          search: $search
          first: $count
          after: $cursor
          orderBy: $orderBy
          orderMode: $orderMode
        ) @connection(key: "Pagination_incidents") {
          edges {
            node {
              id
              name
              description
              ...IncidentCard_node
            }
          }
          pageInfo {
            globalCount
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.data && props.data.incidents;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        search: fragmentVariables.search,
        count,
        cursor,
        orderBy: fragmentVariables.orderBy,
        orderMode: fragmentVariables.orderMode,
      };
    },
    query: incidentsCardsQuery,
  },
);
