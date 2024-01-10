import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Box from '@mui/material/Box';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Tooltip from '@mui/material/Tooltip';
import { FileDownloadOutlined, ViewListOutlined } from '@mui/icons-material';
import { VectorPolygon } from 'mdi-material-ui';
import { graphql } from 'react-relay';
import { QueryRenderer } from '../../../../relay/environment';
import StixCoreObjectOrStixCoreRelationshipContainersGraph, {
  stixCoreObjectOrStixCoreRelationshipContainersGraphQuery,
} from './StixCoreObjectOrStixCoreRelationshipContainersGraph';
import Loader from '../../../../components/Loader';
import StixCoreObjectOrStixCoreRelationshipContainersGraphBar from './StixCoreObjectOrStixCoreRelationshipContainersGraphBar';
import SearchInput from '../../../../components/SearchInput';
import useAuth from '../../../../utils/hooks/useAuth';
import Filters from '../lists/Filters';
import FilterIconButton from '../../../../components/FilterIconButton';
import { usePaginationLocalStorage } from '../../../../utils/hooks/useLocalStorage';
import { emptyFilterGroup, isFilterGroupNotEmpty, useRemoveIdAndIncorrectKeysFromFilterGroupObject } from '../../../../utils/filters/filtersUtils';
import { useFormatter } from '../../../../components/i18n';
import DataTable from '../../../../components/dataGrid/DataTable';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles(() => ({
  container: {
    paddingBottom: 70,
  },
  containerGraph: {
    paddingBottom: 0,
  },
}));

const stixCoreObjectOrStixCoreRelationshipContainersLineFragment = graphql`
  fragment StixCoreObjectOrStixCoreRelationshipContainers_node on Container {
    id
    workflowEnabled
    entity_type
    status {
      id
      order
      template {
        name
        color
      }
    }
    creators {
      id
      name
    }
    ... on Note {
      attribute_abstract
      content
      created
    }
    ... on Opinion {
      opinion
      created
    }
    ... on ObservedData {
      name
      first_observed
      last_observed
    }
    ... on Report {
      name
      published
    }
    ... on Grouping {
      name
      created
    }
    ... on Case {
      name
      created
    }
    ... on Task {
      name
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
    objectLabel {
      id
      value
      color
    }
    ... on ObservedData {
      name
      objects(first: 1) {
        edges {
          node {
            ... on StixCoreObject {
              id
              entity_type
              parent_types
              created_at
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
            }
            ... on AttackPattern {
              name
              description
              x_mitre_id
            }
            ... on Campaign {
              name
              description
              first_seen
              last_seen
            }
            ... on Note {
              attribute_abstract
            }
            ... on ObservedData {
              name
              first_observed
              last_observed
            }
            ... on Opinion {
              opinion
            }
            ... on Report {
              name
              description
              published
            }
            ... on CourseOfAction {
              name
              description
            }
            ... on Individual {
              name
              description
            }
            ... on Organization {
              name
              description
            }
            ... on Sector {
              name
              description
            }
            ... on System {
              name
              description
            }
            ... on Indicator {
              name
              description
              valid_from
            }
            ... on Infrastructure {
              name
              description
            }
            ... on IntrusionSet {
              name
              description
              first_seen
              last_seen
            }
            ... on Position {
              name
              description
            }
            ... on City {
              name
              description
            }
            ... on AdministrativeArea {
              name
              description
            }
            ... on Country {
              name
              description
            }
            ... on Region {
              name
              description
            }
            ... on Malware {
              name
              description
              first_seen
              last_seen
            }
            ... on ThreatActor {
              name
              description
              first_seen
              last_seen
            }
            ... on Tool {
              name
              description
            }
            ... on Vulnerability {
              name
              description
            }
            ... on Incident {
              name
              description
              first_seen
              last_seen
            }
            ... on Event {
              name
              description
              start_time
              stop_time
            }
            ... on Channel {
              name
              description
            }
            ... on Narrative {
              name
              description
            }
            ... on Language {
              name
            }
            ... on DataComponent {
              name
            }
            ... on DataSource {
              name
            }
            ... on Case {
              name
            }
            ... on StixCyberObservable {
              observable_value
              x_opencti_description
            }
          }
        }
      }
    }
  }
`;

