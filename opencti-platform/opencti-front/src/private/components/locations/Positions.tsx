import React, { FunctionComponent } from 'react';
import { graphql } from 'react-relay';
import { PositionsLines_data$data } from '@components/locations/__generated__/PositionsLines_data.graphql';
import { PositionsLinesPaginationQuery, PositionsLinesPaginationQuery$variables } from '@components/locations/__generated__/PositionsLinesPaginationQuery.graphql';
import PositionCreation from './positions/PositionCreation';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import { useBuildEntityTypeBasedFilterContext, emptyFilterGroup } from '../../../utils/filters/filtersUtils';
import { useFormatter } from '../../../components/i18n';
import Breadcrumbs from '../../../components/Breadcrumbs';
import DataTable from '../../../components/dataGrid/DataTable';
import { UsePreloadedPaginationFragment } from '../../../utils/hooks/usePreloadedPaginationFragment';

const LOCAL_STORAGE_KEY_POSITIONS = 'positions';

const positionLineFragment = graphql`
  fragment PositionsLine_node on Position {
    id
    entity_type
    name
    created
    modified
    objectMarking {
      id
      definition_type
      definition
      x_opencti_order
      x_opencti_color
    }
    objectLabel {
      id
      value
      color
    }
  }
`;

const positionsLinesQuery = graphql`
  query PositionsLinesPaginationQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: PositionsOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
  ) {
    ...PositionsLines_data
    @arguments(
      search: $search
      count: $count
      cursor: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    )
  }
`;

const positionsLinesFragment = graphql`
  fragment PositionsLines_data on Query
  @argumentDefinitions(
    search: { type: "String" }
    count: { type: "Int", defaultValue: 25 }
    cursor: { type: "ID" }
    orderBy: { type: "PositionsOrdering", defaultValue: name }
    orderMode: { type: "OrderingMode", defaultValue: asc }
    filters: { type: "FilterGroup" }
  )
  @refetchable(queryName: "PositionsLinesRefetchQuery") {
    positions(
      search: $search
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    ) @connection(key: "Pagination_positions") {
      edges {
        node {
          id
          name
          description
          ...PositionsLine_node
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

const Positions: FunctionComponent = () => {
  const { t_i18n } = useFormatter();

  const initialValues = {
    searchTerm: '',
    sortBy: 'name',
    orderAsc: true,
    openExports: false,
    filters: emptyFilterGroup,
  };
  const { viewStorage: { filters }, helpers: storageHelpers, paginationOptions } = usePaginationLocalStorage<PositionsLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY_POSITIONS,
    initialValues,
  );

  const contextFilters = useBuildEntityTypeBasedFilterContext('Position', filters);
  const queryPaginationOptions = {
    ...paginationOptions,
    filters: contextFilters,
  } as unknown as PositionsLinesPaginationQuery$variables;

  const dataColumns = {
    name: { flexSize: 70 },
    created: {},
    modified: {},
  };
  const queryRef = useQueryLoading<PositionsLinesPaginationQuery>(
    positionsLinesQuery,
    queryPaginationOptions,
  );

  const preloadedPaginationProps = {
    linesQuery: positionsLinesQuery,
    linesFragment: positionsLinesFragment,
    queryRef,
    nodePath: ['positions', 'pageInfo', 'globalCount'],
    setNumberOfElements: storageHelpers.handleSetNumberOfElements,
  } as UsePreloadedPaginationFragment<PositionsLinesPaginationQuery>;

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t_i18n('Locations') }, { label: t_i18n('Positions'), current: true }]} />
      {queryRef && (
        <DataTable
          dataColumns={dataColumns}
          resolvePath={(data: PositionsLines_data$data) => data.positions?.edges?.map((n) => n?.node)}
          storageKey={LOCAL_STORAGE_KEY_POSITIONS}
          initialValues={initialValues}
          toolbarFilters={contextFilters}
          lineFragment={positionLineFragment}
          preloadedPaginationProps={preloadedPaginationProps}
          filterExportContext={{ entity_type: 'Position' }}
        />
      )}
      <Security needs={[KNOWLEDGE_KNUPDATE]}>
        <PositionCreation paginationOptions={queryPaginationOptions} />
      </Security>
    </>
  );
};

export default Positions;
