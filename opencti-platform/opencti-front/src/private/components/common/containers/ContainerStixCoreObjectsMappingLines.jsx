import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer, graphql } from 'react-relay';
import Alert from '@mui/material/Alert';
import * as R from 'ramda';
import ListLinesContent from '../../../../components/list_lines/ListLinesContent';
import {
  ContainerStixCoreObjectsMappingLine,
  ContainerStixCoreObjectsMappingLineDummy,
} from './ContainerStixCoreObjectsMappingLine';
import { setNumberOfElements } from '../../../../utils/Number';
import inject18n from '../../../../components/i18n';

const nbOfRowsToLoad = 50;

class ContainerStixCoreObjectsMappingLinesComponent extends Component {
  componentDidUpdate(prevProps) {
    setNumberOfElements(
      prevProps,
      this.props,
      'objects',
      this.props.setNumberOfElements.bind(this),
      'container',
    );
  }

  render() {
    const {
      initialLoading,
      dataColumns,
      relay,
      container,
      paginationOptions,
      height,
      t,
    } = this.props;
    return (
      <>
        {(container?.objects?.pageInfo?.globalCount ?? 0) === 0 ? (
          <Alert severity="info" variant="outlined" style={{ marginTop: 20 }}>
            {t('No object in the container, select some text to start')}
          </Alert>
        ) : (
          <ListLinesContent
            initialLoading={initialLoading}
            loadMore={relay.loadMore.bind(this)}
            hasMore={relay.hasMore.bind(this)}
            isLoading={relay.isLoading.bind(this)}
            dataList={container?.objects?.edges ?? []}
            paginationOptions={paginationOptions}
            globalCount={
              container?.objects?.pageInfo?.globalCount ?? nbOfRowsToLoad
            }
            LineComponent={
              <ContainerStixCoreObjectsMappingLine
                containerId={container?.id ?? null}
              />
            }
            DummyLineComponent={<ContainerStixCoreObjectsMappingLineDummy />}
            dataColumns={dataColumns}
            nbOfRowsToLoad={nbOfRowsToLoad}
            height={height}
          />
        )}
      </>
    );
  }
}

export const containerStixCoreObjectsMappingLinesQuery = graphql`
  query ContainerStixCoreObjectsMappingLinesQuery(
    $id: String!
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: StixObjectOrStixRelationshipsOrdering
    $orderMode: OrderingMode
    $filters: [StixObjectOrStixRelationshipsFiltering]
  ) {
    container(id: $id) {
      id
      ...ContainerStixCoreObjectsMappingLines_container
        @arguments(
          search: $search
          count: $count
          cursor: $cursor
          orderBy: $orderBy
          orderMode: $orderMode
          filters: $filters
        )
    }
  }
`;

const ContainerStixCoreObjectsMappingLines = createPaginationContainer(
  ContainerStixCoreObjectsMappingLinesComponent,
  {
    container: graphql`
      fragment ContainerStixCoreObjectsMappingLines_container on Container
      @argumentDefinitions(
        search: { type: "String" }
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "ID" }
        orderBy: {
          type: "StixObjectOrStixRelationshipsOrdering"
          defaultValue: name
        }
        orderMode: { type: "OrderingMode", defaultValue: asc }
        filters: { type: "[StixObjectOrStixRelationshipsFiltering]" }
      ) {
        id
        objects(
          search: $search
          first: $count
          after: $cursor
          orderBy: $orderBy
          orderMode: $orderMode
          filters: $filters
        ) @connection(key: "Pagination_objects") {
          edges {
            types
            node {
              ... on BasicObject {
                id
              }
              ...ContainerStixCoreObjectsMappingLine_node
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
      return props.container && props.container.objects;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        id: fragmentVariables.id,
        count,
        cursor,
        search: fragmentVariables.search,
        types: fragmentVariables.types,
        orderBy: fragmentVariables.orderBy,
        orderMode: fragmentVariables.orderMode,
        filters: fragmentVariables.filters,
      };
    },
    query: containerStixCoreObjectsMappingLinesQuery,
  },
);

ContainerStixCoreObjectsMappingLines.propTypes = {
  classes: PropTypes.object,
  paginationOptions: PropTypes.object,
  dataColumns: PropTypes.object.isRequired,
  container: PropTypes.object,
  relay: PropTypes.object,
  initialLoading: PropTypes.bool,
  searchTerm: PropTypes.string,
  setNumberOfElements: PropTypes.func,
  onTypesChange: PropTypes.func,
  openExports: PropTypes.bool,
  onToggleEntity: PropTypes.func,
  addedElements: PropTypes.object,
  height: PropTypes.number,
};

export default R.compose(inject18n)(ContainerStixCoreObjectsMappingLines);
