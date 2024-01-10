import React, { FunctionComponent } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { ContainerStixCyberObservables_container$data } from '@components/common/containers/__generated__/ContainerStixCyberObservables_container.graphql';
import { ContainerStixCyberObservables_containerQuery$data } from '@components/common/containers/__generated__/ContainerStixCyberObservables_containerQuery.graphql';
import {
  ContainerStixCyberObservablesQuery,
  ContainerStixCyberObservablesQuery$variables,
} from '@components/common/containers/__generated__/ContainerStixCyberObservablesQuery.graphql';
import StixCyberObservablesRightBar from '../../observations/stix_cyber_observables/StixCyberObservablesRightBar';
import { usePaginationLocalStorage } from '../../../../utils/hooks/useLocalStorage';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import { emptyFilterGroup, isFilterGroupNotEmpty, useRemoveIdAndIncorrectKeysFromFilterGroupObject } from '../../../../utils/filters/filtersUtils';
import DataTable from '../../../../components/dataGrid/DataTable';
import useAuth from '../../../../utils/hooks/useAuth';
import { UsePreloadedPaginationFragment } from '../../../../utils/hooks/usePreloadedPaginationFragment';
import { DataTableProps } from '../../../../components/dataGrid/dataTableTypes';

export const ContainerStixCyberObservablesLinesSearchQuery = graphql`
  query ContainerStixCyberObservablesLinesSearchQuery(
    $id: String!
    $types: [String]
    $search: String
    $filters: FilterGroup
    $count: Int
  ) {
    container(id: $id) {
      id
      objects(
        types: $types
        search: $search
        first: $count
        filters: $filters
      ) {
        edges {
          types
          node {
            ... on StixCyberObservable {
              id
              observable_value
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
          globalCount
        }
      }
    }
  }
`;

const containerStixCyberObservableLineFragment = graphql`
  fragment ContainerStixCyberObservables_node on StixCyberObservable {
    id
    standard_id
    observable_value
    entity_type
    parent_types
    created_at
    ... on IPv4Addr {
      countries {
        edges {
          node {
            name
            x_opencti_aliases
          }
        }
      }
    }
    ... on IPv6Addr {
      countries {
        edges {
          node {
            name
            x_opencti_aliases
          }
        }
      }
    }
    objectLabel {
      id
      value
      color
    }
    createdBy {
      ... on Identity {
        id
        name
        entity_type
      }
    }
    objectMarking {
      id
      definition_type
      definition
      x_opencti_order
      x_opencti_color
    }
    containersNumber {
      total
    }
  }
`;

const containerStixCyberObservablesQuery = graphql`
  query ContainerStixCyberObservablesQuery(
    $id: String!
    $types: [String]
    $search: String
    $count: Int
    $cursor: ID
    $orderBy: StixObjectOrStixRelationshipsOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
  ) {
    ...ContainerStixCyberObservables_containerQuery
    @arguments(
      id: $id
      types: $types
      search: $search
      count: $count
      cursor: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    )
  }
`;

const containerStixCyberObservablesLinesFragment = graphql`
  fragment ContainerStixCyberObservables_containerQuery on Query
  @argumentDefinitions(
    id: { type: "String!" }
    types: { type: "[String]" }
    search: { type: "String" }
    count: { type: "Int", defaultValue: 25 }
    cursor: { type: "ID" }
    orderBy: {
      type: "StixObjectOrStixRelationshipsOrdering"
      defaultValue: name
    }
    orderMode: { type: "OrderingMode", defaultValue: asc }
    filters: { type: "FilterGroup" }
  )
  @refetchable(queryName: "ContainerStixCyberObservablesLinesRefetchQuery") {
    container(id: $id) {
      id
      confidence
      createdBy {
        ... on Identity {
          id
          name
          entity_type
        }
      }
      objectMarking {
        id
        definition_type
        definition
        x_opencti_order
        x_opencti_color
      }
      objects(
        types: $types
        search: $search
        first: $count
        after: $cursor
        orderBy: $orderBy
        orderMode: $orderMode
        filters: $filters
      ) @connection(key: "Pagination_objects") {
        edges {
          types
          node {
            ... on StixCyberObservable {
              id
              observable_value
            }
            ...ContainerStixCyberObservables_node
          }
        }
        pageInfo {
          endCursor
          hasNextPage
          globalCount
        }
      }
    }
  }
`;

interface ContainerStixCyberObservablesComponentProps {
  container: ContainerStixCyberObservables_container$data;
  enableReferences?: boolean;
}

