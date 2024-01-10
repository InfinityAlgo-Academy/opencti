import React from 'react';
import { graphql } from 'react-relay';
import { OrganizationsLinesPaginationQuery, OrganizationsLinesPaginationQuery$variables } from '@components/entities/__generated__/OrganizationsLinesPaginationQuery.graphql';
import { OrganizationsLines_data$data } from '@components/entities/__generated__/OrganizationsLines_data.graphql';
import OrganizationCreation from './organizations/OrganizationCreation';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import { useBuildEntityTypeBasedFilterContext, emptyFilterGroup } from '../../../utils/filters/filtersUtils';
import { useFormatter } from '../../../components/i18n';
import Breadcrumbs from '../../../components/Breadcrumbs';
import DataTable from '../../../components/dataGrid/DataTable';
import { UsePreloadedPaginationFragment } from '../../../utils/hooks/usePreloadedPaginationFragment';

const LOCAL_STORAGE_KEY = 'organizations';

const organizationLineFragment = graphql`
  fragment OrganizationsLine_node on Organization {
    id
    entity_type
    x_opencti_organization_type
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

const organizationsLinesQuery = graphql`
  query OrganizationsLinesPaginationQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: OrganizationsOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
  ) {
    ...OrganizationsLines_data
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

export const organizationsLinesFragment = graphql`
  fragment OrganizationsLines_data on Query
  @argumentDefinitions(
    search: { type: "String" }
    count: { type: "Int", defaultValue: 25 }
    cursor: { type: "ID" }
    orderBy: { type: "OrganizationsOrdering", defaultValue: name }
    orderMode: { type: "OrderingMode", defaultValue: asc }
    filters: { type: "FilterGroup" }
  )
  @refetchable(queryName: "OrganizationsLinesRefetchQuery") {
    organizations(
      search: $search
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    ) @connection(key: "Pagination_organizations") {
      edges {
        node {
          id
          name
          description
          ...OrganizationsLine_node
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

const Organizations = () => {
  const { t_i18n } = useFormatter();

  const initialValues = {
    searchTerm: '',
    sortBy: 'name',
    orderAsc: true,
    openExports: false,
    filters: emptyFilterGroup,
  };
  const { viewStorage: { filters }, helpers: storageHelpers, paginationOptions } = usePaginationLocalStorage<OrganizationsLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    initialValues,
  );

  const dataColumns = {
    name: { flexSize: 35 },
    x_opencti_organization_type: {
      label: 'Type',
      flexSize: 15,
      isSortable: true,
    },
    objectLabel: { flexSize: 20 },
    created: {},
    modified: {},
  };

  const contextFilters = useBuildEntityTypeBasedFilterContext('Organization', filters);
  const queryPaginationOptions = {
    ...paginationOptions,
    filters: contextFilters,
  } as unknown as OrganizationsLinesPaginationQuery$variables;

  const queryRef = useQueryLoading<OrganizationsLinesPaginationQuery>(
    organizationsLinesQuery,
    queryPaginationOptions,
  );

  const preloadedPaginationProps = {
    linesQuery: organizationsLinesQuery,
    linesFragment: organizationsLinesFragment,
    queryRef,
    nodePath: ['organizations', 'pageInfo', 'globalCount'],
    setNumberOfElements: storageHelpers.handleSetNumberOfElements,
  } as UsePreloadedPaginationFragment<OrganizationsLinesPaginationQuery>;

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t_i18n('Entities') }, { label: t_i18n('Organizations'), current: true }]} />
      {queryRef && (
        <DataTable
          dataColumns={dataColumns}
          resolvePath={(data: OrganizationsLines_data$data) => data.organizations?.edges?.map((n) => n?.node)}
          storageKey={LOCAL_STORAGE_KEY}
          initialValues={initialValues}
          toolbarFilters={contextFilters}
          preloadedPaginationProps={preloadedPaginationProps}
          lineFragment={organizationLineFragment}
          filterExportContext={{ entity_type: 'Organization' }}
        />
      )}
      <Security needs={[KNOWLEDGE_KNUPDATE]}>
        <OrganizationCreation paginationOptions={queryPaginationOptions} />
      </Security>
    </>
  );
};

export default Organizations;
