import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import { compose, pathOr } from 'ramda';
import ListLinesContent from '../../../../components/list_lines/ListLinesContent';
import {
  SimpleStixObjectOrStixRelationshipStixCoreRelationshipLine,
  SimpleStixObjectOrStixRelationshipStixCoreRelationshipLineDummy,
} from './SimpleStixObjectOrStixRelationshipStixCoreRelationshipLine';

const nbOfRowsToLoad = 50;

const styles = (theme) => ({
  paper: {
    minHeight: 280,
    height: '100%',
    margin: '10px 0 0 0',
    borderRadius: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    backgroundColor: theme.palette.primary.main,
  },
  avatarDisabled: {
    width: 24,
    height: 24,
  },
  placeholder: {
    display: 'inline-block',
    height: '1em',
    backgroundColor: theme.palette.grey[700],
  },
});

class SimpleStixObjectOrStixRelationshipStixCoreRelationshipsLinesContainer extends Component {
  render() {
    const {
      initialLoading,
      dataColumns,
      relay,
      stixObjectOrStixRelationshipId,
      stixObjectOrStixRelationshipLink,
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
          ['stixCoreRelationshipsOfElement', 'edges'],
          this.props.data,
        )}
        globalCount={pathOr(
          nbOfRowsToLoad,
          ['stixCoreRelationshipsOfElement', 'pageInfo', 'globalCount'],
          this.props.data,
        )}
        LineComponent={
          <SimpleStixObjectOrStixRelationshipStixCoreRelationshipLine />
        }
        DummyLineComponent={
          <SimpleStixObjectOrStixRelationshipStixCoreRelationshipLineDummy />
        }
        dataColumns={dataColumns}
        nbOfRowsToLoad={nbOfRowsToLoad}
        paginationOptions={paginationOptions}
        entityId={stixObjectOrStixRelationshipId}
        entityLink={stixObjectOrStixRelationshipLink}
        connectionKey="Pagination_stixCoreRelationshipsOfElement"
      />
    );
  }
}

SimpleStixObjectOrStixRelationshipStixCoreRelationshipsLinesContainer.propTypes = {
  stixObjectOrStixRelationshipId: PropTypes.string,
  stixObjectOrStixRelationshipLink: PropTypes.string,
  paginationOptions: PropTypes.object,
  data: PropTypes.object,
  limit: PropTypes.number,
  classes: PropTypes.object,
  t: PropTypes.func,
  fld: PropTypes.func,
};

export const simpleStixObjectOrStixRelationshipStixCoreRelationshipsLinesQuery = graphql`
  query SimpleStixObjectOrStixRelationshipStixCoreRelationshipsLinesPaginationQuery(
    $elementId: String!
    $relationship_type: String
    $startTimeStart: DateTime
    $startTimeStop: DateTime
    $stopTimeStart: DateTime
    $stopTimeStop: DateTime
    $confidences: [Int]
    $orderBy: StixCoreRelationshipsOrdering
    $orderMode: OrderingMode
    $count: Int!
    $cursor: ID
  ) {
    ...SimpleStixObjectOrStixRelationshipStixCoreRelationshipsLines_data
      @arguments(
        elementId: $elementId
        relationship_type: $relationship_type
        startTimeStart: $startTimeStart
        startTimeStop: $startTimeStop
        stopTimeStart: $stopTimeStart
        stopTimeStop: $stopTimeStop
        confidences: $confidences
        orderBy: $orderBy
        orderMode: $orderMode
        count: $count
        cursor: $cursor
      )
  }
`;

const SimpleStixObjectOrStixRelationshipStixCoreRelationshipsLines = createPaginationContainer(
  SimpleStixObjectOrStixRelationshipStixCoreRelationshipsLinesContainer,
  {
    data: graphql`
      fragment SimpleStixObjectOrStixRelationshipStixCoreRelationshipsLines_data on Query
      @argumentDefinitions(
        elementId: { type: "String!" }
        relationship_type: { type: "String" }
        startTimeStart: { type: "DateTime" }
        startTimeStop: { type: "DateTime" }
        stopTimeStart: { type: "DateTime" }
        stopTimeStop: { type: "DateTime" }
        confidences: { type: "[Int]" }
        orderBy: {
          type: "StixCoreRelationshipsOrdering"
          defaultValue: created_at
        }
        orderMode: { type: "OrderingMode", defaultValue: desc }
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "ID" }
      ) {
        stixCoreRelationshipsOfElement(
          elementId: $elementId
          relationship_type: $relationship_type
          startTimeStart: $startTimeStart
          startTimeStop: $startTimeStop
          stopTimeStart: $stopTimeStart
          stopTimeStop: $stopTimeStop
          confidences: $confidences
          orderBy: $orderBy
          orderMode: $orderMode
          first: $count
          after: $cursor
        ) @connection(key: "Pagination_stixCoreRelationshipsOfElement") {
          edges {
            node {
              ...SimpleStixObjectOrStixRelationshipStixCoreRelationshipLine_node
            }
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
        elementId: fragmentVariables.elementId,
        relationship_type: fragmentVariables.relationship_type,
        startTimeStart: fragmentVariables.startTimeStart,
        startTimeStop: fragmentVariables.startTimeStop,
        stopTimeStart: fragmentVariables.stopTimeStart,
        stopTimeStop: fragmentVariables.stopTimeStop,
        confidences: fragmentVariables.confidences,
        orderBy: fragmentVariables.orderBy,
        orderMode: fragmentVariables.orderMode,
        count,
        cursor,
      };
    },
    query: simpleStixObjectOrStixRelationshipStixCoreRelationshipsLinesQuery,
  },
);

export default compose(withStyles(styles))(
  SimpleStixObjectOrStixRelationshipStixCoreRelationshipsLines,
);
