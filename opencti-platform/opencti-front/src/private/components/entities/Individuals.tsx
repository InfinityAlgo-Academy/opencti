import React from 'react';
import { graphql } from 'react-relay';
import { IndividualsLinesPaginationQuery, IndividualsLinesPaginationQuery$variables } from '@components/entities/__generated__/IndividualsLinesPaginationQuery.graphql';
import { IndividualsLines_data$data } from '@components/entities/__generated__/IndividualsLines_data.graphql';
import IndividualCreation from './individuals/IndividualCreation';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import { useBuildEntityTypeBasedFilterContext, emptyFilterGroup } from '../../../utils/filters/filtersUtils';
import { useFormatter } from '../../../components/i18n';
import Breadcrumbs from '../../../components/Breadcrumbs';
import DataTable from '../../../components/dataGrid/DataTable';
import { UsePreloadedPaginationFragment } from '../../../utils/hooks/usePreloadedPaginationFragment';

const LOCAL_STORAGE_KEY = 'individuals';

const individualLineFragment = graphql`
  fragment IndividualsLine_node on Individual {
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

const individualsLinesQuery = graphql`
  query IndividualsLinesPaginationQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: IndividualsOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
  ) {
    ...IndividualsLines_data
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

export const individualsLinesFragment = graphql`
  fragment IndividualsLines_data on Query
  @argumentDefinitions(
    search: { type: "String" }
    count: { type: "Int", defaultValue: 25 }
    cursor: { type: "ID" }
    orderBy: { type: "IndividualsOrdering", defaultValue: name }
    orderMode: { type: "OrderingMode", defaultValue: asc }
    filters: { type: "FilterGroup" }
  )
  @refetchable(queryName: "IndividualsLinesRefetchQuery") {
    individuals(
      search: $search
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    ) @connection(key: "Pagination_individuals") {
      edges {
        node {
          id
          name
          description
          ...IndividualsLine_node
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

const Individuals = () => {
  const { t_i18n } = useFormatter();

  const initialValues = {
    searchTerm: '',
    sortBy: 'name',
    orderAsc: true,
    openExports: false,
    filters: emptyFilterGroup,
  };
  const { viewStorage: { filters }, helpers: storageHelpers, paginationOptions } = usePaginationLocalStorage<IndividualsLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    initialValues,
  );

  const dataColumns = {
    name: { flexSize: 45 },
    objectLabel: { flexSize: 25 },
    created: {},
    modified: {},
  };

  const contextFilters = useBuildEntityTypeBasedFilterContext('Individual', filters);
  const queryPaginationOptions = {
    ...paginationOptions,
    filters: contextFilters,
  } as unknown as IndividualsLinesPaginationQuery$variables;

  const queryRef = useQueryLoading<IndividualsLinesPaginationQuery>(
    individualsLinesQuery,
    queryPaginationOptions,
  );

  const preloadedPaginationOptions = {
    linesQuery: individualsLinesQuery,
    linesFragment: individualsLinesFragment,
    queryRef,
    nodePath: ['individuals', 'pageInfo', 'globalCount'],
    setNumberOfElements: storageHelpers.handleSetNumberOfElements,
  } as UsePreloadedPaginationFragment<IndividualsLinesPaginationQuery>;

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t_i18n('Entities') }, { label: t_i18n('Individuals'), current: true }]} />
      {queryRef && (
        <DataTable
          dataColumns={dataColumns}
          resolvePath={(data: IndividualsLines_data$data) => data.individuals?.edges?.map((n) => n?.node)}
          storageKey={LOCAL_STORAGE_KEY}
          initialValues={initialValues}
          toolbarFilters={contextFilters}
          lineFragment={individualLineFragment}
          preloadedPaginationProps={preloadedPaginationOptions}
          filterExportContext={{ entity_type: 'Individual' }}
        />
      )}
      <Security needs={[KNOWLEDGE_KNUPDATE]}>
        <IndividualCreation paginationOptions={queryPaginationOptions} />
      </Security>
    </>
  );
};

export default Individuals;
