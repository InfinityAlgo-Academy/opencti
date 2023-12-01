import React, { FunctionComponent } from 'react';
import useAuth from '../../../../../utils/hooks/useAuth';
import ListLines from '../../../../../components/list_lines/ListLines';
import { QueryRenderer } from '../../../../../relay/environment';
import EntityStixCoreRelationshipsLinesAll, {
  entityStixCoreRelationshipsLinesAllQuery,
} from '../EntityStixCoreRelationshipsLinesAll';
import EntityStixCoreRelationshipsLinesTo, {
  entityStixCoreRelationshipsLinesToQuery,
} from '../EntityStixCoreRelationshipsLinesTo';
import EntityStixCoreRelationshipsLinesFrom, {
  entityStixCoreRelationshipsLinesFromQuery,
} from '../EntityStixCoreRelationshipsLinesFrom';
import ToolBar from '../../../data/ToolBar';
import useEntityToggle from '../../../../../utils/hooks/useEntityToggle';
import { KNOWLEDGE_KNUPDATE } from '../../../../../utils/hooks/useGranted';
import StixCoreRelationshipCreationFromEntity from '../StixCoreRelationshipCreationFromEntity';
import Security from '../../../../../utils/Security';
import {
  computeTargetStixCyberObservableTypes,
  computeTargetStixDomainObjectTypes,
  isStixCyberObservables,
} from '../../../../../utils/stixTypeUtils';
import { PaginationLocalStorage } from '../../../../../utils/hooks/useLocalStorage';
import { DataColumns, PaginationOptions } from '../../../../../components/list_lines';
import {
  addFilter, cleanFilters,
  FilterGroup,
  filtersWithEntityType,
  findFilterFromKey,
  removeFilter,
} from '../../../../../utils/filters/filtersUtils';

interface EntityStixCoreRelationshipsRelationshipsViewProps {
  entityId: string
  entityLink: string
  defaultStartTime: string
  defaultStopTime: string
  stixCoreObjectTypes: string[]
  relationshipTypes: string[]
  localStorage: PaginationLocalStorage<PaginationOptions>
  currentView: string
  allDirections?: boolean
  isRelationReversed?: boolean
  enableContextualView: boolean
  enableNestedView?: boolean
  paddingRightButtonAdd?: number
  role?: string,
  handleChangeView?: (viewMode: string) => void
}

