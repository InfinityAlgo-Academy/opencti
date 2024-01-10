import React from 'react';
import { graphql, useFragment } from 'react-relay';
import {
  ContainerStixDomainObjectsLinesQuery,
  ContainerStixDomainObjectsLinesQuery$variables,
} from '@components/common/containers/__generated__/ContainerStixDomainObjectsLinesQuery.graphql';
import { ContainerStixDomainObjects_container$key } from '@components/common/containers/__generated__/ContainerStixDomainObjects_container.graphql';
import { ContainerStixDomainObjects_containerQuery$data } from '@components/common/containers/__generated__/ContainerStixDomainObjects_containerQuery.graphql';
import ContainerAddStixCoreObjects from '@components/common/containers/ContainerAddStixCoreObjects';
import StixDomainObjectsRightBar from '../stix_domain_objects/StixDomainObjectsRightBar';
import { usePaginationLocalStorage } from '../../../../utils/hooks/useLocalStorage';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import useAuth from '../../../../utils/hooks/useAuth';
import { emptyFilterGroup, FilterGroup, isFilterGroupNotEmpty, useRemoveIdAndIncorrectKeysFromFilterGroupObject } from '../../../../utils/filters/filtersUtils';
import DataTable from '../../../../components/dataGrid/DataTable';
import { UsePreloadedPaginationFragment } from '../../../../utils/hooks/usePreloadedPaginationFragment';
import Security from '../../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../../utils/hooks/useGranted';

const ContainerStixDomainObjectsFragment = graphql`
  fragment ContainerStixDomainObjects_container on Container {
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
    confidence
    createdBy {
      id
    }
    objectMarking {
      id
      definition_type
      definition
      x_opencti_order
      x_opencti_color
    }
    ...ContainerHeader_container
  }
`;

const containerStixDomainObjectLine = graphql`
  fragment ContainerStixDomainObjects_node on StixDomainObject {
    id
    standard_id
    entity_type
    parent_types
    created_at
    ... on StixDomainObject {
      representative {
        main
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

export const containerStixDomainObjectsLinesQuery = graphql`
  query ContainerStixDomainObjectsLinesQuery(
    $id: String!
    $search: String
    $types: [String]
    $count: Int!
    $cursor: ID
    $orderBy: StixObjectOrStixRelationshipsOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
  ) {
    ...ContainerStixDomainObjects_containerQuery
    @arguments(
      search: $search
      types: $types
      count: $count
      cursor: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    )
  }
`;

export const containerStixDomainObjectsLinesFragment = graphql`
  fragment ContainerStixDomainObjects_containerQuery on Query
  @argumentDefinitions(
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
  @refetchable(queryName: "ContainerStixDomainObjectsLinesRefetchQuery") {
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
            ... on BasicObject {
              id
            }
            ...ContainerStixDomainObjects_node
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

const ContainerStixDomainObjects = ({
  container, enableReferences,
}: {
  container: ContainerStixDomainObjects_container$key;
  enableReferences?: boolean
}) => {
  const {
    platformModuleHelpers: { isRuntimeFieldEnable },
  } = useAuth();
  const containerData = useFragment(
    ContainerStixDomainObjectsFragment,
    container,
  );

  const LOCAL_STORAGE_KEY = `container-${containerData.id}-stixDomainObjects`;
  const initialValues = {
    filters: emptyFilterGroup,
    searchTerm: '',
    sortBy: 'name',
    orderAsc: false,
    openExports: false,
    types: [],
  };
  const {
    viewStorage,
    paginationOptions,
    helpers: storageHelpers,
  } = usePaginationLocalStorage<ContainerStixDomainObjectsLinesQuery$variables>(
    LOCAL_STORAGE_KEY,
    initialValues,
  );
  const {
    filters,
    searchTerm,
    sortBy,
    orderAsc,
    openExports,
    types,
  } = viewStorage;

  const userFilters = useRemoveIdAndIncorrectKeysFromFilterGroupObject(filters, ['Stix-Domain-Object']);
  const contextFilters: FilterGroup = {
    mode: 'and',
    filters: [
      { key: 'objects', values: [containerData.id], operator: 'eq' },
      {
        key: 'entity_type',
        values: (types && types.length > 0) ? types : ['Stix-Domain-Object'],
        operator: 'eq',
        mode: 'or',
      },
    ],
    filterGroups: userFilters && isFilterGroupNotEmpty(userFilters) ? [userFilters] : [],
  };
  const queryPaginationOptions = {
    ...paginationOptions,
    id: containerData.id,
    orderBy: sortBy,
    orderMode: orderAsc ? 'asc' : 'desc',
    search: searchTerm,
    filters: contextFilters,
  } as unknown as ContainerStixDomainObjectsLinesQuery$variables;

  const queryRef = useQueryLoading<ContainerStixDomainObjectsLinesQuery>(
    containerStixDomainObjectsLinesQuery,
    queryPaginationOptions,
  );

  const isRuntimeSort = isRuntimeFieldEnable() ?? false;
  const dataColumns = {
    entity_type: {
      flexSize: 12,
    },
    value: {
      flexSize: 25,
      label: 'Name',
    },
    objectLabel: {
      flexSize: 19,
    },
    createdBy: {
      isSortable: isRuntimeSort,
    },
    created_at: {},
    analyses: {},
    objectMarking: {
      isSortable: isRuntimeSort,
    },
  };

  const preloadedPaginationProps = {
    linesQuery: containerStixDomainObjectsLinesQuery,
    linesFragment: containerStixDomainObjectsLinesFragment,
    queryRef,
    nodePath: ['container', 'objects', 'pageInfo', 'globalCount'],
    setNumberOfElements: storageHelpers.handleSetNumberOfElements,
  } as UsePreloadedPaginationFragment<ContainerStixDomainObjectsLinesQuery>;

  return (
    <>
      {queryRef && (
        <DataTable
          dataColumns={dataColumns}
          resolvePath={(data: ContainerStixDomainObjects_containerQuery$data) => data.container?.objects?.edges?.map((n) => n?.node)}
          storageKey={LOCAL_STORAGE_KEY}
          initialValues={initialValues}
          toolbarFilters={contextFilters}
          preloadedPaginationProps={preloadedPaginationProps}
          lineFragment={containerStixDomainObjectLine}
          filterExportContext={{ entity_type: 'Container' }}
          enableReferences={enableReferences}
        />
      )}
      {container && (
        <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <ContainerAddStixCoreObjects
            containerId={containerData.id}
            containerStixCoreObjects={undefined}
            paginationOptions={paginationOptions}
            withPadding={true}
            targetStixCoreObjectTypes={['Stix-Domain-Object']}
            onTypesChange={storageHelpers.handleToggleTypes}
            openExports={openExports}
            defaultCreatedBy={containerData.createdBy ?? null}
            defaultMarkingDefinitions={containerData.objectMarking ?? []}
            confidence={containerData.confidence}
            enableReferences={enableReferences}
          />
        </Security>
      )}
      <StixDomainObjectsRightBar
        types={types}
        handleToggle={storageHelpers.handleToggleTypes}
        handleClear={storageHelpers.handleClearTypes}
        openExports={openExports}
      />
    </>
  );
};

export default ContainerStixDomainObjects;
