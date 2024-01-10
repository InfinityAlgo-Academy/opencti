import React from 'react';
import { graphql } from 'react-relay';
import { SystemsLinesPaginationQuery, SystemsLinesPaginationQuery$variables } from '@components/entities/__generated__/SystemsLinesPaginationQuery.graphql';
import { SystemsLines_data$data } from '@components/entities/__generated__/SystemsLines_data.graphql';
import SystemCreation from './systems/SystemCreation';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import { useBuildEntityTypeBasedFilterContext, emptyFilterGroup } from '../../../utils/filters/filtersUtils';
import { useFormatter } from '../../../components/i18n';
import Breadcrumbs from '../../../components/Breadcrumbs';
import DataTable from '../../../components/dataGrid/DataTable';
import { UsePreloadedPaginationFragment } from '../../../utils/hooks/usePreloadedPaginationFragment';

const LOCAL_STORAGE_KEY = 'systems';

const systemLineFragment = graphql`
  fragment SystemsLine_node on System {
    id
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

const systemsLinesQuery = graphql`
  query SystemsLinesPaginationQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: SystemsOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
  ) {
    ...SystemsLines_data
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

const systemsLinesFragment = graphql`
  fragment SystemsLines_data on Query
  @argumentDefinitions(
    search: { type: "String" }
    count: { type: "Int", defaultValue: 25 }
    cursor: { type: "ID" }
    orderBy: { type: "SystemsOrdering", defaultValue: name }
    orderMode: { type: "OrderingMode", defaultValue: asc }
    filters: { type: "FilterGroup" }
  )
  @refetchable(queryName: "SystemsLinesRefetchQuery") {
    systems(
      search: $search
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    ) @connection(key: "Pagination_systems") {
      edges {
        node {
          id
          name
          description
          ...SystemsLine_node
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

const Systems = () => {
  const { t_i18n } = useFormatter();

  const initialValues = {
    searchTerm: '',
    sortBy: 'name',
    orderAsc: true,
    openExports: false,
    filters: emptyFilterGroup,
  };
  const { viewStorage: { filters }, helpers: storageHelpers, paginationOptions } = usePaginationLocalStorage<SystemsLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    initialValues,
  );

  const contextFilters = useBuildEntityTypeBasedFilterContext('System', filters);
  const queryPaginationOptions = {
    ...paginationOptions,
    filters: contextFilters,
  } as unknown as SystemsLinesPaginationQuery$variables;

  const dataColumns = {
    name: { flexSize: 45 },
    objectLabel: { flexSize: 25 },
    created: {},
    modified: {},
  };
  const queryRef = useQueryLoading<SystemsLinesPaginationQuery>(
    systemsLinesQuery,
    queryPaginationOptions,
  );

  const preloadedPaginationOptions = {
    linesQuery: systemsLinesQuery,
    linesFragment: systemsLinesFragment,
    queryRef,
    nodePath: ['systems', 'pageInfo', 'globalCount'],
    setNumberOfElements: storageHelpers.handleSetNumberOfElements,
  } as UsePreloadedPaginationFragment<SystemsLinesPaginationQuery>;

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t_i18n('Entities') }, { label: t_i18n('Organizations'), current: true }]} />
      {queryRef && (
        <DataTable
          dataColumns={dataColumns}
          resolvePath={(data: SystemsLines_data$data) => data.systems?.edges?.map((n) => n?.node)}
          storageKey={LOCAL_STORAGE_KEY}
          initialValues={initialValues}
          toolbarFilters={contextFilters}
          preloadedPaginationProps={preloadedPaginationOptions}
          lineFragment={systemLineFragment}
          filterExportContext={{ entity_type: 'System' }}
        />
      )}
      <Security needs={[KNOWLEDGE_KNUPDATE]}>
        <SystemCreation paginationOptions={queryPaginationOptions} />
      </Security>
    </>
  );
};

export default Systems;
