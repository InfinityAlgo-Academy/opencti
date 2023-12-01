import React, { FunctionComponent } from 'react';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import ListLines from '../../../components/list_lines/ListLines';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import TriggersLines, { triggersLinesQuery } from './triggers/TriggersLines';
import {
  TriggersLinesPaginationQuery,
  TriggersLinesPaginationQuery$variables,
} from './triggers/__generated__/TriggersLinesPaginationQuery.graphql';
import { TriggerLineDummy } from './triggers/TriggerLine';
import TriggerCreation from './triggers/TriggerCreation';
import { initialFilterGroup } from '../../../utils/filters/filtersUtils';

export const LOCAL_STORAGE_KEY_TRIGGERS = 'triggers';

const Triggers: FunctionComponent = () => {
  const { viewStorage, helpers, paginationOptions } = usePaginationLocalStorage<TriggersLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY_TRIGGERS,
    {
      searchTerm: '',
      sortBy: 'name',
      orderAsc: true,
      filters: initialFilterGroup,
      numberOfElements: {
        number: 0,
        symbol: '',
      },
    },
  );
  const renderLines = () => {
    const { searchTerm, sortBy, orderAsc, filters, numberOfElements } = viewStorage;
    const dataColumns = {
      trigger_type: {
        label: 'Type',
        width: '10%',
        isSortable: true,
      },
      name: {
        label: 'Name',
        width: '15%',
        isSortable: true,
      },
      notifiers: {
        label: 'Notification',
        width: '20%',
        isSortable: false,
      },
      event_types: {
        label: 'Triggering on',
        width: '20%',
        isSortable: false,
      },
      filters: {
        label: 'Details',
        width: '30%',
        isSortable: false,
      },
    };
    const queryRef = useQueryLoading<TriggersLinesPaginationQuery>(
      triggersLinesQuery,
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
                handleSwitchFilter={helpers.handleSwitchFilter}
                handleSwitchGlobalMode={helpers.handleSwitchGlobalMode}
                handleSwitchLocalMode={helpers.handleSwitchLocalMode}
                keyword={searchTerm}
                filters={filters}
                paginationOptions={paginationOptions}
                numberOfElements={numberOfElements}
                availableFilterKeys={[
                  'trigger_type',
                  'instance_trigger',
                  'created',
                ]}
            >
                {queryRef && (
                    <React.Suspense
                        fallback={
                            <>
                                {Array.from(Array(20).keys()).map((idx) => (
                                    <TriggerLineDummy
                                        key={`TriggerLineDummy-${idx}`}
                                        dataColumns={dataColumns}
                                    />
                                ))}
                            </>
                        }
                    >
                        <TriggersLines
                            queryRef={queryRef}
                            paginationOptions={paginationOptions}
                            dataColumns={dataColumns}
                            onLabelClick={helpers.handleAddFilter}
                            setNumberOfElements={helpers.handleSetNumberOfElements}
                            bypassEditionRestriction={false}
                        />
                    </React.Suspense>
                )}
            </ListLines>
    );
  };

  return (
        <div>
            {renderLines()}
            <TriggerCreation paginationOptions={paginationOptions}/>
        </div>
  );
};

export default Triggers;
