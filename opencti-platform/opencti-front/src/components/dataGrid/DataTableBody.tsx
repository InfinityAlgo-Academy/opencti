import React, { useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { createStyles } from '@mui/styles';
import { Theme as MuiTheme } from '@mui/material/styles/createTheme';
import DataTableHeaders from './DataTableHeaders';
import { DataTableContext } from './dataTableUtils';
import { ColumnSizeVars, DataTableBodyProps, DataTableVariant, LocalStorageColumns } from './dataTableTypes';
import DataTableLine, { DataTableLineDummy } from './DataTableLine';
import { SELECT_COLUMN_SIZE } from './DataTableHeader';

const useStyles = makeStyles<MuiTheme, { columnSizeVars: ColumnSizeVars, variant: DataTableVariant }>(() => createStyles({
  tableContainer: ({ columnSizeVars, variant }) => ({
    ...columnSizeVars,
    height: variant === DataTableVariant.default ? 'calc(var(--table-height) * 1px)' : '500px',
    overflowY: 'visible',
  }),
  linesContainer: ({ variant }) => ({
    height: variant === DataTableVariant.default ? 'calc(var(--table-height, 100%) * 1px - 50px)' : '450px',
    width: 'calc(var(--col-table-size, 100%) * 1px)',
    overflowY: 'auto',
    overflowX: 'hidden',
  }),
}));

const DataTableBody = ({
  columns,
  dataQueryArgs,
  redirectionMode,
  storageHelpers,
  settingsMessagesBannerHeight = 0,
  hasFilterComponent,
  sortBy,
  orderAsc,
  dataTableToolBarComponent,
}: DataTableBodyProps) => {
  const { resolvePath, storageKey, setColumns, useDataTable, useDataTableLocalStorage, variant } = useContext(DataTableContext);

  // QUERY PART
  const { data: queryData, hasMore, loadMore, isLoading } = useDataTable!(dataQueryArgs);

  const fetchMore = (number = 5) => {
    if (!hasMore()) {
      return;
    }
    loadMore(number);
  };

  const resolvedData = useMemo(() => {
    return resolvePath(queryData);
  }, [queryData, resolvePath]);

  // TABLE HANDLING
  const [resize, setResize] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [computeState, setComputeState] = useState<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const bottomReached = useCallback(() => {
    const { scrollHeight, scrollTop: newScrollTop, clientHeight } = computeState as HTMLDivElement;
    if (Math.abs(newScrollTop - scrollTop) > 1000 || scrollTop < 100) {
      setScrollTop(newScrollTop);
    }
    if (scrollHeight - newScrollTop - clientHeight < 750 && !isLoading) {
      fetchMore();
    }
  }, [fetchMore, isLoading]);

  const [localStorageColumns, setLocalStorageColumns] = useDataTableLocalStorage!<LocalStorageColumns>(`${storageKey}_columns`, {}, true);

  // This is intended to improve performance by memoizing the column sizes
  const columnSizeVars: ColumnSizeVars = React.useMemo(() => {
    const localColumns: LocalStorageColumns = {};
    const colSizes: { [key: string]: number } = {
      '--header-select-size': SELECT_COLUMN_SIZE,
      '--col-select-size': SELECT_COLUMN_SIZE,
      '--header-navigate-size': SELECT_COLUMN_SIZE,
      '--col-navigate-size': SELECT_COLUMN_SIZE,
    };
    if (!computeState && !containerRef.current) {
      return colSizes;
    }
    const clientWidth = containerRef.current!.clientWidth - (2 * SELECT_COLUMN_SIZE) - (variant === DataTableVariant.inline ? 10 : 0);
    for (let i = 1; i < columns.length - 1; i += 1) {
      const column = { ...columns[i], ...localStorageColumns[columns[i].id] };
      const shouldCompute = (!column.size || resize) && (column.flexSize && Boolean(computeState));
      let size = column.size ?? 200;

      // We must compute px size for columns
      if (shouldCompute) {
        size = column.flexSize * (clientWidth / 100);
        column.size = size;
      }
      localColumns[column.id] = { size };
      colSizes[`--header-${column.id}-size`] = size;
      colSizes[`--col-${column.id}-size`] = size;
    }
    if (Object.keys(localColumns).length > 0) {
      setResize(false);
    }
    if (Object.entries(localColumns).some(([id, { size }]) => localStorageColumns[id]?.size !== size)) {
      setLocalStorageColumns(localColumns);
      setColumns((curr) => {
        return curr.map((col) => {
          if (localColumns[col.id]) {
            return { ...col, size: localColumns[col.id].size };
          }
          return col;
        });
      });
    }
    const columnsSize = Object.values(localColumns).reduce((acc, { size }) => acc + size, 0);
    const tableSize = columnsSize + (2 * SELECT_COLUMN_SIZE);
    if (variant === DataTableVariant.inline) {
      containerRef.current!.style.overflowY = 'hidden';
    } else if (columnsSize > clientWidth) {
      containerRef.current!.style.overflowX = 'auto';
      containerRef.current!.style.overflowY = 'hidden';
    } else {
      containerRef.current!.style.overflow = 'hidden';
    }
    colSizes['--header-table-size'] = tableSize;
    colSizes['--col-table-size'] = tableSize;
    const rootSize = document.getElementById('root')!.offsetHeight - settingsMessagesBannerHeight;
    colSizes['--table-height'] = rootSize - (hasFilterComponent && (document.getElementById('filter-container')!.children.length) ? 240 : 200);

    return colSizes;
  }, [
    resize,
    computeState,
    columns,
    localStorageColumns,
    document.getElementById('filter-container'),
  ]);
  const classes = useStyles({ columnSizeVars, variant });

  useLayoutEffect(() => {
    const handleResize = () => setResize(true);
    const handleStorage = ({ key }: StorageEvent) => setTimeout(() => {
      if (key === 'navOpen') {
        setResize(true);
      }
    }, 200);

    let observer: MutationObserver | undefined;
    if (hasFilterComponent) {
      window.addEventListener('resize', handleResize);
      window.addEventListener('storage', handleStorage);
      observer = new MutationObserver(() => setResize(true));
      observer.observe(document.getElementById('filter-container')!, { childList: true });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', handleStorage);
      if (hasFilterComponent && observer) {
        observer.disconnect();
      }
    };
  }, []);
  const effectiveColumns = useMemo(() => columns
    .map((col) => ({ ...col, size: localStorageColumns[col.id]?.size })), [columns, localStorageColumns]);

  return (
    <div
      ref={containerRef}
      className={classes.tableContainer}
      style={{ ...columnSizeVars }}
    >
      <DataTableHeaders
        containerRef={containerRef}
        effectiveColumns={effectiveColumns}
        sortBy={sortBy}
        orderAsc={orderAsc}
        dataTableToolBarComponent={dataTableToolBarComponent}
      />
      <div
        ref={(node) => setComputeState(node)}
        onScroll={bottomReached}
        className={classes.linesContainer}
      >
        {computeState && (
          <>
            {/* If we have perf issues we should find a way to memoize this */}
            {resolvedData.map((row: { id: string }) => {
              return (
                <DataTableLine
                  key={row.id}
                  row={row}
                  redirectionMode={redirectionMode}
                  storageHelpers={storageHelpers}
                  effectiveColumns={effectiveColumns}
                />
              );
            })}
            {isLoading && Array(10).fill(0).map((_, idx) => (<DataTableLineDummy key={idx} />))}
          </>
        )}
      </div>
    </div>
  );
};

export default DataTableBody;
