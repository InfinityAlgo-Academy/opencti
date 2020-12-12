import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { pathOr } from 'ramda';
import ListLinesContent from '../../../../components/list_lines/ListLinesContent';
import {
  StixDomainObjectIndicatorLine,
  StixDomainObjectIndicatorLineDummy,
} from './StixDomainObjectIndicatorLine';
import { setNumberOfElements } from '../../../../utils/Number';

const nbOfRowsToLoad = 50;

class StixDomainObjectIndicatorsLines extends Component {
  componentDidUpdate(prevProps) {
    setNumberOfElements(
      prevProps,
      this.props,
      'indicators',
      this.props.setNumberOfElements.bind(this),
    );
  }

  render() {
    const {
      initialLoading,
      dataColumns,
      relay,
      entityLink,
      entityId,
      paginationOptions,
    } = this.props;
    return (
      <ListLinesContent
        initialLoading={initialLoading}
        loadMore={relay.loadMore.bind(this)}
        hasMore={relay.hasMore.bind(this)}
        isLoading={relay.isLoading.bind(this)}
        dataList={pathOr([], ['indicators', 'edges'], this.props.data)}
        globalCount={pathOr(
          nbOfRowsToLoad,
          ['indicators', 'pageInfo', 'globalCount'],
          this.props.data,
        )}
        LineComponent={<StixDomainObjectIndicatorLine />}
        DummyLineComponent={<StixDomainObjectIndicatorLineDummy />}
        dataColumns={dataColumns}
        nbOfRowsToLoad={nbOfRowsToLoad}
        paginationOptions={paginationOptions}
        entityLink={entityLink}
        entityId={entityId}
      />
    );
  }
}

StixDomainObjectIndicatorsLines.propTypes = {
  classes: PropTypes.object,
  paginationOptions: PropTypes.object,
  dataColumns: PropTypes.object.isRequired,
  data: PropTypes.object,
  relay: PropTypes.object,
  stixCoreRelationships: PropTypes.object,
  initialLoading: PropTypes.bool,
  entityLink: PropTypes.string,
  entityId: PropTypes.string,
  setNumberOfElements: PropTypes.func,
};

export const stixDomainObjectIndicatorsLinesQuery = graphql`
  query StixDomainObjectIndicatorsLinesQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: IndicatorsOrdering
    $orderMode: OrderingMode
    $filters: [IndicatorsFiltering]
  ) {
    ...StixDomainObjectIndicatorsLines_data
      @arguments(
        search: $search
        count: $count
        cursor: $cursor
        filters: $filters
        orderBy: $orderBy
        orderMode: $orderMode
      )
  }
`;

export default createPaginationContainer(
  StixDomainObjectIndicatorsLines,
  {
    data: graphql`
      fragment StixDomainObjectIndicatorsLines_data on Query
      @argumentDefinitions(
        search: { type: "String" }
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "ID" }
        filters: { type: "[IndicatorsFiltering]" }
        orderBy: { type: "IndicatorsOrdering", defaultValue: valid_from }
        orderMode: { type: "OrderingMode", defaultValue: desc }
      ) {
        indicators(
          search: $search
          first: $count
          after: $cursor
          orderBy: $orderBy
          orderMode: $orderMode
          filters: $filters
        ) @connection(key: "Pagination_indicators") {
          edges {
            node {
              ...StixDomainObjectIndicatorLine_node
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
        search: fragmentVariables.search,
        count,
        cursor,
        orderBy: fragmentVariables.orderBy,
        orderMode: fragmentVariables.orderMode,
        filters: fragmentVariables.filters,
      };
    },
    query: stixDomainObjectIndicatorsLinesQuery,
  },
);