const EntityStixCoreRelationshipsRelationshipsView: FunctionComponent<EntityStixCoreRelationshipsRelationshipsViewProps> = ({
  entityId,
  entityLink,
  defaultStartTime,
  defaultStopTime,
  localStorage,
  relationshipTypes = [],
  stixCoreObjectTypes = [],
  role,
  isRelationReversed,
  allDirections,
  currentView,
  enableNestedView,
  enableContextualView,
  paddingRightButtonAdd = null,
  handleChangeView,
}) => {
  const { viewStorage, helpers: storageHelpers, localStorageKey } = localStorage;
  const {
    numberOfElements,
    filters,
    searchTerm,
    sortBy,
    orderAsc,
    openExports,
    view,
  } = viewStorage;

  const availableFilterKeys = [
    'relationship_type',
    'entity_type',
    'objectMarking',
    'confidence',
    'objectLabel',
    'createdBy',
    'creator_id',
    'created',
  ];

  const { platformModuleHelpers } = useAuth();
  const isObservables = isStixCyberObservables(stixCoreObjectTypes);
  const isRuntimeSort = platformModuleHelpers.isRuntimeFieldEnable();
  const dataColumns: DataColumns = {
    relationship_type: {
      label: 'Relationship type',
      width: '8%',
      isSortable: true,
    },
    entity_type: {
      label: 'Entity type',
      width: '10%',
      isSortable: false,
    },
    [isObservables ? 'observable_value' : 'name']: {
      label: isObservables ? 'Value' : 'Name',
      width: '20%',
      isSortable: false,
    },
    createdBy: {
      label: 'Author',
      width: '10%',
      isSortable: isRuntimeSort,
    },
    creator: {
      label: 'Creators',
      width: '10%',
      isSortable: isRuntimeSort,
    },
    start_time: {
      label: 'Start time',
      width: '8%',
      isSortable: true,
    },
    stop_time: {
      label: 'Stop time',
      width: '8%',
      isSortable: true,
    },
    created_at: {
      label: 'Creation date',
      width: '8%',
      isSortable: true,
    },
    confidence: {
      label: 'Confidence',
      isSortable: true,
      width: '6%',
    },
    objectMarking: {
      label: 'Marking',
      isSortable: isRuntimeSort,
      width: '8%',
    },
  };

  const selectedTypes = findFilterFromKey(filters?.filters ?? [], 'entity_type')?.values ?? stixCoreObjectTypes;
  const selectedRelationshipTypes = findFilterFromKey(filters?.filters ?? [], 'relationship_type')?.values ?? relationshipTypes;

  let paginationOptions = {
    relationship_type: selectedRelationshipTypes,
    search: searchTerm,
    orderBy: (sortBy && (sortBy in dataColumns) && dataColumns[sortBy].isSortable) ? sortBy : 'relationship_type',
    orderMode: orderAsc ? 'asc' : 'desc',
    filters: removeFilter(cleanFilters(filters, availableFilterKeys), ['relationship_type', 'entity_type']),
  } as object;

  let backgroundTaskFilters: FilterGroup | undefined = filtersWithEntityType(
    filters,
    selectedRelationshipTypes.length > 0
      ? selectedRelationshipTypes
      : ['stix-core-relationship'],
  );

  if (allDirections) {
    paginationOptions = {
      ...paginationOptions,
      elementId: entityId,
      elementWithTargetTypes: selectedTypes,
    };
    backgroundTaskFilters = addFilter(
      addFilter(backgroundTaskFilters, 'elementId', entityId),
      'elementWithTargetTypes',
      selectedTypes.length > 0
        ? selectedTypes
        : ['Stix-Core-Object'],
    );
  } else if (isRelationReversed) {
    paginationOptions = {
      ...paginationOptions,
      toId: entityId,
      toRole: role || null,
      fromTypes: selectedTypes,
    };
    backgroundTaskFilters = addFilter(
      addFilter(backgroundTaskFilters, 'toId', entityId),
      'fromTypes',
      selectedTypes.length > 0
        ? selectedTypes
        : ['Stix-Core-Object'],
    );
  } else {
    paginationOptions = {
      ...paginationOptions,
      fromId: entityId,
      fromRole: role || null,
      toTypes: selectedTypes,
    };
    backgroundTaskFilters = addFilter(
      addFilter(backgroundTaskFilters, 'fromId', entityId),
      'toTypes',
      selectedTypes.length > 0
        ? selectedTypes
        : ['Stix-Core-Object'],
    );
  }

  const {
    selectedElements,
    numberOfSelectedElements,
    deSelectedElements,
    selectAll,
    handleClearSelectedElements,
    handleToggleSelectAll,
    onToggleEntity,
  } = useEntityToggle(localStorageKey);

  const finalView = currentView || view;
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
                displayImport={true}
                secondaryAction={true}
                iconExtension={true}
                keyword={searchTerm}
                handleToggleSelectAll={handleToggleSelectAll}
                selectAll={selectAll}
                numberOfElements={numberOfElements}
                filters={filters}
                availableFilterKeys={availableFilterKeys}
                availableEntityTypes={stixCoreObjectTypes}
                availableRelationshipTypes={relationshipTypes}
                handleToggleExports={storageHelpers.handleToggleExports}
                openExports={openExports}
                exportEntityType="stix-core-relationship"
                noPadding={true}
                handleChangeView={
                    handleChangeView || storageHelpers.handleChangeView
                }
                enableNestedView={enableNestedView}
                enableContextualView={enableContextualView}
                disableCards={true}
                paginationOptions={paginationOptions}
                enableEntitiesView={true}
                currentView={finalView}
            >
                <QueryRenderer
                    query={
                        // eslint-disable-next-line no-nested-ternary
                        allDirections
                          ? entityStixCoreRelationshipsLinesAllQuery
                          : isRelationReversed
                            ? entityStixCoreRelationshipsLinesToQuery
                            : entityStixCoreRelationshipsLinesFromQuery
                    }
                    variables={{ count: 25, ...paginationOptions }}
                    render={({ props }: { props: unknown }) =>
                    /* eslint-disable-next-line no-nested-ternary,implicit-arrow-linebreak */
                      (allDirections ? (
                            <EntityStixCoreRelationshipsLinesAll
                                data={props}
                                paginationOptions={paginationOptions}
                                entityLink={entityLink}
                                entityId={entityId}
                                dataColumns={dataColumns}
                                initialLoading={props === null}
                                setNumberOfElements={storageHelpers.handleSetNumberOfElements}
                                onToggleEntity={onToggleEntity}
                                selectedElements={selectedElements}
                                deSelectedElements={deSelectedElements}
                                selectAll={selectAll}
                            />
                      ) : isRelationReversed ? (
                            <EntityStixCoreRelationshipsLinesTo
                                data={props}
                                paginationOptions={paginationOptions}
                                entityLink={entityLink}
                                dataColumns={dataColumns}
                                initialLoading={props === null}
                                setNumberOfElements={storageHelpers.handleSetNumberOfElements}
                                onToggleEntity={onToggleEntity}
                                selectedElements={selectedElements}
                                deSelectedElements={deSelectedElements}
                                selectAll={selectAll}
                            />
                      ) : (
                            <EntityStixCoreRelationshipsLinesFrom
                                data={props}
                                paginationOptions={paginationOptions}
                                entityLink={entityLink}
                                dataColumns={dataColumns}
                                initialLoading={props === null}
                                setNumberOfElements={storageHelpers.handleSetNumberOfElements}
                                onToggleEntity={onToggleEntity}
                                selectedElements={selectedElements}
                                deSelectedElements={deSelectedElements}
                                selectAll={selectAll}
                            />
                      ))
                    }
                />
            </ListLines>
            <ToolBar
                selectedElements={selectedElements}
                deSelectedElements={deSelectedElements}
                numberOfSelectedElements={numberOfSelectedElements}
                selectAll={selectAll}
                filters={backgroundTaskFilters}
                search={searchTerm}
                handleClearSelectedElements={handleClearSelectedElements}
                variant="medium"
            />
            <Security needs={[KNOWLEDGE_KNUPDATE]}>
                <StixCoreRelationshipCreationFromEntity
                    entityId={entityId}
                    allowedRelationshipTypes={relationshipTypes}
                    isRelationReversed={isRelationReversed}
                    targetStixDomainObjectTypes={computeTargetStixDomainObjectTypes(stixCoreObjectTypes)}
                    targetStixCyberObservableTypes={computeTargetStixCyberObservableTypes(stixCoreObjectTypes)}
                    defaultStartTime={defaultStartTime}
                    defaultStopTime={defaultStopTime}
                    paginationOptions={paginationOptions}
                    paddingRight={paddingRightButtonAdd ?? 220}
                />
            </Security>
        </>
  );
};

export default EntityStixCoreRelationshipsRelationshipsView;
