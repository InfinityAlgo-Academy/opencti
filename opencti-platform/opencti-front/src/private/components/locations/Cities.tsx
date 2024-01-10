import React, { FunctionComponent } from 'react';
import { graphql } from 'react-relay';
import { CitiesLinesPaginationQuery, CitiesLinesPaginationQuery$variables } from '@components/locations/__generated__/CitiesLinesPaginationQuery.graphql';
import { CitiesLines_data$data } from '@components/locations/__generated__/CitiesLines_data.graphql';
import CityCreation from './cities/CityCreation';
import Security from '../../../utils/Security';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import { useBuildEntityTypeBasedFilterContext, emptyFilterGroup } from '../../../utils/filters/filtersUtils';
import { useFormatter } from '../../../components/i18n';
import Breadcrumbs from '../../../components/Breadcrumbs';
import DataTable from '../../../components/dataGrid/DataTable';
import { UsePreloadedPaginationFragment } from '../../../utils/hooks/usePreloadedPaginationFragment';

const LOCAL_STORAGE_KEY = 'cities';

const cityFragment = graphql`
  fragment CitiesLine_node on City {
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

const citiesLinesQuery = graphql`
  query CitiesLinesPaginationQuery(
    $search: String
    $count: Int
    $cursor: ID
    $orderBy: CitiesOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
  ) {
    ...CitiesLines_data
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

const citiesLinesFragment = graphql`
  fragment CitiesLines_data on Query
  @argumentDefinitions(
    search: { type: "String" }
    count: { type: "Int" }
    cursor: { type: "ID" }
    orderBy: { type: "CitiesOrdering" }
    orderMode: { type: "OrderingMode" }
    filters: { type: "FilterGroup" }
  )
  @refetchable(queryName: "CitiesLinesRefetchQuery") {
    cities(
      search: $search
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    ) @connection(key: "Pagination_cities") {
      edges {
        node {
          id
          name
          description
          ...CitiesLine_node
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

const Cities: FunctionComponent = () => {
  const { t_i18n } = useFormatter();

  const initialValues = {
    searchTerm: '',
    sortBy: 'name',
    orderAsc: true,
    openExports: false,
    filters: emptyFilterGroup,
  };
  const { viewStorage: { filters }, helpers: storageHelpers, paginationOptions } = usePaginationLocalStorage<CitiesLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    initialValues,
  );

  const contextFilters = useBuildEntityTypeBasedFilterContext('City', filters);
  const queryPaginationOptions = {
    ...paginationOptions,
    filters: contextFilters,
  } as unknown as CitiesLinesPaginationQuery$variables;

  const dataColumns = {
    name: { flexSize: 70 },
    created: {},
    modified: {},
  };
  const queryRef = useQueryLoading<CitiesLinesPaginationQuery>(
    citiesLinesQuery,
    queryPaginationOptions,
  );

  const preloadedPaginationProps = {
    linesQuery: citiesLinesQuery,
    linesFragment: citiesLinesFragment,
    queryRef,
    nodePath: ['cities', 'pageInfo', 'globalCount'],
    setNumberOfElements: storageHelpers.handleSetNumberOfElements,
  } as UsePreloadedPaginationFragment<CitiesLinesPaginationQuery>;

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t_i18n('Locations') }, { label: t_i18n('Cities'), current: true }]} />
      {queryRef && (
        <DataTable
          dataColumns={dataColumns}
          resolvePath={(data: CitiesLines_data$data) => data.cities?.edges?.map((n) => n?.node)}
          storageKey={LOCAL_STORAGE_KEY}
          initialValues={initialValues}
          toolbarFilters={contextFilters}
          lineFragment={cityFragment}
          preloadedPaginationProps={preloadedPaginationProps}
          filterExportContext={{ entity_type: 'City' }}
        />
      )}
      <Security needs={[KNOWLEDGE_KNUPDATE]}>
        <CityCreation paginationOptions={queryPaginationOptions} />
      </Security>
    </>
  );
};

export default Cities;