const stixCoreObjectOrStixCoreRelationshipContainersQuery = graphql`
  query StixCoreObjectOrStixCoreRelationshipContainersQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: ContainersOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
  ) {
    ...StixCoreObjectOrStixCoreRelationshipContainers_data
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

const stixCoreObjectOrStixCoreRelationshipContainersLinesFragment = graphql`
  fragment StixCoreObjectOrStixCoreRelationshipContainers_data on Query
  @argumentDefinitions(
    search: { type: "String" }
    count: { type: "Int", defaultValue: 25 }
    cursor: { type: "ID" }
    orderBy: { type: "ContainersOrdering", defaultValue: created }
    orderMode: { type: "OrderingMode", defaultValue: asc }
    filters: { type: "FilterGroup" }
  ) @refetchable(queryName: "StixCoreObjectOrStixCoreRelationshipContainersRefetchQuery") {
    containers(
      search: $search
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    ) @connection(key: "Pagination_containers") {
      edges {
        node {
          id
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
          ...StixCoreObjectOrStixCoreRelationshipContainers_node
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

const StixCoreObjectOrStixCoreRelationshipContainers = ({
  stixDomainObjectOrStixCoreRelationship,
  authorId,
  reportType,
}) => {
  const { t_i18n } = useFormatter();
  const classes = useStyles();
  const {
    platformModuleHelpers: { isRuntimeFieldEnable },
  } = useAuth();
  const isRuntimeSort = isRuntimeFieldEnable() ?? false;
  const LOCAL_STORAGE_KEY = `containers${
    stixDomainObjectOrStixCoreRelationship
      ? `-${stixDomainObjectOrStixCoreRelationship.id}`
      : `-${authorId}`
  }`;

  const initialValues = {
    filters: emptyFilterGroup,
    searchTerm: '',
    sortBy: 'created',
    orderAsc: false,
    openExports: false,
    view: 'lines',
    redirectionMode: 'overview',
  };
  const { viewStorage, paginationOptions, helpers } = usePaginationLocalStorage(
    LOCAL_STORAGE_KEY,
    initialValues,
  );

  const {
    numberOfElements,
    filters,
    searchTerm,
    view,
  } = viewStorage;

  const reportFilterClass = reportType !== 'all' && reportType !== undefined ? reportType.replace(/_/g, ' ') : '';
  const userFilters = useRemoveIdAndIncorrectKeysFromFilterGroupObject(filters, ['Container']);
  const contextFilters = {
    mode: 'and',
    filters: [
      { key: 'entity_type', operator: 'eq', mode: 'or', values: ['Container'] },
      ...(reportFilterClass ? [{ key: 'report_types', values: [reportFilterClass], operator: 'eq', mode: 'or' }] : []),
      ...(authorId ? [{ key: 'createdBy', values: [authorId], operator: 'eq', mode: 'or' }] : []),
      ...(stixDomainObjectOrStixCoreRelationship?.id ? [{ key: 'objects', values: [stixDomainObjectOrStixCoreRelationship.id], operator: 'eq', mode: 'or' }] : []),
    ],
    filterGroups: userFilters && isFilterGroupNotEmpty(userFilters) ? [userFilters] : [],
  };
  const queryPaginationOptions = { ...paginationOptions, filters: contextFilters };

  const dataColumns = {
    entity_type: { flexSize: 10 },
    name: { label: 'Name' },
    createdBy: { isSortable: isRuntimeSort },
    creator: { isSortable: isRuntimeSort },
    objectLabel: {},
    created: { flexSize: 10 },
    x_opencti_workflow_id: {},
    objectMarking: { isSortable: isRuntimeSort },
  };

  const queryRef = useQueryLoading(
    stixCoreObjectOrStixCoreRelationshipContainersQuery,
    queryPaginationOptions,
  );

  const preloadedPaginationProps = {
    linesQuery: stixCoreObjectOrStixCoreRelationshipContainersQuery,
    linesFragment: stixCoreObjectOrStixCoreRelationshipContainersLinesFragment,
    queryRef,
    nodePath: ['containers', 'pageInfo', 'globalCount'],
    setNumberOfElements: helpers.handleSetNumberOfElements,
  };

  const renderLines = () => {
    return (
      <>
        {queryRef && (
          <DataTable
            dataColumns={dataColumns}
            resolvePath={(data) => data.containers?.edges?.map((n) => n?.node)}
            storageKey={LOCAL_STORAGE_KEY}
            initialValues={initialValues}
            toolbarFilters={contextFilters}
            preloadedPaginationProps={preloadedPaginationProps}
            lineFragment={stixCoreObjectOrStixCoreRelationshipContainersLineFragment}
            filterExportContext={{ entity_type: 'Container' }}
            redirectionModeEnabled
            currentView={view}
            additionalHeaderButtons={(
              <>
                <ToggleButton value="lines" aria-label="lines">
                  <Tooltip title={t_i18n('Lines view')}>
                    <ViewListOutlined
                      fontSize="small"
                      color={
                        view === 'lines' || !view
                          ? 'secondary'
                          : 'primary'
                      }
                    />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="graph" aria-label="graph">
                  <Tooltip title={t_i18n('Graph view')}>
                    <VectorPolygon fontSize="small" color="primary" />
                  </Tooltip>
                </ToggleButton>
              </>
            )}
          />
        )}
      </>
    );
  };

  const renderGraph = () => {
    const availableFilterKeys = [
      'objectLabel',
      'createdBy',
      'objectMarking',
      'created',
      'entity_type',
      'report_types',
    ];
    return (
      <>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '-10px',
          paddingBottom: '10px',
        }}
        >
          <Box sx={{
            gap: '10px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
          >
            <SearchInput
              variant="small"
              onSubmit={helpers.handleSearch}
              keyword={searchTerm}
            />
            <Filters
              helpers={helpers}
              availableFilterKeys={availableFilterKeys}
              handleAddFilter={helpers.handleAddFilter}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {numberOfElements && (
              <div>
                <strong>{`${numberOfElements.number}${numberOfElements.symbol}`}</strong>{' '}
                {t_i18n('entitie(s)')}
              </div>
            )}
            <ToggleButtonGroup
              size="small"
              color="secondary"
              value="graph"
              exclusive={true}
              onChange={(_, value) => {
                if (value && value === 'export') {
                  helpers.handleToggleExports();
                } else if (value) {
                  helpers.handleChangeView(value);
                }
              }}
            >
              <ToggleButton value="lines" aria-label="lines">
                <Tooltip title={t_i18n('Lines view')}>
                  <ViewListOutlined fontSize="small" color="primary" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="graph" aria-label="graph">
                <Tooltip title={t_i18n('Graph view')}>
                  <VectorPolygon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton
                value="export"
                aria-label="export"
                disabled={true}
              >
                <Tooltip title={t_i18n('Open export panel')}>
                  <FileDownloadOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

        </Box>
        <FilterIconButton
          helpers={helpers}
          filters={filters}
          handleRemoveFilter={helpers.handleRemoveFilter}
          handleSwitchLocalMode={helpers.handleSwitchLocalMode}
          handleSwitchGlobalMode={helpers.handleSwitchGlobalMode}
          className={5}
          redirection
        />
        <QueryRenderer
          query={stixCoreObjectOrStixCoreRelationshipContainersGraphQuery}
          variables={{
            id: stixDomainObjectOrStixCoreRelationship.id,
            types: [
              'Threat-Actor',
              'Intrusion-Set',
              'Campaign',
              'Incident',
              'Malware',
              'Tool',
              'Vulnerability',
              'Attack-Pattern',
              'Sector',
              'Organization',
              'Individual',
              'Region',
              'Country',
              'City',
              'uses',
              'targets',
              'attributed-to',
              'located-at',
              'part-of',
              'employed-by',
              'resides-in',
              'citizen-of',
              'national-of',
              'belongs-to',
              'related-to',
            ],
            filters: queryPaginationOptions.filters,
            search: searchTerm,
          }}
          render={({ props }) => {
            if (props) {
              return (
                <StixCoreObjectOrStixCoreRelationshipContainersGraph
                  stixDomainObjectOrStixCoreRelationship={
                    stixDomainObjectOrStixCoreRelationship
                  }
                  data={props}
                  handleChangeView={helpers.handleChangeView}
                />
              );
            }
            return (
              <>
                <StixCoreObjectOrStixCoreRelationshipContainersGraphBar
                  disabled={true}
                  navOpen={localStorage.getItem('navOpen') === 'true'}
                />
                <Loader />
              </>
            );
          }}
        />
      </>
    );
  };

  return (
    <div
      className={view === 'lines' ? classes.container : classes.containerGraph}
    >
      {view === 'lines' ? renderLines() : ''}
      {view === 'graph' ? renderGraph() : ''}
    </div>
  );
};

export default StixCoreObjectOrStixCoreRelationshipContainers;
