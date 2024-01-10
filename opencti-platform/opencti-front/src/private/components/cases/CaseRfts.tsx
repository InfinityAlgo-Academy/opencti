import React, { FunctionComponent } from 'react';
import { graphql } from 'react-relay';
import { CaseRftsLinesCasesPaginationQuery, CaseRftsLinesCasesPaginationQuery$variables } from '@components/cases/__generated__/CaseRftsLinesCasesPaginationQuery.graphql';
import { CaseRftsLinesCases_data$data } from '@components/cases/__generated__/CaseRftsLinesCases_data.graphql';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import useAuth from '../../../utils/hooks/useAuth';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import CaseRftCreation from './case_rfts/CaseRftCreation';
import { useBuildEntityTypeBasedFilterContext, emptyFilterGroup } from '../../../utils/filters/filtersUtils';
import { useFormatter } from '../../../components/i18n';
import Breadcrumbs from '../../../components/Breadcrumbs';
import DataTable from '../../../components/dataGrid/DataTable';
import { UsePreloadedPaginationFragment } from '../../../utils/hooks/usePreloadedPaginationFragment';
import { DataTableProps } from '../../../components/dataGrid/dataTableTypes';

interface CaseRftsProps {
  inputValue?: string;
}

const caseFragment = graphql`
  fragment CaseRftsLineCases_data on CaseRft {
    id
    name
    description
    entity_type
    created
    takedown_types
    priority
    severity
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

const caseRftsLinesQuery = graphql`
  query CaseRftsLinesCasesPaginationQuery(
    $search: String
    $count: Int
    $cursor: ID
    $orderBy: CaseRftsOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
  ) {
    ...CaseRftsLinesCases_data
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

const caseRftsLinesFragment = graphql`
  fragment CaseRftsLinesCases_data on Query
  @argumentDefinitions(
    search: { type: "String" }
    count: { type: "Int" }
    cursor: { type: "ID" }
    orderBy: { type: "CaseRftsOrdering" }
    orderMode: { type: "OrderingMode", defaultValue: desc }
    filters: { type: "FilterGroup" }
  )
  @refetchable(queryName: "CaseRftCasesLinesRefetchQuery") {
    caseRfts(
      search: $search
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    ) @connection(key: "Pagination_case_caseRfts") {
      edges {
        node {
          id
          ...CaseRftsLineCases_data
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

export const LOCAL_STORAGE_KEY = 'caseRfts';

const CaseRfts: FunctionComponent<CaseRftsProps> = () => {
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
  const { viewStorage, helpers: storageHelpers, paginationOptions } = usePaginationLocalStorage<CaseRftsLinesCasesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    initialValues,
  );

  const {
    filters,
  } = viewStorage;

  const contextFilters = useBuildEntityTypeBasedFilterContext('Case-Rft', filters);
  const queryPaginationOptions = {
    ...paginationOptions,
    filters: contextFilters,
  } as unknown as CaseRftsLinesCasesPaginationQuery$variables;
  const queryRef = useQueryLoading<CaseRftsLinesCasesPaginationQuery>(
    caseRftsLinesQuery,
    queryPaginationOptions,
  );

  const isRuntimeSort = isRuntimeFieldEnable() ?? false;
  const dataColumns: DataTableProps['dataColumns'] = {
    name: {
      flexSize: 21,
    },
    priority: {
      flexSize: 10,
    },
    severity: {
      flexSize: 10,
    },
    objectAssignee: {
      flexSize: 10,
      isSortable: isRuntimeSort,
    },
    creator: {
      flexSize: 10,
      isSortable: isRuntimeSort,
    },
    objectLabel: {},
    created: {
      flexSize: 8,
    },
    x_opencti_workflow_id: {},
    objectMarking: {
      isSortable: isRuntimeSort,
    },
  };

  const preloadedPaginationProps = {
    linesQuery: caseRftsLinesQuery,
    linesFragment: caseRftsLinesFragment,
    queryRef,
    nodePath: ['caseRfts', 'pageInfo', 'globalCount'],
    setNumberOfElements: storageHelpers.handleSetNumberOfElements,
  } as UsePreloadedPaginationFragment<CaseRftsLinesCasesPaginationQuery>;

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t_i18n('Cases') }, { label: t_i18n('Requests for takedown'), current: true }]} />
      {queryRef && (
        <DataTable
          dataColumns={dataColumns}
          resolvePath={(data: CaseRftsLinesCases_data$data) => data.caseRfts?.edges?.map((n) => n?.node)}
          storageKey={LOCAL_STORAGE_KEY}
          initialValues={initialValues}
          toolbarFilters={contextFilters}
          preloadedPaginationProps={preloadedPaginationProps}
          lineFragment={caseFragment}
          filterExportContext={{ entity_type: 'Case-Rft' }}
        />
      )}
      <Security needs={[KNOWLEDGE_KNUPDATE]}>
        <CaseRftCreation paginationOptions={queryPaginationOptions} />
      </Security>
    </>
  );
};

export default CaseRfts;
