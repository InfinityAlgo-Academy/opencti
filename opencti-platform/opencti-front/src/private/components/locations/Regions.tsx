import React, { FunctionComponent } from 'react';
import { graphql } from 'react-relay';
import { RegionsLinesPaginationQuery, RegionsLinesPaginationQuery$variables } from '@components/locations/__generated__/RegionsLinesPaginationQuery.graphql';
import { RegionsLines_data$data } from '@components/locations/__generated__/RegionsLines_data.graphql';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import RegionCreation from './regions/RegionCreation';
import { useBuildEntityTypeBasedFilterContext, emptyFilterGroup } from '../../../utils/filters/filtersUtils';
import { useFormatter } from '../../../components/i18n';
import Breadcrumbs from '../../../components/Breadcrumbs';
import DataTable from '../../../components/dataGrid/DataTable';
import { UsePreloadedPaginationFragment } from '../../../utils/hooks/usePreloadedPaginationFragment';

const LOCAL_STORAGE_KEY = 'regions';

const regionLineFragment = graphql`
  fragment RegionsLine_node on Region {
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

const regionsLinesQuery = graphql`
  query RegionsLinesPaginationQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: RegionsOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
  ) {
    ...RegionsLines_data
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

const regionsLinesFragment = graphql`
  fragment RegionsLines_data on Query
  @argumentDefinitions(
    search: { type: "String" }
    count: { type: "Int", defaultValue: 25 }
    cursor: { type: "ID" }
    orderBy: { type: "RegionsOrdering", defaultValue: name }
    orderMode: { type: "OrderingMode", defaultValue: asc }
    filters: { type: "FilterGroup" }
  )
  @refetchable(queryName: "RegionsLinesRefetchQuery") {
    regions(
      search: $search
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    ) @connection(key: "Pagination_regions") {
      edges {
        node {
          id
          name
          description
          ...RegionsLine_node
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

const Regions: FunctionComponent = () => {
  const { t_i18n } = useFormatter();

  const initialValues = {
    searchTerm: '',
    sortBy: 'name',
    orderAsc: true,
    openExports: false,
    filters: emptyFilterGroup,
  };
  const { viewStorage: { filters }, helpers: storageHelpers, paginationOptions } = usePaginationLocalStorage<RegionsLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    initialValues,
  );

  const contextFilters = useBuildEntityTypeBasedFilterContext('Region', filters);
  const queryPaginationOptions = {
    ...paginationOptions,
    filters: contextFilters,
  } as unknown as RegionsLinesPaginationQuery$variables;

  const dataColumns = {
    name: { flexSize: 70 },
    created: {},
    modified: {},
  };
  const queryRef = useQueryLoading<RegionsLinesPaginationQuery>(
    regionsLinesQuery,
    queryPaginationOptions,
  );

  const preloadedPaginationOptions = {
    linesQuery: regionsLinesQuery,
    linesFragment: regionsLinesFragment,
    queryRef,
    nodePath: ['regions', 'pageInfo', 'globalCount'],
    setNumberOfElements: storageHelpers.handleSetNumberOfElements,
  } as UsePreloadedPaginationFragment<RegionsLinesPaginationQuery>;

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t_i18n('Locations') }, { label: t_i18n('Regions'), current: true }]} />
      {queryRef && (
        <DataTable
          dataColumns={dataColumns}
          resolvePath={(data: RegionsLines_data$data) => data.regions?.edges?.map((n) => n?.node)}
          storageKey={LOCAL_STORAGE_KEY}
          initialValues={initialValues}
          toolbarFilters={contextFilters}
          lineFragment={regionLineFragment}
          preloadedPaginationProps={preloadedPaginationOptions}
          filterExportContext={{ entity_type: 'Region' }}
        />
      )}
      <Security needs={[KNOWLEDGE_KNUPDATE]}>
        <RegionCreation paginationOptions={queryPaginationOptions} />
      </Security>
    </>
  );
};

export default Regions;
