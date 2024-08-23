import React, { FunctionComponent } from 'react';
import AttackPatternsMatrixLine, { AttackPatternsMatrixLineDummy } from '@components/techniques/attack_patterns/AttackPatternsMatrixLine';
import { graphql, PreloadedQuery } from 'react-relay';
import {
  AttackPatternsMatrixLinesPaginationQuery,
  AttackPatternsMatrixLinesPaginationQuery$variables,
} from '@components/techniques/attack_patterns/__generated__/AttackPatternsMatrixLinesPaginationQuery.graphql';
import { AttackPatternsMatrixLines_data$key } from '@components/techniques/attack_patterns/__generated__/AttackPatternsMatrixLines_data.graphql';
import { AttackPatternsMatrixLine_node$data } from '@components/techniques/attack_patterns/__generated__/AttackPatternsMatrixLine_node.graphql';
import { DataColumns } from '../../../../components/list_lines';
import { HandleAddFilter, UseLocalStorageHelpers } from '../../../../utils/hooks/useLocalStorage';
import usePreloadedPaginationFragment from '../../../../utils/hooks/usePreloadedPaginationFragment';
import ListLinesContent from '../../../../components/list_lines/ListLinesContent';

const nbOfRowsToLoad = 50;

interface AttackPatternsMatrixLinesProps {
  queryRef: PreloadedQuery<AttackPatternsMatrixLinesPaginationQuery>;
  dataColumns: DataColumns;
  paginationOptions: AttackPatternsMatrixLinesPaginationQuery$variables;
  setNumberOfElements: UseLocalStorageHelpers['handleSetNumberOfElements'];
  selectedElements: Record<string, AttackPatternsMatrixLine_node$data>;
  deSelectedElements: Record<string, AttackPatternsMatrixLine_node$data>;
  onToggleEntity: (
    entity: AttackPatternsMatrixLine_node$data,
    event: React.SyntheticEvent
  ) => void;
  selectAll: boolean;
  onLabelClick: HandleAddFilter;
  redirectionMode?: string;
}

export const attackPatternsMatrixLinesQuery = graphql`
  query AttackPatternsMatrixLinesPaginationQuery(
    $search: String
    $orderBy: AttackPatternsOrdering
    $orderMode: OrderingMode
    $count: Int!
    $cursor: ID
    $filters: FilterGroup
  ) {
    ...AttackPatternsMatrixLines_data
    @arguments(
      search: $search
      orderBy: $orderBy
      orderMode: $orderMode
      count: $count
      cursor: $cursor
      filters: $filters
    )
  }
`;

const attackPatternsMatrixLinesFragment = graphql`
  fragment AttackPatternsMatrixLines_data on Query
  @argumentDefinitions(
    search: { type: "String" }
    orderBy: { type: "AttackPatternsOrdering", defaultValue: x_mitre_id }
    orderMode: { type: "OrderingMode", defaultValue: asc }
    count: { type: "Int", defaultValue: 25 }
    cursor: { type: "ID" }
    filters: { type: "FilterGroup" }
  )
  @refetchable(queryName: "AttackPatternsMatrixLinesRefetchQuery") {
    attackPatterns(
      search: $search
      orderBy: $orderBy
      orderMode: $orderMode
      first: $count
      after: $cursor
      filters: $filters
    ) @connection(key: "Pagination_attackPatterns") {
      edges {
        node {
          ...AttackPatternsMatrixLine_node
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        globalCount
      }
    }
  }
`;

const AttackPatternsMatrixLines: FunctionComponent<AttackPatternsMatrixLinesProps> = ({
  queryRef,
  setNumberOfElements,
  dataColumns,
  onToggleEntity,
  selectedElements,
  deSelectedElements,
  selectAll,
  paginationOptions,
  onLabelClick,
}) => {
  const { data, hasMore, loadMore, isLoadingMore } = usePreloadedPaginationFragment<
  AttackPatternsMatrixLinesPaginationQuery,
  AttackPatternsMatrixLines_data$key
  >({
    linesQuery: attackPatternsMatrixLinesQuery,
    linesFragment: attackPatternsMatrixLinesFragment,
    queryRef,
    nodePath: ['attackPatterns', 'pageInfo', 'globalCount'],
    setNumberOfElements,
  });

  return (
    <ListLinesContent
      hasMore={hasMore}
      initialLoading={!data}
      isLoading={isLoadingMore}
      loadMore={loadMore}
      dataList={data?.attackPatterns?.edges ?? []}
      globalCount={data?.attackPatterns?.pageInfo?.globalCount ?? nbOfRowsToLoad}
      LineComponent={AttackPatternsMatrixLine}
      DummyLineComponent={AttackPatternsMatrixLineDummy}
      dataColumns={dataColumns}
      paginationOptions={paginationOptions}
      nbOfRowsToLoad={nbOfRowsToLoad}
      selectedElements={selectedElements}
      deSelectedElements={deSelectedElements}
      selectAll={selectAll}
      onToggleEntity={onToggleEntity}
      onLabelClick={onLabelClick}
    />
  );
};

export default AttackPatternsMatrixLines;
