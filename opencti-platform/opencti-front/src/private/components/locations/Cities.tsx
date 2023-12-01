import React, { FunctionComponent } from 'react';
import ListLines from '../../../components/list_lines/ListLines';
import CitiesLines, { citiesLinesQuery } from './cities/CitiesLines';
import CityCreation from './cities/CityCreation';
import Security from '../../../utils/Security';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import { CityLineDummy } from './cities/CityLine';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import {
  CitiesLinesPaginationQuery,
  CitiesLinesPaginationQuery$variables,
} from './cities/__generated__/CitiesLinesPaginationQuery.graphql';
import { initialFilterGroup } from '../../../utils/filters/filtersUtils';

const LOCAL_STORAGE_KEY = 'cities';

const Cities: FunctionComponent = () => {
  const { viewStorage, helpers, paginationOptions } = usePaginationLocalStorage<CitiesLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    {
      searchTerm: '',
      sortBy: 'name',
      orderAsc: true,
      openExports: false,
      filters: initialFilterGroup,
      numberOfElements: {
        number: 0,
        symbol: '',
      },
    },
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
    const dataColumns = {
      name: {
        label: 'Name',
        width: '60%',
        isSortable: true,
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
    const queryRef = useQueryLoading<CitiesLinesPaginationQuery>(
      citiesLinesQuery,
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
        exportEntityType="City"
        keyword={searchTerm}
        filters={filters}
        paginationOptions={paginationOptions}
        numberOfElements={numberOfElements}
        availableFilterKeys={[
          'created',
          'createdBy',
        ]}
      >
        {queryRef && (
          <React.Suspense
            fallback={
              <>
                {Array(20)
                  .fill(0)
                  .map((_, idx) => (
                    <CityLineDummy key={idx} dataColumns={dataColumns} />
                  ))}
              </>
            }
          >
            <CitiesLines
              queryRef={queryRef}
              paginationOptions={paginationOptions}
              dataColumns={dataColumns}
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
        <CityCreation paginationOptions={paginationOptions} />
      </Security>
    </>
  );
};

export default Cities;
