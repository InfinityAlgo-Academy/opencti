import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import ListLines from '../../../components/list_lines/ListLines';
import IndicatorsLines, {
  indicatorsLinesQuery,
} from './indicators/IndicatorsLines';
import IndicatorCreation from './indicators/IndicatorCreation';
import IndicatorsRightBar from './indicators/IndicatorsRightBar';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import { UserContext } from '../../../utils/hooks/useAuth';
import ToolBar from '../data/ToolBar';
import ExportContextProvider from '../../../utils/ExportContextProvider';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import useEntityToggle from '../../../utils/hooks/useEntityToggle';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import { IndicatorLine_node$data } from './indicators/__generated__/IndicatorLine_node.graphql';
import {
  IndicatorsLinesPaginationQuery,
  IndicatorsLinesPaginationQuery$variables,
} from './indicators/__generated__/IndicatorsLinesPaginationQuery.graphql';
import { ModuleHelper } from '../../../utils/platformModulesHelper';
import { IndicatorLineDummyComponent } from './indicators/IndicatorLine';
import { filtersWithEntityType, findFilterFromKey, initialFilterGroup } from '../../../utils/filters/filtersUtils';

const useStyles = makeStyles(() => ({
  container: {
    paddingRight: 250,
  },
}));

const LOCAL_STORAGE_KEY = 'indicators';

