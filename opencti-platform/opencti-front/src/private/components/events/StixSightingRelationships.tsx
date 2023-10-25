import React from 'react';
import { QueryRenderer } from '../../../relay/environment';
import ListLines from '../../../components/list_lines/ListLines';
import StixSightingRelationshipsLines, {
  stixSightingRelationshipsLinesQuery,
} from './stix_sighting_relationships/StixSightingRelationshipsLines';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import { Filters } from '../../../components/list_lines';
import {
  StixSightingRelationshipsFiltering,
  StixSightingRelationshipsLinesPaginationQuery$data,
  StixSightingRelationshipsLinesPaginationQuery$variables,
} from './stix_sighting_relationships/__generated__/StixSightingRelationshipsLinesPaginationQuery.graphql';
import { convertFilters } from '../../../utils/ListParameters';
import useEntityToggle from '../../../utils/hooks/useEntityToggle';
import { StixSightingRelationshipLine_node$data } from './stix_sighting_relationships/__generated__/StixSightingRelationshipLine_node.graphql';
import ToolBar from '../data/ToolBar';
import ExportContextProvider from '../../../utils/ExportContextProvider';

const dataColumns = {
  x_opencti_negative: {
    label: 'filter_x_opencti_negative',
    width: '10%',
    isSortable: true,
  },
  attribute_count: {
    label: 'Nb.',
    width: 80,
    isSortable: true,
  },
  name: {
    label: 'Name',
    width: '15%',
    isSortable: false,
  },
  entity_type: {
    label: 'Entity type',
    width: '12%',
    isSortable: false,
  },
  entity: {
    label: 'Entity',
    width: '12%',
    isSortable: false,
  },
  first_seen: {
    label: 'First obs.',
    width: '12%',
    isSortable: true,
  },
  last_seen: {
    label: 'Last obs.',
    width: '12%',
    isSortable: true,
  },
  confidence: {
    width: '10%',
    label: 'Confidence',
    isSortable: true,
  },
  x_opencti_workflow_id: {
    label: 'Status',
    isSortable: true,
  },
};

const LOCAL_STORAGE_KEY = 'view-stixSightingRelationships';

const StixSightingRelationships = () => {
  const {
    viewStorage,
    paginationOptions: rawPaginationOptions,
    helpers: storageHelpers,
  } = usePaginationLocalStorage<StixSightingRelationshipsLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    {
      filters: {} as Filters,
      searchTerm: '',
      sortBy: 'last_seen',
      orderAsc: false,
      openExports: false,
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
    onToggleEntity,
    numberOfSelectedElements,
    handleClearSelectedElements,
    selectedElements,
    deSelectedElements,
    handleToggleSelectAll,
    selectAll,
  } = useEntityToggle<StixSightingRelationshipLine_node$data>(LOCAL_STORAGE_KEY);

  const renderLines = (
    paginationOptions: StixSightingRelationshipsLinesPaginationQuery$variables,
  ) => {
    let renderFilters = filters;
    renderFilters = {
      ...renderFilters,
      entity_type: [
        {
          id: 'stix-sighting-relationship',
          value: 'stix-sighting-relationship',
        },
      ],
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
          handleToggleExports={storageHelpers.handleToggleExports}
          handleToggleSelectAll={handleToggleSelectAll}
          selectAll={selectAll}
          openExports={openExports}
          exportEntityType="stix-sighting-relationship"
          keyword={searchTerm}
          filters={filters}
          paginationOptions={paginationOptions}
          numberOfElements={numberOfElements}
          secondaryAction={true}
          iconExtension={true}
          availableFilterKeys={[
            'x_opencti_workflow_id',
            'labelledBy',
            'markedBy',
            'createdBy',
            'confidence',
            'created_start_date',
            'created_end_date',
            'toSightingId',
            'x_opencti_negative',
            'creator',
          ]}
        >
          <QueryRenderer
            query={stixSightingRelationshipsLinesQuery}
            variables={paginationOptions}
            render={({
              props,
            }: {
              props: StixSightingRelationshipsLinesPaginationQuery$data;
            }) => (
              <StixSightingRelationshipsLines
                data={props}
                paginationOptions={paginationOptions}
                dataColumns={dataColumns}
                initialLoading={props === null}
                onLabelClick={storageHelpers.handleAddFilter}
                setNumberOfElements={storageHelpers.handleSetNumberOfElements}
                selectedElements={selectedElements}
                deSelectedElements={deSelectedElements}
                onToggleEntity={onToggleEntity}
                selectAll={selectAll}
              />
            )}
          />
        </ListLines>
        <ToolBar
          selectedElements={selectedElements}
          deSelectedElements={deSelectedElements}
          numberOfSelectedElements={numberOfSelectedElements}
          selectAll={selectAll}
          search={searchTerm}
          filters={renderFilters}
          handleClearSelectedElements={handleClearSelectedElements}
          type="stix-sighting-relationship"
        />
      </>
    );
  };

  // As toSightingId must be converted to a connection nested filter in backend
  // we need to remove it from the filters and use a specific api parameter instead
  let toSightingId: string | undefined;
  const newFilters = { ...filters };
  if (newFilters.toSightingId) {
    toSightingId = String(newFilters.toSightingId.at(0)?.id);
    delete newFilters.toSightingId;
  }
  const enrichedPaginationOptions: StixSightingRelationshipsLinesPaginationQuery$variables = {
    ...rawPaginationOptions,
    toId: toSightingId,
    filters: convertFilters(
      newFilters,
    ) as unknown as StixSightingRelationshipsFiltering[],
  };
  return (
    <ExportContextProvider>
      {renderLines(enrichedPaginationOptions)}
    </ExportContextProvider>
  );
};

export default StixSightingRelationships;
