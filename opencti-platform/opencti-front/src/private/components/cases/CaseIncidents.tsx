import React, { FunctionComponent } from 'react';
import ListLines from '../../../components/list_lines/ListLines';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import CaseIncidentsLines, { caseIncidentsLinesQuery } from './case_incidents/CaseIncidentsLines';
import { CaseIncidentLineDummy } from './case_incidents/CaseIncidentLine';
import useAuth from '../../../utils/hooks/useAuth';
import useEntityToggle from '../../../utils/hooks/useEntityToggle';
import ToolBar from '../data/ToolBar';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import CaseIncidentCreation from './case_incidents/CaseIncidentCreation';
import ExportContextProvider from '../../../utils/ExportContextProvider';
import {
  CaseIncidentsLinesCasesPaginationQuery,
  CaseIncidentsLinesCasesPaginationQuery$variables,
} from './case_incidents/__generated__/CaseIncidentsLinesCasesPaginationQuery.graphql';
import { CaseIncidentLineCase_node$data } from './case_incidents/__generated__/CaseIncidentLineCase_node.graphql';
import { filtersWithEntityType, initialFilterGroup } from '../../../utils/filters/filtersUtils';

interface CaseIncidentsProps {
  inputValue?: string;
}

export const LOCAL_STORAGE_KEY_CASE_INCIDENT = 'caseIncidents';

const CaseIncidents: FunctionComponent<CaseIncidentsProps> = () => {
  const {
    platformModuleHelpers: { isRuntimeFieldEnable },
  } = useAuth();
  const { viewStorage, helpers, paginationOptions } = usePaginationLocalStorage<CaseIncidentsLinesCasesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY_CASE_INCIDENT,
    {
      numberOfElements: {
        number: 0,
        symbol: '',
      },
      searchTerm: '',
      sortBy: 'created',
      orderAsc: false,
      openExports: false,
      filters: initialFilterGroup,
    },
  );
  const {
    onToggleEntity,
    numberOfSelectedElements,
    handleClearSelectedElements,
    selectedElements,
    deSelectedElements,
    handleToggleSelectAll,
    selectAll,
  } = useEntityToggle<CaseIncidentLineCase_node$data>(
    LOCAL_STORAGE_KEY_CASE_INCIDENT,
  );
  const renderLines = () => {
    const {
      sortBy,
      orderAsc,
      searchTerm,
      filters,
      openExports,
      numberOfElements,
    } = viewStorage;
    const isRuntimeSort = isRuntimeFieldEnable() ?? false;
    const dataColumns = {
      name: {
        label: 'Name',
        width: '22%',
        isSortable: true,
      },
      priority: {
        label: 'Priority',
        width: '5%',
        isSortable: true,
      },
      severity: {
        label: 'Severity',
        width: '5%',
        isSortable: true,
      },
      objectAssignee: {
        label: 'Assignees',
        width: '14%',
        isSortable: isRuntimeSort,
      },
      creator: {
        label: 'Creators',
        width: '11%',
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
    const queryRef = useQueryLoading<CaseIncidentsLinesCasesPaginationQuery>(
      caseIncidentsLinesQuery,
      paginationOptions,
    );
    const toolBarFilters = filtersWithEntityType(filters, 'Case-Incident');
    return (
      <ListLines
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
        handleToggleSelectAll={handleToggleSelectAll}
        selectAll={selectAll}
        openExports={openExports}
        exportEntityType="Case-Incident"
        keyword={searchTerm}
        filters={filters}
        paginationOptions={paginationOptions}
        numberOfElements={numberOfElements}
        iconExtension={true}
        availableFilterKeys={[
          'x_opencti_workflow_id',
          'objectLabel',
          'objectMarking',
          'createdBy',
          'source_reliability',
          'confidence',
          'objectAssignee',
          'objectParticipant',
          'priority',
          'severity',
          'creator_id',
          'created',
        ]}
      >
        {queryRef && (
          <React.Suspense
            fallback={
              <>
                {Array(20)
                  .fill(0)
                  .map((_, idx) => (
                    <CaseIncidentLineDummy
                      key={idx}
                      dataColumns={dataColumns}
                    />
                  ))}
              </>
            }
          >
            <CaseIncidentsLines
              queryRef={queryRef}
              paginationOptions={paginationOptions}
              dataColumns={dataColumns}
              setNumberOfElements={helpers.handleSetNumberOfElements}
              selectedElements={selectedElements}
              deSelectedElements={deSelectedElements}
              onToggleEntity={onToggleEntity}
              selectAll={selectAll}
            />
            <ToolBar
              selectedElements={selectedElements}
              deSelectedElements={deSelectedElements}
              numberOfSelectedElements={numberOfSelectedElements}
              handleClearSelectedElements={handleClearSelectedElements}
              selectAll={selectAll}
              filters={toolBarFilters}
              type="Case-Incident"
            />
          </React.Suspense>
        )}
      </ListLines>
    );
  };
  return (
    <ExportContextProvider>
      {renderLines()}
      <Security needs={[KNOWLEDGE_KNUPDATE]}>
        <CaseIncidentCreation paginationOptions={paginationOptions} />
      </Security>
    </ExportContextProvider>
  );
};

export default CaseIncidents;
