import React, { useState } from 'react';
import * as R from 'ramda';
import { DataTableLineDummy } from './DataTableLine';
import DataTableBody from './DataTableBody';
import { DataTableContext, defaultColumnsMap } from './dataTableUtils';
import { DataTableColumn, DataTableColumns, DataTableContextProps, DataTableProps, DataTableVariant, LocalStorageColumns } from './dataTableTypes';
import DataTableHeaders from './DataTableHeaders';
import { SELECT_COLUMN_SIZE } from './DataTableHeader';

const DataTableComponent = ({
  dataColumns,
  resolvePath,
  storageKey,
  initialValues,
  availableFilterKeys,
  toolbarFilters,
  dataQueryArgs,
  parametersWithPadding = false,
  redirectionModeEnabled = false,
  useLineData,
  useDataTable,
  useDataCellHelpers,
  useDataTableToggle,
  useComputeLink,
  useDataTableLocalStorage,
  formatter,
  settingsMessagesBannerHeight,
  storageHelpers,
  filtersComponent,
  redirectionMode,
  numberOfElements,
  onAddFilter,
  onSort,
  sortBy,
  orderAsc,
  dataTableToolBarComponent,
  variant = DataTableVariant.default,
}: DataTableProps) => {
  const localStorageColumns = useDataTableLocalStorage!<LocalStorageColumns>(`${storageKey}_columns`, {}, true)[0];

  const [columns, setColumns] = useState<DataTableColumns>([
    { id: 'select', visible: true } as DataTableColumn,
    ...Object.entries(dataColumns).map(([id, column], index) => {
      const currentColumn = localStorageColumns?.[id];
      return R.mergeDeepRight(defaultColumnsMap.get(id) as DataTableColumn, {
        ...column,
        id,
        order: currentColumn?.index ?? index,
        visible: currentColumn?.visible ?? true,
        ...(currentColumn?.size ? { size: currentColumn?.size } : {}),
      });
    }),
    { id: 'navigate', visible: true } as DataTableColumn,
  ]);

  const clientWidth = document.getElementsByTagName('main')[0].clientWidth - 46;

  const temporaryColumnsSize: { [key: string]: number } = {
    '--header-select-size': SELECT_COLUMN_SIZE,
    '--col-select-size': SELECT_COLUMN_SIZE,
    '--header-navigate-size': SELECT_COLUMN_SIZE,
    '--col-navigate-size': SELECT_COLUMN_SIZE,
    '--header-table-size': clientWidth,
    '--col-table-size': clientWidth,
  };
  columns.forEach((col) => {
    if (col.visible && col.flexSize) {
      const size = col.flexSize * (clientWidth / 100);
      temporaryColumnsSize[`--header-${col.id}-size`] = size;
      temporaryColumnsSize[`--col-${col.id}-size`] = size;
    }
  });

  return (
    <DataTableContext.Provider
      value={{
        storageKey,
        columns,
        availableFilterKeys,
        effectiveColumns: columns.filter(({ visible }) => visible).sort((a, b) => a.order! - b.order!),
        initialValues,
        setColumns,
        resolvePath,
        parametersWithPadding,
        redirectionModeEnabled,
        toolbarFilters,
        useLineData,
        useDataTable,
        useDataCellHelpers,
        useDataTableToggle,
        useComputeLink,
        useDataTableLocalStorage,
        onAddFilter,
        onSort,
        formatter,
        variant,
      } as DataTableContextProps}
    >
      {filtersComponent ?? (
        <div
          style={{
            width: '100%',
            textAlign: 'right',
            marginBottom: 10,
          }}
        >
          <strong>{`${numberOfElements?.number}${numberOfElements?.symbol}`}</strong>{' '}
          {formatter!.t_i18n('entitie(s)')}
        </div>
      )}
      <React.Suspense
        fallback={(
          <div style={{ ...temporaryColumnsSize, width: '100%' }}>
            <DataTableHeaders
              effectiveColumns={columns}
              sortBy={sortBy}
              orderAsc={orderAsc}
              dataTableToolBarComponent={dataTableToolBarComponent}
            />
            {Array(10)
              .fill(0)
              .map((_, idx) => (
                <DataTableLineDummy key={idx} />
              ))}
          </div>
        )}
      >
        <DataTableBody
          dataQueryArgs={dataQueryArgs}
          columns={columns.filter(({ visible }) => visible)}
          redirectionMode={redirectionMode}
          storageHelpers={storageHelpers}
          settingsMessagesBannerHeight={settingsMessagesBannerHeight}
          hasFilterComponent={!!filtersComponent}
          sortBy={sortBy}
          orderAsc={orderAsc}
          dataTableToolBarComponent={dataTableToolBarComponent}
        />
      </React.Suspense>
    </DataTableContext.Provider>
  );
};

export default DataTableComponent;