const ContainerStixCyberObservablesComponent: FunctionComponent<ContainerStixCyberObservablesComponentProps> = ({ container, enableReferences }) => {
  const {
    platformModuleHelpers: { isRuntimeFieldEnable },
  } = useAuth();

  const LOCAL_STORAGE_KEY = `container-${container.id}-stixCyberObservables`;

  const initialValues = {
    id: container.id,
    filters: emptyFilterGroup,
    searchTerm: '',
    sortBy: 'created_at',
    orderAsc: false,
    openExports: false,
    types: [] as string[],
  };
  const {
    viewStorage,
    paginationOptions,
    helpers,
  } = usePaginationLocalStorage<ContainerStixCyberObservablesQuery$variables>(
    LOCAL_STORAGE_KEY,
    initialValues,
  );

  const {
    filters,
    openExports,
    types,
  } = viewStorage;
  const {
    handleAddProperty,
  } = helpers;
  const handleClear = () => {
    handleAddProperty('types', []);
  };
  const handleToggle = (type: string) => {
    if (types?.includes(type)) {
      handleAddProperty(
        'types',
        types.filter((x) => x !== type),
      );
    } else {
      handleAddProperty('types', types ? [...types, type] : [type]);
    }
  };

  const userFilters = useRemoveIdAndIncorrectKeysFromFilterGroupObject(filters, ['Stix-Cyber-Observable']);
  const contextFilters = {
    mode: 'and',
    filters: [
      {
        key: 'objects',
        values: [container.id],
        operator: 'eq',
        mode: 'or',
      },
      {
        key: 'entity_type',
        values: types && types.length > 0 ? types : ['Stix-Cyber-Observable'],
        operator: 'eq',
        mode: 'or',
      },
    ],
    filterGroups: userFilters && isFilterGroupNotEmpty(userFilters) ? [userFilters] : [],
  };
  const queryPaginationOptions = {
    ...paginationOptions,
    filters: contextFilters,
  } as unknown as ContainerStixCyberObservablesQuery$variables;

  const isRuntimeSort = isRuntimeFieldEnable() ?? false;
  const dataColumns: DataTableProps['dataColumns'] = {
    entity_type: {
      flexSize: 12,
    },
    observable_value: {
      flexSize: 28,
      isSortable: isRuntimeSort,
    },
    objectLabel: {
      flexSize: 19,
    },
    createdBy: {
      isSortable: isRuntimeSort,
    },
    created_at: {
      flexSize: 10,
    },
    analyses: {},
    objectMarking: {
      flexSize: 9,
      isSortable: isRuntimeSort,
    },
  };

  const queryRef = useQueryLoading<ContainerStixCyberObservablesQuery>(
    containerStixCyberObservablesQuery,
    queryPaginationOptions,
  );
  const preloadedPaginationProps = {
    linesQuery: containerStixCyberObservablesQuery,
    linesFragment: containerStixCyberObservablesLinesFragment,
    queryRef,
    nodePath: ['container', 'objects', 'pageInfo', 'globalCount'],
    setNumberOfElements: helpers.handleSetNumberOfElements,
  } as UsePreloadedPaginationFragment<ContainerStixCyberObservablesQuery>;

  return (
    <>
      {queryRef && (
        <DataTable
          dataColumns={dataColumns}
          resolvePath={(data: ContainerStixCyberObservables_containerQuery$data) => data.container?.objects?.edges?.map((n) => n?.node)}
          storageKey={LOCAL_STORAGE_KEY}
          initialValues={initialValues}
          toolbarFilters={contextFilters}
          lineFragment={containerStixCyberObservableLineFragment}
          preloadedPaginationProps={preloadedPaginationProps}
          filterExportContext={{ entity_type: 'Stix-Cyber-Observable' }}
          redirectionModeEnabled
          enableReferences={enableReferences}
        />
      )}
      <StixCyberObservablesRightBar
        types={types}
        handleToggle={handleToggle}
        handleClear={handleClear}
        openExports={openExports}
      />
    </>
  );
};

const ContainerStixCyberObservables = createFragmentContainer(
  ContainerStixCyberObservablesComponent,
  {
    container: graphql`
      fragment ContainerStixCyberObservables_container on Container {
        id
        ... on Report {
          name
        }
        ... on Grouping {
          name
        }
        ... on Note {
          attribute_abstract
          content
        }
        ... on Opinion {
          opinion
        }
        ... on ObservedData {
          name
          first_observed
          last_observed
        }
        ...ContainerHeader_container
      }
    `,
  },
);

export default ContainerStixCyberObservables;
