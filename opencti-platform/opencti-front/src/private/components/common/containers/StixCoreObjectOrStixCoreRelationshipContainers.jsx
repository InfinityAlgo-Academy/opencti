import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { QueryRenderer } from '../../../../relay/environment';
import ListLines from '../../../../components/list_lines/ListLines';
import StixCoreObjectOrStixCoreRelationshipContainersLines, {
  stixCoreObjectOrStixCoreRelationshipContainersLinesQuery,
} from './StixCoreObjectOrStixCoreRelationshipContainersLines';
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
import { initialFilterGroup, isFilterGroupNotEmpty } from '../../../../utils/filters/filtersUtils';

const useStyles = makeStyles(() => ({
  container: {
    paddingBottom: 70,
  },
  containerGraph: {
    paddingBottom: 0,
  },
  parameters: {
    marginTop: -10,
  },
}));
const StixCoreObjectOrStixCoreRelationshipContainers = ({
  stixDomainObjectOrStixCoreRelationship,
  authorId,
  onChangeOpenExports,
  reportType,
}) => {
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
  const additionalFilters = [];
  const reportFilterClass = reportType !== 'all' && reportType !== undefined
    ? reportType.replace(/_/g, ' ')
    : '';
  if (reportFilterClass) {
    additionalFilters.push({
      key: 'report_types',
      values: [reportFilterClass],
      operator: 'eq',
      mode: 'or',
    });
  }
  if (authorId) {
    additionalFilters.push({
      key: 'createdBy',
      values: [authorId],
      operator: 'eq',
      mode: 'or',
    });
  }
  if (
    stixDomainObjectOrStixCoreRelationship
    && stixDomainObjectOrStixCoreRelationship.id
  ) {
    additionalFilters.push({
      key: 'objects',
      values: [stixDomainObjectOrStixCoreRelationship.id],
      operator: 'eq',
      mode: 'or',
    });
  }
  const { viewStorage, paginationOptions, helpers } = usePaginationLocalStorage(
    LOCAL_STORAGE_KEY,
    {
      filters: initialFilterGroup,
      searchTerm: '',
      sortBy: 'created',
      orderAsc: false,
      openExports: false,
      view: 'lines',
      redirectionMode: 'overview',
    },
    additionalFilters,
  );
  const {
    numberOfElements,
    filters,
    searchTerm,
    sortBy,
    orderAsc,
    redirectionMode,
    view,
    openExports,
  } = viewStorage;
  const dataColumns = {
    entity_type: {
      label: 'Type',
      width: '8%',
      isSortable: true,
    },
    name: {
      label: 'Title',
      width: '25%',
      isSortable: true,
    },
    createdBy: {
      label: 'Author',
      width: '12%',
      isSortable: isRuntimeSort,
    },
    creator: {
      label: 'Creators',
      width: '12%',
      isSortable: isRuntimeSort,
    },
    objectLabel: {
      label: 'Labels',
      width: '15%',
      isSortable: false,
    },
    created: {
      label: 'Date',
      width: '10%',
      isSortable: true,
    },
    x_opencti_workflow_id: {
      label: 'Status',
      width: '8%',
      isSortable: true,
    },
    objectMarking: {
      label: 'Marking',
      width: '8%',
      isSortable: isRuntimeSort,
    },
  };

  const defaultHandleAddFilter = (
    inputKey,
    id,
    op = 'eq',
    event = undefined,
  ) => {
    const key = inputKey === 'container_type' ? 'entity_type' : inputKey;
    helpers.handleAddFilter(key, id, op, event);
  };

  const renderLines = () => {
    let exportContext = null;
    if (stixDomainObjectOrStixCoreRelationship) {
      exportContext = `of-entity-${stixDomainObjectOrStixCoreRelationship.id}`;
    } else if (authorId) {
      exportContext = `of-entity-${authorId}`;
    }
    return (
      <ListLines
        sortBy={sortBy}
        orderAsc={orderAsc}
        dataColumns={dataColumns}
        handleSort={helpers.handleSort}
        handleSearch={helpers.handleSearch}
        handleAddFilter={defaultHandleAddFilter}
        handleRemoveFilter={helpers.handleRemoveFilter}
        handleSwitchGlobalMode={helpers.handleSwitchGlobalMode}
        handleSwitchLocalMode={helpers.handleSwitchLocalMode}
        handleToggleExports={helpers.handleToggleExports}
        handleChangeView={helpers.handleChangeView}
        openExports={openExports}
        noPadding={typeof onChangeOpenExports === 'function'}
        exportEntityType="Container"
        exportContext={exportContext}
        keyword={searchTerm}
        handleSwitchRedirectionMode={(value) => helpers.handleAddProperty('redirectionMode', value)
        }
        redirectionMode={redirectionMode}
        filters={filters}
        paginationOptions={paginationOptions}
        numberOfElements={numberOfElements}
        disableCards={true}
        enableGraph={true}
        availableFilterKeys={[
          'report_types',
          'container_type',
          'confidence',
          'x_opencti_workflow_id',
          'objectLabel',
          'createdBy',
          'objectMarking',
          'created',
          'entity_type',
        ]}
      >
        <QueryRenderer
          query={stixCoreObjectOrStixCoreRelationshipContainersLinesQuery}
          variables={paginationOptions}
          render={({ props }) => (
            <StixCoreObjectOrStixCoreRelationshipContainersLines
              data={props}
              paginationOptions={paginationOptions}
              dataColumns={dataColumns}
              initialLoading={props === null}
              onLabelClick={defaultHandleAddFilter}
              setNumberOfElements={helpers.handleSetNumberOfElements}
              redirectionMode={redirectionMode}
            />
          )}
        />
      </ListLines>
    );
  };

  const renderGraph = () => {
    const availableFilterKeys = [
      'objectLabel',
      'createdBy',
      'objectMarking',
      'created',
      'container_type',
      'report_types',
    ];
    return (
      <>
        <div className={classes.parameters}>
          <div style={{ float: 'left', marginRight: 20 }}>
            <SearchInput
              variant="small"
              onSubmit={helpers.handleSearch}
              keyword={searchTerm}
            />
          </div>
          <Filters
            availableFilterKeys={availableFilterKeys}
            handleAddFilter={defaultHandleAddFilter}
          />
          {isFilterGroupNotEmpty(filters) && (
            <FilterIconButton
              filters={filters}
              handleRemoveFilter={helpers.handleRemoveFilter}
              className={5}
              redirection
            />
          )}
          <div className="clearfix" />
        </div>
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
            filters: paginationOptions.filters,
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
