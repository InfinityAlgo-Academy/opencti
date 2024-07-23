import React, { FunctionComponent } from 'react';
import { NarrativeLine_node$data } from '@components/techniques/narratives/__generated__/NarrativeLine_node.graphql';
import ToolBar from '@components/data/ToolBar';
import makeStyles from '@mui/styles/makeStyles';
import { NarrativeWithSubnarrativeLineDummy } from '@components/techniques/narratives/NarrativeWithSubnarrativeLine';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ExportContextProvider from '../../../utils/ExportContextProvider';
import { NarrativeLineDummy } from './narratives/NarrativeLine';
import NarrativesLines, { narrativesLinesQuery } from './narratives/NarrativesLines';
import NarrativesWithSubnarrativesLines from './narratives/NarrativesWithSubnarrativesLines';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import ListLines from '../../../components/list_lines/ListLines';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNPARTICIPATE, KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import NarrativeCreation from './narratives/NarrativeCreation';
import { emptyFilterGroup, useBuildEntityTypeBasedFilterContext, useGetDefaultFilterObject } from '../../../utils/filters/filtersUtils';
import { useFormatter } from '../../../components/i18n';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { NarrativesLinesPaginationQuery, NarrativesLinesPaginationQuery$variables } from './narratives/__generated__/NarrativesLinesPaginationQuery.graphql';
import useEntityToggle from '../../../utils/hooks/useEntityToggle';
import useHelper from '../../../utils/hooks/useHelper';
import SearchInput from '../../../components/SearchInput';
import ViewSwitchingButtons from '../../../components/ViewSwitchingButtons';

const LOCAL_STORAGE_KEY = 'narratives';

const useStyles = makeStyles(() => ({
  parameters: {
    float: 'left',
    marginTop: -10,
  },
  views: {
    marginTop: -5,
    position: 'absolute',
    right: 60,
  },
}));

