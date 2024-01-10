import React, { FunctionComponent } from 'react';
import { graphql } from 'react-relay';
import { CountriesLines_data$data } from '@components/locations/__generated__/CountriesLines_data.graphql';
import { CountriesLinesPaginationQuery, CountriesLinesPaginationQuery$variables } from '@components/locations/__generated__/CountriesLinesPaginationQuery.graphql';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import CountryCreation from './countries/CountryCreation';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import { useBuildEntityTypeBasedFilterContext, emptyFilterGroup } from '../../../utils/filters/filtersUtils';
import { useFormatter } from '../../../components/i18n';
import Breadcrumbs from '../../../components/Breadcrumbs';
import DataTable from '../../../components/dataGrid/DataTable';
import { UsePreloadedPaginationFragment } from '../../../utils/hooks/usePreloadedPaginationFragment';

const LOCAL_STORAGE_KEY = 'countries';

const countryLineFragment = graphql`
  fragment CountriesLine_node on Country {
    id
    entity_type
    name
    x_opencti_aliases
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

const countriesLinesQuery = graphql`
  query CountriesLinesPaginationQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: CountriesOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
  ) {
    ...CountriesLines_data
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

const countriesLinesFragment = graphql`
  fragment CountriesLines_data on Query
  @argumentDefinitions(
    search: { type: "String" }
    count: { type: "Int", defaultValue: 25 }
    cursor: { type: "ID" }
    orderBy: { type: "CountriesOrdering", defaultValue: name }
    orderMode: { type: "OrderingMode", defaultValue: asc }
    filters: { type: "FilterGroup" }
  )
  @refetchable(queryName: "CountriesLinesRefetchQuery") {
    countries(
      search: $search
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    ) @connection(key: "Pagination_countries") {
      edges {
        node {
          id
          name
          description
          ...CountriesLine_node
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

const Countries: FunctionComponent = () => {
  const { t_i18n } = useFormatter();

  const initialValues = {
    searchTerm: '',
    sortBy: 'name',
    orderAsc: true,
    openExports: false,
    filters: emptyFilterGroup,
  };
  const { viewStorage: { filters }, helpers: storageHelpers, paginationOptions } = usePaginationLocalStorage<CountriesLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    initialValues,
  );

  const contextFilters = useBuildEntityTypeBasedFilterContext('Country', filters);
  const queryPaginationOptions = {
    ...paginationOptions,
    filters: contextFilters,
  } as unknown as CountriesLinesPaginationQuery$variables;

  const dataColumns = {
    name: { flexSize: 70 },
    created: {},
    modified: {},
  };
  const queryRef = useQueryLoading<CountriesLinesPaginationQuery>(
    countriesLinesQuery,
    queryPaginationOptions,
  );

  const preloadedPaginationOptions = {
    linesQuery: countriesLinesQuery,
    linesFragment: countriesLinesFragment,
    queryRef,
    nodePath: ['countries', 'pageInfo', 'globalCount'],
    setNumberOfElements: storageHelpers.handleSetNumberOfElements,
  } as UsePreloadedPaginationFragment<CountriesLinesPaginationQuery>;

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t_i18n('Locations') }, { label: t_i18n('Countries'), current: true }]} />
      {queryRef && (
        <DataTable
          dataColumns={dataColumns}
          resolvePath={(data: CountriesLines_data$data) => data.countries?.edges?.map((n) => n?.node)}
          storageKey={LOCAL_STORAGE_KEY}
          initialValues={initialValues}
          toolbarFilters={contextFilters}
          lineFragment={countryLineFragment}
          preloadedPaginationProps={preloadedPaginationOptions}
          filterExportContext={{ entity_type: 'Country' }}
        />
      )}
      <Security needs={[KNOWLEDGE_KNUPDATE]}>
        <CountryCreation paginationOptions={queryPaginationOptions} />
      </Security>
    </>
  );
};

export default Countries;
