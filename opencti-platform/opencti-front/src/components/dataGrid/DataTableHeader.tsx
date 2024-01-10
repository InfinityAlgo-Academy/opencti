import React, { FunctionComponent, useContext } from 'react';
import { ArrowDropDown, ArrowDropUp, MoreVert } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SimpleDraggrable from 'react-draggable';
import makeStyles from '@mui/styles/makeStyles';
import { createStyles } from '@mui/styles';
import { Theme as MuiTheme } from '@mui/material/styles/createTheme';
import { DataTableContext } from './dataTableUtils';
import { DataTableColumn, DataTableHeaderProps, LocalStorageColumns } from './dataTableTypes';

export const SELECT_COLUMN_SIZE = 42;

const useStyles = makeStyles<MuiTheme, { column: DataTableColumn }>((theme) => createStyles({
  headerContainer: {
    position: 'relative',
    display: 'flex',
    width: ({ column }) => `calc(var(--header-${column?.id}-size) * 1px)`,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  headerAligner: {
    paddingLeft: 8,
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    cursor: ({ column: { isSortable } }) => (isSortable ? 'pointer' : 'unset'),
  },
  aligner: { flexGrow: 1 },
  draggable: {
    position: 'absolute',
    top: 0,
    right: 3,
    height: '100%',
    width: 3,
    background: theme.palette.primary.dark,
    cursor: 'col-resize',
    userSelect: 'none',
    touchAction: 'none',
    zIndex: 999,
  },
}));

const DataTableHeader: FunctionComponent<DataTableHeaderProps> = ({
  column,
  anchorEl,
  setAnchorEl,
  handleClose,
  setLocalStorageColumns,
  containerRef,
  sortBy,
  orderAsc,
}) => {
  const classes = useStyles({ column });

  const {
    columns,
    setColumns,
    availableFilterKeys,
    onAddFilter,
    onSort,
    formatter,
  } = useContext(DataTableContext);

  const { t_i18n } = formatter!;

  return (
    <div
      key={column.id}
      className={classes.headerContainer}
    >
      <div
        className={classes.headerAligner}
        onClick={(e) => {
          // Small debounce
          (e.target as HTMLDivElement).style.setProperty('pointer-events', 'none');
          setTimeout(() => {
            (e.target as HTMLDivElement).style.setProperty('pointer-events', 'auto');
          }, 800);
          if (column.isSortable) {
            onSort!(column.id, !orderAsc);
          }
        }}
      >
        {column.label}
        {sortBy && (orderAsc ? <ArrowDropUp /> : <ArrowDropDown />)}
      </div>
      <>
        <div className={classes.aligner} />
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <MoreVert />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          {/* <MenuItem onClick={() => handleToggleVisibility(column.id)}>{t_i18n('Hide column')}</MenuItem> */}
          {column.isSortable && (<MenuItem onClick={() => onSort!(column.id, true)}>{t_i18n('Sort Asc')}</MenuItem>)}
          {column.isSortable && (<MenuItem onClick={() => onSort!(column.id, false)}>{t_i18n('Sort Desc')}</MenuItem>)}
          {availableFilterKeys?.includes(column.id) && (
            <MenuItem
              onClick={() => {
                onAddFilter!(column.id);
                handleClose();
              }}
            >
              {t_i18n('Add filtering')}
            </MenuItem>
          )}
        </Menu>
        <SimpleDraggrable
          position={{ x: 3, y: 0 }}
          axis="x"
          onStop={(e, { lastX }) => {
            if (!containerRef) {
              return;
            }
            const newSize = (column?.size ?? 0) + lastX;

            const effectiveColumns = columns.filter(({ id }) => !['select', 'navigate'].includes(id));
            const currentSize = effectiveColumns.reduce((acc, col) => acc + (col.size ?? 0), 0);

            const currentColIndex = effectiveColumns.findIndex(({ id }) => id === column.id);
            const otherColIndex = currentColIndex === effectiveColumns.length - 1 ? currentColIndex - 1 : currentColIndex + 1;
            const currentCol = effectiveColumns[currentColIndex];

            currentCol!.size = newSize;

            const clientWidth = containerRef.current!.clientWidth - (2 * SELECT_COLUMN_SIZE);

            const otherColumn = effectiveColumns[otherColIndex];
            const clientDiff = clientWidth - effectiveColumns.reduce((acc, col) => acc + (col.size ?? 0), 0);

            if (clientDiff > 0) {
              const flexSize = (100 * currentCol.size!) / currentSize;
              if (otherColumn) {
                const otherColumnNewSize = otherColumn.size! - lastX - currentSize + clientWidth;
                otherColumn.size = otherColumnNewSize;
                otherColumn.flexSize = (otherColumnNewSize * 100) / clientWidth;
              }
              currentCol.flexSize = flexSize;
            }

            setLocalStorageColumns((curr: LocalStorageColumns) => ({
              ...curr,
              [column.id]: { ...curr[column.id], size: newSize },
              [otherColumn.id]: { ...curr[otherColumn.id], ...otherColumn },
            }));
            const newColumns = [columns.at(0) as DataTableColumn, ...effectiveColumns, columns.at(-1) as DataTableColumn];
            setColumns(newColumns);
          }}
        >
          <div
            className={classes.draggable}
          />
        </SimpleDraggrable>
      </>
    </div>
  );
};

export default DataTableHeader;
