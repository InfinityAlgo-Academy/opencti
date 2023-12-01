import React, { FunctionComponent } from 'react';
import DataComponentLines, { dataComponentsLinesQuery } from './data_components/DataComponentsLines';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import DataComponentCreation from './data_components/DataComponentCreation';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import ListLines from '../../../components/list_lines/ListLines';
import {
  DataComponentsLinesPaginationQuery,
  DataComponentsLinesPaginationQuery$variables,
} from './data_components/__generated__/DataComponentsLinesPaginationQuery.graphql';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import DataComponentLineDummy from './data_components/DataComponentLineDummy';
import { initialFilterGroup } from '../../../utils/filters/filtersUtils';

const LOCAL_STORAGE_KEY_DATA_COMPONENTS = 'dataComponents';

const DataComponents: FunctionComponent = () => {
  const { viewStorage, helpers, paginationOptions } = usePaginationLocalStorage<DataComponentsLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY_DATA_COMPONENTS,
    {
      numberOfElements: {
        number: 0,
        symbol: '',
      },
      filters: initialFilterGroup,
      searchTerm: '',
      sortBy: 'name',
      orderAsc: true,
      openExports: false,
    },
  );

  const renderLines = () => {
    const {
      numberOfElements,
      filters,
      searchTerm,
      sortBy,
      orderAsc,
      openExports,
    } = viewStorage;
    const dataColumns = {
      name: {
        label: 'Name',
        width: '35%',
        isSortable: true,
      },
      objectLabel: {
        label: 'Labels',
        width: '25%',
        isSortable: false,
      },
      created: {
        label: 'Creation date',
        width: '15%',
        isSortable: true,
      },
      modified: {
        label: 'Modification date',
        width: '15%',
        isSortable: true,
      },
    };
    const queryRef = useQueryLoading<DataComponentsLinesPaginationQuery>(
      dataComponentsLinesQuery,
      paginationOptions,
    );
    return (
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
        openExports={openExports}
        exportEntityType="Data-Component"
        keyword={searchTerm}
        filters={filters}
        paginationOptions={paginationOptions}
        numberOfElements={numberOfElements}
        availableFilterKeys={[
          'x_opencti_workflow_id',
          'objectLabel',
          'objectMarking',
          'createdBy',
          'source_reliability',
          'confidence',
          'created',
          'revoked',
        ]}
      >
        {queryRef && (
          <React.Suspense
            fallback={
              <>
                {Array(20)
                  .fill(0)
                  .map((_, idx) => (
                    <DataComponentLineDummy
                      key={idx}
                      dataColumns={dataColumns}
                    />
                  ))}
              </>
            }
          >
            <DataComponentLines
              queryRef={queryRef}
              paginationOptions={paginationOptions}
              dataColumns={dataColumns}
              onLabelClick={helpers.handleAddFilter}
              setNumberOfElements={helpers.handleSetNumberOfElements}
            />
          </React.Suspense>
        )}
      </ListLines>
    );
  };
  return (
    <>
      {renderLines()}
      <Security needs={[KNOWLEDGE_KNUPDATE]}>
        <DataComponentCreation paginationOptions={paginationOptions} />
      </Security>
    </>
  );
};

export default DataComponents;
