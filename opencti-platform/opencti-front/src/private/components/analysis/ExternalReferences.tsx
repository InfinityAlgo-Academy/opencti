import React, { FunctionComponent, useContext } from 'react';
import { QueryRenderer } from '../../../relay/environment';
import ListLines from '../../../components/list_lines/ListLines';
import ExternalReferencesLines, {
  externalReferencesLinesQuery,
} from './external_references/ExternalReferencesLines';
import ExternalReferenceCreation from './external_references/ExternalReferenceCreation';
import Security from '../../../utils/Security';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import {
  ExternalReferencesLinesPaginationQuery$data,
  ExternalReferencesLinesPaginationQuery$variables,
} from './external_references/__generated__/ExternalReferencesLinesPaginationQuery.graphql';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import { UserContext } from '../../../utils/hooks/useAuth';
import useEntityToggle from '../../../utils/hooks/useEntityToggle';
import { ExternalReferenceLine_node$data } from './external_references/__generated__/ExternalReferenceLine_node.graphql';
import ToolBar from '../data/ToolBar';
import { Filters } from '../../../components/list_lines';
import { LOCAL_STORAGE_KEY_CASE } from '../cases/Feedbacks';

const LOCAL_STORAGE_KEY = 'view-external-references';

interface ExternalReferencesProps {
  history: History;
  location: Location;
}

const ExternalReferences: FunctionComponent<ExternalReferencesProps> = () => {
  const { helper } = useContext(UserContext);
  const { viewStorage, helpers, paginationOptions } = usePaginationLocalStorage<ExternalReferencesLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY_CASE,
    {
      searchTerm: '',
      sortBy: 'created',
      orderAsc: true,
      openExports: false,
      filters: {} as Filters,
      numberOfElements: {
        number: 0,
        symbol: '',
      },
    },
  );
  const { sortBy, orderAsc, searchTerm, filters, numberOfElements } = viewStorage;
  const isRuntimeSort = helper?.isRuntimeFieldEnable();
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
      isSortable: isRuntimeSort ?? false,
    },
    created: {
      label: 'Creation date',
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
  return (
    <div>
      <ListLines
        sortBy={sortBy}
        orderAsc={orderAsc}
        dataColumns={dataColumns}
        handleSort={helpers.handleSort}
        handleSearch={helpers.handleSearch}
        handleAddFilter={helpers.handleAddFilter}
        handleRemoveFilter={helpers.handleRemoveFilter}
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
          'creator',
          'created_start_date',
          'created_end_date',
        ]}
      >
        <QueryRenderer
          query={externalReferencesLinesQuery}
          variables={paginationOptions}
          render={({
            props,
          }: {
            props: ExternalReferencesLinesPaginationQuery$data;
          }) => (
            <>
              <ExternalReferencesLines
                data={props}
                paginationOptions={paginationOptions}
                dataColumns={dataColumns}
                initialLoading={props === null}
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
                type="External-Reference"
              />
            </>
          )}
        />
      </ListLines>
      <Security needs={[KNOWLEDGE_KNUPDATE]}>
        <ExternalReferenceCreation
          paginationOptions={paginationOptions}
          openContextual={false}
        />
      </Security>
    </div>
  );
};

export default ExternalReferences;