const Narratives: FunctionComponent = () => {
  const { t_i18n } = useFormatter();
  const classes = useStyles();
  const { isFeatureEnable } = useHelper();
  const FAB_REPLACED = isFeatureEnable('FAB_REPLACEMENT');
  const { viewStorage, helpers, paginationOptions } = usePaginationLocalStorage<NarrativesLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    {
      searchTerm: '',
      sortBy: 'name',
      orderAsc: true,
      openExports: false,
      filters: {
        ...emptyFilterGroup,
        filters: useGetDefaultFilterObject(['In regards of'], ['Narrative']),
      },
      view: 'lines',
    },
  );
  const {
    searchTerm,
    sortBy,
    orderAsc,
    filters,
    openExports,
    numberOfElements,
    view,
  } = viewStorage;

  const {
    onToggleEntity,
    numberOfSelectedElements,
    handleClearSelectedElements,
    selectedElements,
    deSelectedElements,
    selectAll,
    handleToggleSelectAll,
  } = useEntityToggle<NarrativeLine_node$data>(LOCAL_STORAGE_KEY);

  const contextFilters = useBuildEntityTypeBasedFilterContext('Narrative', filters);
  const queryPaginationOptions = {
    ...paginationOptions,
    filters: contextFilters,
  } as unknown as NarrativesLinesPaginationQuery$variables;

  const queryRef = useQueryLoading<NarrativesLinesPaginationQuery>(
    narrativesLinesQuery,
    queryPaginationOptions,
  );
  const renderSubEntityLines = () => {
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
          <div className={classes.views}>
            <ToggleButtonGroup
              size="small"
              color="secondary"
              value={view || 'lines'}
              exclusive={true}
              style={{ margin: '0 0 0 5px' }}
            >
              <ViewSwitchingButtons
                handleChangeView={helpers.handleChangeView}
                disableCards={true}
                currentView={view}
                enableSubEntityLines={true}
              />
            </ToggleButtonGroup>
          </div>
        </div>
        <div className="clearfix" />
        {queryRef && (
        <React.Suspense
          fallback={
            <>
              {Array(20)
                .fill(0)
                .map((_, idx) => (
                  <NarrativeWithSubnarrativeLineDummy key={idx}/>
                ))}
            </>
                    }
        >
          <NarrativesWithSubnarrativesLines
            queryRef={queryRef}
            paginationOptions={queryPaginationOptions}
            onToggleEntity={onToggleEntity}
            keyword={searchTerm || ''}
          />
        </React.Suspense>
        )}
      </>
    );
  };

  const renderLines = () => {
    const dataColumns = {
      name: {
        label: 'Name',
        width: '25%',
        isSortable: true,
      },
      description: {
        label: 'Description',
        width: '25%',
        isSortable: false,
      },
      objectLabel: {
        label: 'Labels',
        width: '20%',
        isSortable: false,
      },
      created: {
        label: 'Original creation date',
        width: '15%',
        isSortable: true,
      },
      modified: {
        label: 'Modification date',
        width: '15%',
        isSortable: true,
      },
    };
    return (
      <>
        <ListLines
          helpers={helpers}
          sortBy={sortBy}
          orderAsc={orderAsc}
          dataColumns={dataColumns}
          handleSort={helpers.handleSort}
          handleSearch={helpers.handleSearch}
          handleAddFilter={helpers.handleAddFilter}
          handleRemoveFilter={helpers.handleRemoveFilter}
          handleSwitchGlobalMode={helpers.handleSwitchGlobalMode}
          handleSwitchLocalMode={helpers.handleSwitchLocalMode}
          handleToggleExports={helpers.handleToggleExports}
          handleChangeView={helpers.handleChangeView}
          enableSubEntityLines={true}
          currentView={view}
          disableCards={true}
          openExports={openExports}
          handleToggleSelectAll={handleToggleSelectAll}
          selectAll={selectAll}
          exportContext={{ entity_type: 'Narrative' }}
          keyword={searchTerm}
          filters={filters}
          paginationOptions={queryPaginationOptions}
          numberOfElements={numberOfElements}
          iconExtension={true}
          createButton={FAB_REPLACED && <Security needs={[KNOWLEDGE_KNUPDATE, KNOWLEDGE_KNPARTICIPATE]}>
            <NarrativeCreation paginationOptions={queryPaginationOptions} />
            </Security>}
        >
          {queryRef && (
            <React.Suspense
              fallback={
                <>
                  {Array(20)
                    .fill(0)
                    .map((_, idx) => (
                      <NarrativeLineDummy key={idx} dataColumns={dataColumns} />
                    ))}
                </>
                  }
            >
              <NarrativesLines
                queryRef={queryRef}
                paginationOptions={queryPaginationOptions}
                dataColumns={dataColumns}
                onLabelClick={helpers.handleAddFilter}
                selectedElements={selectedElements}
                deSelectedElements={deSelectedElements}
                onToggleEntity={onToggleEntity}
                selectAll={selectAll}
                setNumberOfElements={helpers.handleSetNumberOfElements}
              />
            </React.Suspense>
          )}
        </ListLines>
        <ToolBar
          selectedElements={selectedElements}
          deSelectedElements={deSelectedElements}
          numberOfSelectedElements={numberOfSelectedElements}
          selectAll={selectAll}
          search={searchTerm}
          filters={contextFilters}
          handleClearSelectedElements={handleClearSelectedElements}
          type="Narrative"
        />
      </>
    );
  };
  return (
    <ExportContextProvider>
      <Breadcrumbs variant="list" elements={[{ label: t_i18n('Techniques') }, { label: t_i18n('Narratives'), current: true }]} />
      {view === 'lines' ? renderLines() : ''}
      {view === 'subEntityLines' ? renderSubEntityLines() : ''}
      {!FAB_REPLACED
          && <Security needs={[KNOWLEDGE_KNUPDATE, KNOWLEDGE_KNPARTICIPATE]}>
            <NarrativeCreation paginationOptions={queryPaginationOptions} />
          </Security>
      }
    </ExportContextProvider>
  );
};
export default Narratives;