const Indicators = () => {
  const classes = useStyles();

  const {
    viewStorage,
    paginationOptions,
    helpers: storageHelpers,
  } = usePaginationLocalStorage<IndicatorsLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    {
      numberOfElements: { number: 0, symbol: '', original: 0 },
      filters: initialFilterGroup,
      searchTerm: '',
      sortBy: 'created',
      orderAsc: false,
      openExports: false,
      count: 25,
    },
  );
  const {
    numberOfElements,
    filters,
    searchTerm,
    sortBy,
    orderAsc,
    openExports,
  } = viewStorage;

  const {
    selectedElements,
    deSelectedElements,
    selectAll,
    handleClearSelectedElements,
    handleToggleSelectAll,
    onToggleEntity,
  } = useEntityToggle<IndicatorLine_node$data>(LOCAL_STORAGE_KEY);
  const queryRef = useQueryLoading<IndicatorsLinesPaginationQuery>(
    indicatorsLinesQuery,
    paginationOptions,
  );
  const patternTypes = findFilterFromKey(filters?.filters ?? [], 'pattern_type')?.values ?? [];
  const observableTypes = findFilterFromKey(filters?.filters ?? [], 'x_opencti_main_observable_type')?.values ?? [];
  const handleToggleIndicatorType = (type: string) => {
    if (patternTypes.includes(type)) {
      storageHelpers.handleRemoveFilter('pattern_type', 'eq', type);
    } else {
      storageHelpers.handleAddFilter('pattern_type', type);
    }
  };
  const handleToggleObservableType = (type: string) => {
    if (observableTypes.includes(type)) {
      storageHelpers.handleRemoveFilter('x_opencti_main_observable_type', 'eq', type);
    } else {
      storageHelpers.handleAddFilter(
        'x_opencti_main_observable_type',
        type,
      );
    }
  };
  const handleClearObservableTypes = () => {
    storageHelpers.handleRemoveFilter('x_opencti_main_observable_type');
  };
  const renderLines = (platformModuleHelpers: ModuleHelper | undefined) => {
    let numberOfSelectedElements = Object.keys(selectedElements || {}).length;
    if (selectAll) {
      numberOfSelectedElements = (numberOfElements?.original ?? 0)
        - Object.keys(deSelectedElements || {}).length;
    }
    const toolBarFilters = filtersWithEntityType(filters, 'Indicator');
    const isRuntimeSort = platformModuleHelpers?.isRuntimeFieldEnable();
    const dataColumns = {
      pattern_type: {
        label: 'Pattern type',
        width: '8%',
        isSortable: true,
      },
      name: {
        label: 'Name',
        width: '22%',
        isSortable: true,
      },
      createdBy: {
        label: 'Author',
        width: '12%',
        isSortable: isRuntimeSort ?? false,
      },
      creator: {
        label: 'Creators',
        width: '12%',
        isSortable: isRuntimeSort ?? false,
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
      valid_until: {
        label: 'Valid until',
        width: '10%',
        isSortable: true,
      },
      objectMarking: {
        label: 'Marking',
        width: '10%',
        isSortable: isRuntimeSort ?? false,
      },
    };
    return (
      <>
        <ListLines
          sortBy={sortBy}
          orderAsc={orderAsc}
          dataColumns={dataColumns}
          handleSort={storageHelpers.handleSort}
          handleSearch={storageHelpers.handleSearch}
          handleAddFilter={storageHelpers.handleAddFilter}
          handleRemoveFilter={storageHelpers.handleRemoveFilter}
          handleSwitchGlobalMode={storageHelpers.handleSwitchGlobalMode}
          handleSwitchLocalMode={storageHelpers.handleSwitchLocalMode}
          handleToggleExports={storageHelpers.handleToggleExports}
          openExports={openExports}
          handleToggleSelectAll={handleToggleSelectAll}
          selectAll={selectAll}
          exportEntityType="Indicator"
          exportContext={null}
          iconExtension={true}
          keyword={searchTerm}
          filters={filters}
          paginationOptions={paginationOptions}
          numberOfElements={numberOfElements}
          availableFilterKeys={[
            'objectLabel',
            'objectMarking',
            'created',
            'created_at',
            'valid_from',
            'x_opencti_score',
            'createdBy',
            'indicates',
            'sightedBy',
            'x_opencti_detection',
            'basedOn',
            'revoked',
            'creator_id',
            'confidence',
            'indicator_types',
          ]}
        >
          {queryRef && (
            <React.Suspense
              fallback={
                <>
                  {Array(20)
                    .fill(0)
                    .map((_, idx) => (
                      <IndicatorLineDummyComponent
                        key={idx}
                        dataColumns={dataColumns}
                      />
                    ))}
                </>
              }
            >
              <IndicatorsLines
                queryRef={queryRef}
                paginationOptions={paginationOptions}
                dataColumns={dataColumns}
                onLabelClick={storageHelpers.handleAddFilter}
                selectedElements={selectedElements}
                deSelectedElements={deSelectedElements}
                onToggleEntity={onToggleEntity}
                selectAll={selectAll}
                setNumberOfElements={storageHelpers.handleSetNumberOfElements}
              />
            </React.Suspense>
          )}
        </ListLines>
        <ToolBar
          selectedElements={selectedElements}
          deSelectedElements={deSelectedElements}
          numberOfSelectedElements={numberOfSelectedElements}
          selectAll={selectAll}
          filters={toolBarFilters}
          search={searchTerm}
          handleClearSelectedElements={handleClearSelectedElements}
          variant="large"
          type="Indicator"
        />
      </>
    );
  };
  return (
    <UserContext.Consumer>
      {({ platformModuleHelpers }) => (
        <ExportContextProvider>
          <div className={classes.container}>
            {renderLines(platformModuleHelpers)}
            <Security needs={[KNOWLEDGE_KNUPDATE]}>
              <IndicatorCreation paginationOptions={paginationOptions} />
            </Security>
            <IndicatorsRightBar
              indicatorTypes={patternTypes}
              observableTypes={observableTypes}
              handleToggleIndicatorType={handleToggleIndicatorType}
              handleToggleObservableType={handleToggleObservableType}
              handleClearObservableTypes={handleClearObservableTypes}
              openExports={openExports}
            />
          </div>
        </ExportContextProvider>
      )}
    </UserContext.Consumer>
  );
};

export default Indicators;
