import React, { FunctionComponent } from 'react';
import { graphql } from 'react-relay';
import {
  AdministrativeAreasLinesPaginationQuery,
  AdministrativeAreasLinesPaginationQuery$variables,
} from '@components/locations/__generated__/AdministrativeAreasLinesPaginationQuery.graphql';
import { AdministrativeAreasLines_data$data } from '@components/locations/__generated__/AdministrativeAreasLines_data.graphql';
import AdministrativeAreaCreation from './administrative_areas/AdministrativeAreaCreation';
import Security from '../../../utils/Security';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import { useBuildEntityTypeBasedFilterContext, emptyFilterGroup } from '../../../utils/filters/filtersUtils';
import { useFormatter } from '../../../components/i18n';
import Breadcrumbs from '../../../components/Breadcrumbs';
import DataTable from '../../../components/dataGrid/DataTable';
import { UsePreloadedPaginationFragment } from '../../../utils/hooks/usePreloadedPaginationFragment';

const LOCAL_STORAGE_KEY = 'administrative-areas';

const AdministrativeAreaFragment = graphql`
  fragment AdministrativeAreasLine_node on AdministrativeArea {
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

const administrativeAreasLinesQuery = graphql`
  query AdministrativeAreasLinesPaginationQuery(
    $search: String
    $count: Int
    $cursor: ID
    $orderBy: AdministrativeAreasOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
  ) {
    ...AdministrativeAreasLines_data
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

const administrativeAreasLinesFragment = graphql`
  fragment AdministrativeAreasLines_data on Query
  @argumentDefinitions(
    search: { type: "String" }
    count: { type: "Int" }
    cursor: { type: "ID" }
    orderBy: { type: "AdministrativeAreasOrdering" }
    orderMode: { type: "OrderingMode" }
    filters: { type: "FilterGroup" }
  )
  @refetchable(queryName: "AdministrativeAreasLinesRefetchQuery") {
    administrativeAreas(
      search: $search
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    ) @connection(key: "Pagination_administrativeAreas") {
      edges {
        node {
          id
          name
          description
          ...AdministrativeAreasLine_node
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

const AdministrativeAreas: FunctionComponent = () => {
  const { t_i18n } = useFormatter();

  const initialValues = {
    searchTerm: '',
    sortBy: 'name',
    orderAsc: true,
    openExports: false,
    filters: emptyFilterGroup,
  };
  const { viewStorage: { filters }, helpers: storageHelpers, paginationOptions } = usePaginationLocalStorage<AdministrativeAreasLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    initialValues,
  );

  const contextFilters = useBuildEntityTypeBasedFilterContext('Administrative-Area', filters);
  const queryPaginationOptions = {
    ...paginationOptions,
    filters: contextFilters,
  } as unknown as AdministrativeAreasLinesPaginationQuery$variables;

  const dataColumns = {
    name: { flexSize: 70 },
    created: {},
    modified: {},
  };
  const queryRef = useQueryLoading<AdministrativeAreasLinesPaginationQuery>(
    administrativeAreasLinesQuery,
    queryPaginationOptions,
  );

  const preloadedPaginationProps = {
    linesQuery: administrativeAreasLinesQuery,
    linesFragment: administrativeAreasLinesFragment,
    queryRef,
    nodePath: ['administrativeAreas', 'pageInfo', 'globalCount'],
    setNumberOfElements: storageHelpers.handleSetNumberOfElements,
  } as UsePreloadedPaginationFragment<AdministrativeAreasLinesPaginationQuery>;

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t_i18n('Locations') }, { label: t_i18n('Administrative areas'), current: true }]} />
      {queryRef && (
        <DataTable
          dataColumns={dataColumns}
          resolvePath={(data: AdministrativeAreasLines_data$data) => data.administrativeAreas?.edges?.map((n) => n?.node)}
          storageKey={LOCAL_STORAGE_KEY}
          initialValues={initialValues}
          toolbarFilters={contextFilters}
          lineFragment={AdministrativeAreaFragment}
          preloadedPaginationProps={preloadedPaginationProps}
          filterExportContext={{ entity_type: 'Administrative-Area' }}
        />
      )}
      <Security needs={[KNOWLEDGE_KNUPDATE]}>
        <AdministrativeAreaCreation paginationOptions={queryPaginationOptions} />
      </Security>
    </>
  );
};

export default AdministrativeAreas;
