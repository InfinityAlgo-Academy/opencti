import React, { FunctionComponent } from 'react';
import ListLines from '../../../components/list_lines/ListLines';
import ExternalReferencesLines, { externalReferencesLinesQuery } from './external_references/ExternalReferencesLines';
import ExternalReferenceCreation from './external_references/ExternalReferenceCreation';
import Security from '../../../utils/Security';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import {
  ExternalReferencesLinesPaginationQuery,
  ExternalReferencesLinesPaginationQuery$variables,
} from './external_references/__generated__/ExternalReferencesLinesPaginationQuery.graphql';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import useAuth from '../../../utils/hooks/useAuth';
import useEntityToggle from '../../../utils/hooks/useEntityToggle';
import {
  ExternalReferenceLine_node$data,
} from './external_references/__generated__/ExternalReferenceLine_node.graphql';
import ToolBar from '../data/ToolBar';
import { ExternalReferenceLineDummy } from './external_references/ExternalReferenceLine';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import { filtersWithEntityType, initialFilterGroup } from '../../../utils/filters/filtersUtils';

const LOCAL_STORAGE_KEY = 'externalReferences';

interface ExternalReferencesProps {
  history: History;
  location: Location;
}

const ExternalReferences: FunctionComponent<ExternalReferencesProps> = () => {
  const {
    platformModuleHelpers: { isRuntimeFieldEnable },
  } = useAuth();
  const { viewStorage, helpers, paginationOptions } = usePaginationLocalStorage<ExternalReferencesLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    {
      searchTerm: '',
      sortBy: 'created',
      orderAsc: true,
      openExports: false,
      filters: initialFilterGroup,
    },
  );
  const { sortBy, orderAsc, searchTerm, filters, numberOfElements } = viewStorage;
  const isRuntimeSort = isRuntimeFieldEnable() ?? false;
  const dataColumns = {
    source_name: {
      label: 'Source name',
      width: '15%',
      isSortable: true,
    },
    external_id: {
      label: 'External ID',
      width: '10%',
      isSortable: true,
    },
    url: {
      label: 'URL',
      width: '45%',
      isSortable: true,
    },
    creator: {
      label: 'Creator',
      width: '12%',
      isSortable: isRuntimeSort,
    },
    created: {
      label: 'Date',
      width: '15%',
      isSortable: true,
    },
  };
  const {
    onToggleEntity,
    numberOfSelectedElements,
    handleClearSelectedElements,
    selectedElements,
    deSelectedElements,
    handleToggleSelectAll,
    selectAll,
  } = useEntityToggle<ExternalReferenceLine_node$data>(LOCAL_STORAGE_KEY);
  const queryRef = useQueryLoading<ExternalReferencesLinesPaginationQuery>(
    externalReferencesLinesQuery,
    paginationOptions,
  );
  const toolBarFilters = filtersWithEntityType(filters, 'External-Reference');
  return (
    <>
      <ListLines
        sortBy={sortBy}
        orderAsc={orderAsc}
        dataColumns={dataColumns}
        handleSort={helpers.handleSort}
        handleSearch={helpers.handleSearch}
        handleAddFilter={helpers.handleAddFilter}
        handleRemoveFilter={helpers.handleRemoveFilter}
        handleSwitchLocalMode={helpers.handleSwitchLocalMode}
        handleSwitchGlobalMode={helpers.handleSwitchGlobalMode}
        handleToggleSelectAll={handleToggleSelectAll}
        selectAll={selectAll}
        displayImport={true}
        secondaryAction={true}
        filters={filters}
        keyword={searchTerm}
        iconExtension={true}
        paginationOptions={paginationOptions}
        numberOfElements={numberOfElements}
        availableFilterKeys={[
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
                  .map((idx) => (
                    <ExternalReferenceLineDummy
                      key={idx}
                      dataColumns={dataColumns}
                    />
                  ))}
              </>
            }
          >
            <>
              <ExternalReferencesLines
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
                search={searchTerm}
                filters={toolBarFilters}
                type="External-Reference"
              />
            </>
          </React.Suspense>
        )}
      </ListLines>
      <Security needs={[KNOWLEDGE_KNUPDATE]}>
        <ExternalReferenceCreation
          paginationOptions={paginationOptions}
          openContextual={false}
        />
      </Security>
    </>
  );
};

export default ExternalReferences;
