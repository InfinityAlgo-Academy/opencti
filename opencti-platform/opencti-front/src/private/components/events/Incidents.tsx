import React, { FunctionComponent } from 'react';
import { graphql } from 'react-relay';
import { IncidentsLinesPaginationQuery, IncidentsLinesPaginationQuery$variables } from '@components/events/__generated__/IncidentsLinesPaginationQuery.graphql';
import { IncidentsLines_data$data } from '@components/events/__generated__/IncidentsLines_data.graphql';
import IncidentCreation from './incidents/IncidentCreation';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import useAuth from '../../../utils/hooks/useAuth';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import { useBuildEntityTypeBasedFilterContext, emptyFilterGroup } from '../../../utils/filters/filtersUtils';
import { useFormatter } from '../../../components/i18n';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { DataTableProps } from '../../../components/dataGrid/dataTableTypes';
import DataTable from '../../../components/dataGrid/DataTable';
import { UsePreloadedPaginationFragment } from '../../../utils/hooks/usePreloadedPaginationFragment';

export const LOCAL_STORAGE_KEY = 'incidents';

const incidentLineFragment = graphql`
  fragment IncidentsLine_node on Incident {
    id
    name
    incident_type
    severity
    created
    modified
    confidence
    entity_type
    objectAssignee {
      entity_type
      id
      name
    }
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
    creators {
      id
      name
    }
    status {
      id
      order
      template {
        name
        color
      }
    }
    workflowEnabled
  }
`;

const incidentsLinesPaginationQuery = graphql`
  query IncidentsLinesPaginationQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: IncidentsOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
  ) {
    ...IncidentsLines_data
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

export const IncidentsLinesFragment = graphql`
  fragment IncidentsLines_data on Query
  @argumentDefinitions(
    search: { type: "String" }
    count: { type: "Int", defaultValue: 25 }
    cursor: { type: "ID" }
    orderBy: { type: "IncidentsOrdering", defaultValue: name }
    orderMode: { type: "OrderingMode", defaultValue: asc }
    filters: { type: "FilterGroup" }
  )
  @refetchable(queryName: "IncidentsLinesRefetchQuery") {
    incidents(
      search: $search
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    ) @connection(key: "Pagination_incidents") {
      edges {
        node {
          id
          name
          description
          ...IncidentsLine_node
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

const Incidents: FunctionComponent = () => {
  const { t_i18n } = useFormatter();
  const {
    platformModuleHelpers: { isRuntimeFieldEnable },
  } = useAuth();

  const initialValues = {
    searchTerm: '',
    sortBy: 'created',
    orderAsc: false,
    openExports: false,
    filters: emptyFilterGroup,
  };
  const { viewStorage, helpers: storageHelpers, paginationOptions } = usePaginationLocalStorage<IncidentsLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    initialValues,
  );
  const {
    filters,
  } = viewStorage;

  const contextFilters = useBuildEntityTypeBasedFilterContext('Incident', filters);
  const queryPaginationOptions = {
    ...paginationOptions,
    filters: contextFilters,
  } as unknown as IncidentsLinesPaginationQuery$variables;
  const queryRef = useQueryLoading<IncidentsLinesPaginationQuery>(
    incidentsLinesPaginationQuery,
    queryPaginationOptions,
  );

  const isRuntimeSort = isRuntimeFieldEnable() ?? false;
  const dataColumns: DataTableProps['dataColumns'] = {
    name: { flexSize: 20 },
    incident_type: {
      label: 'Incident type',
      flexSize: 9,
      isSortable: true,
    },
    severity: { flexSize: 10 },
    objectAssignee: { isSortable: isRuntimeSort },
    creator: { isSortable: isRuntimeSort },
    objectLabel: {},
    created: { flexSize: 10 },
    x_opencti_workflow_id: {},
    objectMarking: { isSortable: isRuntimeSort },
  };

  const preloadedPaginationProps = {
    linesQuery: incidentsLinesPaginationQuery,
    linesFragment: IncidentsLinesFragment,
    queryRef,
    nodePath: ['incidents', 'pageInfo', 'globalCount'],
    setNumberOfElements: storageHelpers.handleSetNumberOfElements,
  } as UsePreloadedPaginationFragment<IncidentsLinesPaginationQuery>;

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t_i18n('Events') }, { label: t_i18n('Incidents'), current: true }]} />
      {queryRef && (
        <DataTable
          dataColumns={dataColumns}
          resolvePath={(data: IncidentsLines_data$data) => data.incidents?.edges?.map((n) => n?.node)}
          storageKey={LOCAL_STORAGE_KEY}
          initialValues={initialValues}
          toolbarFilters={contextFilters}
          preloadedPaginationProps={preloadedPaginationProps}
          lineFragment={incidentLineFragment}
          filterExportContext={{ entity_type: 'Incident' }}
        />
      )}
      <Security needs={[KNOWLEDGE_KNUPDATE]}>
        <IncidentCreation paginationOptions={queryPaginationOptions} />
      </Security>
    </>
  );
};

export default Incidents;
