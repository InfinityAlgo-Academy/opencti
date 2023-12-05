import React, { FunctionComponent } from 'react';
import ListLines from '../../../components/list_lines/ListLines';
import ReportsLines, { reportsLinesQuery } from './reports/ReportsLines';
import ReportCreation from './reports/ReportCreation';
import ToolBar from '../data/ToolBar';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import useAuth from '../../../utils/hooks/useAuth';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import {
  ReportsLinesPaginationQuery,
  ReportsLinesPaginationQuery$variables,
} from './reports/__generated__/ReportsLinesPaginationQuery.graphql';
import { ReportLine_node$data } from './reports/__generated__/ReportLine_node.graphql';
import useEntityToggle from '../../../utils/hooks/useEntityToggle';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import { ReportLineDummy } from './reports/ReportLine';
import ExportContextProvider from '../../../utils/ExportContextProvider';
import { filtersWithEntityType, emptyFilterGroup } from '../../../utils/filters/filtersUtils';

const LOCAL_STORAGE_KEY = 'reports';

interface ReportsProps {
  objectId: string;
  authorId: string;
  onChangeOpenExports: () => void;
}

const Reports: FunctionComponent<ReportsProps> = ({
  objectId,
  authorId,
  onChangeOpenExports,
}) => {
  const {
    platformModuleHelpers: { isRuntimeFieldEnable },
  } = useAuth();
  const additionnalFilters = [];
  if (authorId) {
    additionnalFilters.push({
      key: 'createdBy',
      values: [authorId],
      operator: 'eq',
      mode: 'or',
    });
  }
  if (objectId) {
    additionnalFilters.push({
      key: 'objects',
      values: [objectId],
      operator: 'eq',
      mode: 'or',
    });
  }
  const {
    viewStorage,
    paginationOptions,
    helpers: storageHelpers,
  } = usePaginationLocalStorage<ReportsLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    {
      filters: emptyFilterGroup,
      searchTerm: '',
      sortBy: 'published',
      orderAsc: false,
      openExports: false,
      redirectionMode: 'overview',
    },
    additionnalFilters,
  );
  const {
    numberOfElements,
    filters,
    searchTerm,
    sortBy,
    orderAsc,
    openExports,
    redirectionMode,
  } = viewStorage;
  const {
    selectedElements,
    deSelectedElements,
    selectAll,
    handleClearSelectedElements,
    handleToggleSelectAll,
    onToggleEntity,
    numberOfSelectedElements,
  } = useEntityToggle<ReportLine_node$data>(LOCAL_STORAGE_KEY);
  const queryRef = useQueryLoading<ReportsLinesPaginationQuery>(
    reportsLinesQuery,
    paginationOptions,
  );
  const renderLines = () => {
    let exportContext = null;
    if (objectId) {
      exportContext = `of-entity-${objectId}`;
    } else if (authorId) {
      exportContext = `of-entity-${authorId}`;
    }
    const toolBarFilters = filtersWithEntityType(filters, 'Report');
    const isRuntimeSort = isRuntimeFieldEnable() ?? false;
    const dataColumns = {
      name: {
        label: 'Title',
        width: '25%',
        isSortable: true,
      },
      report_types: {
        label: 'Type',
        width: '8%',
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
      published: {
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
        isSortable: isRuntimeSort,
        width: '8%',
      },
    };
    return (
      <>
        <ListLines
          helpers={storageHelpers}
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
          noPadding={typeof onChangeOpenExports === 'function'}
          exportEntityType="Report"
          exportContext={exportContext}
          keyword={searchTerm}
          redirectionMode={redirectionMode}
          handleSwitchRedirectionMode={(value: string) => storageHelpers.handleAddProperty('redirectionMode', value)
          }
          filters={filters}
          paginationOptions={paginationOptions}
          numberOfElements={numberOfElements}
          iconExtension={true}
          availableFilterKeys={[
            'x_opencti_workflow_id',
            'objectLabel',
            'objectMarking',
            'createdBy',
            'x_opencti_reliability',
            'confidence',
            'objectAssignee',
            'objectParticipant',
            'report_types',
            'creator_id',
            'published',
            'created_at',
            'objects',
            'name',
          ]}
        >
          {queryRef && (
            <React.Suspense
              fallback={
                <>
                  {Array(20)
                    .fill(0)
                    .map((_, idx) => (
                      <ReportLineDummy key={idx} dataColumns={dataColumns} />
                    ))}
                </>
              }
            >
              <ReportsLines
                queryRef={queryRef}
                paginationOptions={paginationOptions}
                dataColumns={dataColumns}
                onLabelClick={storageHelpers.handleAddFilter}
                selectedElements={selectedElements}
                deSelectedElements={deSelectedElements}
                onToggleEntity={onToggleEntity}
                selectAll={selectAll}
                setNumberOfElements={storageHelpers.handleSetNumberOfElements}
                redirectionMode={redirectionMode}
              />
              <ToolBar
                selectedElements={selectedElements}
                deSelectedElements={deSelectedElements}
                numberOfSelectedElements={numberOfSelectedElements}
                selectAll={selectAll}
                search={searchTerm}
                filters={toolBarFilters}
                handleClearSelectedElements={handleClearSelectedElements}
                type="Report"
              />
            </React.Suspense>
          )}
        </ListLines>
      </>
    );
  };
  return (
    <ExportContextProvider>
      {renderLines()}
      <Security needs={[KNOWLEDGE_KNUPDATE]}>
        <ReportCreation paginationOptions={paginationOptions} />
      </Security>
    </ExportContextProvider>
  );
};

export default Reports;
