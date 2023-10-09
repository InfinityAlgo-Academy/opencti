import React from 'react';
import { graphql } from 'react-relay';
import ListLinesContent from '../../../../components/list_lines/ListLinesContent';
import {
  ContainerStixCoreObjectsMappingLine,
  ContainerStixCoreObjectsMappingLineDummy,
} from './ContainerStixCoreObjectsMappingLine';
import usePreloadedPaginationFragment from '../../../../utils/hooks/usePreloadedPaginationFragment';

const nbOfRowsToLoad = 50;

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
        ...ContainerStixCoreObjectsMappingLines_container
        @arguments(
            id: $id
            search: $search
            count: $count
            cursor: $cursor
            orderBy: $orderBy
            orderMode: $orderMode
            filters: $filters
        )
    }
`;

const ContainerStixCoreObjectsMappingLinesFragment = graphql`
    fragment ContainerStixCoreObjectsMappingLines_container on Query
    @argumentDefinitions(
        id: { type: "String!" }
        search: { type: "String" }
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "ID" }
        orderBy: {
            type: "StixObjectOrStixRelationshipsOrdering"
            defaultValue: name
        }
        orderMode: { type: "OrderingMode", defaultValue: asc }
        filters: { type: "[StixObjectOrStixRelationshipsFiltering]" }
    )
    @refetchable(queryName: "ContainerStixCoreObjectsMappingLinesRefetchQuery") {
        container(id: $id) {
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
                            standard_id
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
    }
`;

const ContainerStixCoreObjectsMappingLines = ({
  queryRef,
  paginationOptions,
  dataColumns,
  height,
  contentMapping,
  contentMappingData,
  setNumberOfElements,
}) => {
  const { data, hasMore, loadMore, isLoadingMore } = usePreloadedPaginationFragment({
    linesQuery: containerStixCoreObjectsMappingLinesQuery,
    linesFragment: ContainerStixCoreObjectsMappingLinesFragment,
    queryRef,
    nodePath: ['container', 'objects', 'pageInfo', 'globalCount'],
    setNumberOfElements,
  });

  return (
      <ListLinesContent
        initialLoading={!data}
        hasMore={hasMore}
        loadMore={loadMore}
        isLoading={isLoadingMore}
        dataList={data?.container?.objects?.edges ?? []}
        paginationOptions={paginationOptions}
        globalCount={
          data?.container?.objects?.pageInfo?.globalCount ?? nbOfRowsToLoad
        }
        LineComponent={
          <ContainerStixCoreObjectsMappingLine
            containerId={data?.container?.id ?? null}
          />
        }
        DummyLineComponent={<ContainerStixCoreObjectsMappingLineDummy />}
        dataColumns={dataColumns}
        nbOfRowsToLoad={nbOfRowsToLoad}
        height={height}
        contentMapping={contentMapping}
        contentMappingData={contentMappingData}
      />
  );
};

export default ContainerStixCoreObjectsMappingLines;
