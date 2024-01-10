import React from 'react';
import { graphql } from 'react-relay';
import { EventsLinesPaginationQuery, EventsLinesPaginationQuery$variables } from '@components/entities/__generated__/EventsLinesPaginationQuery.graphql';
import { EventsLines_data$data } from '@components/entities/__generated__/EventsLines_data.graphql';
import EventCreation from './events/EventCreation';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import { useBuildEntityTypeBasedFilterContext, emptyFilterGroup } from '../../../utils/filters/filtersUtils';
import { useFormatter } from '../../../components/i18n';
import Breadcrumbs from '../../../components/Breadcrumbs';
import DataTable from '../../../components/dataGrid/DataTable';
import { UsePreloadedPaginationFragment } from '../../../utils/hooks/usePreloadedPaginationFragment';

const LOCAL_STORAGE_KEY = 'events';

const eventLineFragment = graphql`
  fragment EventsLine_node on Event {
    id
    name
    entity_type
    event_types
    created
    modified
    start_time
    stop_time
    objectMarking {
      id
      definition_type
      definition
      x_opencti_order
      x_opencti_color
    }
  }
`;

const eventsLinesQuery = graphql`
  query EventsLinesPaginationQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: EventsOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
  ) {
    ...EventsLines_data
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

const eventsLinesFragment = graphql`
  fragment EventsLines_data on Query
  @argumentDefinitions(
    search: { type: "String" }
    count: { type: "Int", defaultValue: 25 }
    cursor: { type: "ID" }
    orderBy: { type: "EventsOrdering", defaultValue: name }
    orderMode: { type: "OrderingMode", defaultValue: asc }
    filters: { type: "FilterGroup" }
  )
  @refetchable(queryName: "EventsLinesRefetchQuery") {
    events(
      search: $search
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    ) @connection(key: "Pagination_events") {
      edges {
        node {
          id
          name
          description
          ...EventsLine_node
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

const Events = () => {
  const { t_i18n } = useFormatter();

  const initialValues = {
    searchTerm: '',
    sortBy: 'name',
    orderAsc: true,
    openExports: false,
    filters: emptyFilterGroup,
  };
  const { viewStorage: { filters }, helpers: storageHelpers, paginationOptions } = usePaginationLocalStorage<EventsLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    initialValues,
  );

  const contextFilters = useBuildEntityTypeBasedFilterContext('Event', filters);
  const queryPaginationOptions = {
    ...paginationOptions,
    filters: contextFilters,
  } as unknown as EventsLinesPaginationQuery$variables;

  const dataColumns = {
    name: { flexSize: 35 },
    event_types: {
      label: 'Types',
      flexSize: 20,
      isSortable: true,
    },
    start_time: {},
    stop_time: {},
    created: {},
  };
  const queryRef = useQueryLoading<EventsLinesPaginationQuery>(
    eventsLinesQuery,
    queryPaginationOptions,
  );

  const preloadedPaginationOptions = {
    linesQuery: eventsLinesQuery,
    linesFragment: eventsLinesFragment,
    queryRef,
    nodePath: ['events', 'pageInfo', 'globalCount'],
    setNumberOfElements: storageHelpers.handleSetNumberOfElements,
  } as UsePreloadedPaginationFragment<EventsLinesPaginationQuery>;

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t_i18n('Entities') }, { label: t_i18n('Events'), current: true }]} />
      {queryRef && (
        <DataTable
          dataColumns={dataColumns}
          resolvePath={(data: EventsLines_data$data) => data.events?.edges?.map((n) => n?.node)}
          storageKey={LOCAL_STORAGE_KEY}
          initialValues={initialValues}
          toolbarFilters={contextFilters}
          preloadedPaginationProps={preloadedPaginationOptions}
          lineFragment={eventLineFragment}
          filterExportContext={{ entity_type: 'Event' }}
        />
      )}
      <Security needs={[KNOWLEDGE_KNUPDATE]}>
        <EventCreation paginationOptions={queryPaginationOptions} />
      </Security>
    </>
  );
};

export default Events;
