import React from 'react';
import {
  IndividualsLinesPaginationQuery,
  IndividualsLinesPaginationQuery$variables,
} from '@components/entities/individuals/__generated__/IndividualsLinesPaginationQuery.graphql';
import { IndividualLineDummy } from '@components/entities/individuals/IndividualLine';
import ListLines from '../../../components/list_lines/ListLines';
import IndividualsLines, { individualsLinesQuery } from './individuals/IndividualsLines';
import IndividualCreation from './individuals/IndividualCreation';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import { initialFilterGroup } from '../../../utils/filters/filtersUtils';

const LOCAL_STORAGE_KEY = 'individuals';

const Individuals = () => {
  const { viewStorage, helpers, paginationOptions } = usePaginationLocalStorage<IndividualsLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    {
      searchTerm: '',
      sortBy: 'name',
      orderAsc: true,
      openExports: false,
      filters: initialFilterGroup,
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
    const queryRef = useQueryLoading<IndividualsLinesPaginationQuery>(
      individualsLinesQuery,
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
        exportEntityType="Individual"
        keyword={searchTerm}
        filters={filters}
        paginationOptions={paginationOptions}
        numberOfElements={numberOfElements}
        availableFilterKeys={[
          'objectLabel',
          'objectMarking',
          'created',
          'createdBy',
          'x_opencti_reliability',
        ]}
      >
        {queryRef && (
          <React.Suspense
            fallback={
              <>
                {Array(20)
                  .fill(0)
                  .map((_, idx) => (
                    <IndividualLineDummy
                      key={idx}
                      dataColumns={dataColumns}
                    />
                  ))}
              </>
            }
          >
            <IndividualsLines
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
      <div>
        {renderLines()}
        <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <IndividualCreation paginationOptions={paginationOptions} />
        </Security>
      </div>
  );
};

export default Individuals;
