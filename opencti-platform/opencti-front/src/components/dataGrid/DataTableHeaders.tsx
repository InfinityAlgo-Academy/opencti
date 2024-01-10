import React, { FunctionComponent, useContext, useMemo, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import { DragIndicatorOutlined, MoreVert } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import { DragDropContext, Draggable, DraggableLocation, Droppable } from 'react-beautiful-dnd';
import MenuItem from '@mui/material/MenuItem';
import { PopoverProps } from '@mui/material/Popover/Popover';
import { Theme as MuiTheme } from '@mui/material/styles/createTheme';
import { DataTableColumns, DataTableHeadersProps, LocalStorageColumns } from './dataTableTypes';
import DataTableHeader from './DataTableHeader';
import { DataTableContext } from './dataTableUtils';

const useStyles = makeStyles<MuiTheme>((theme) => ({
  headersContainer: {
    background: theme.palette.background.paper,
    display: 'flex',
    width: 'calc(var(--header-table-size) * 1px)',
  },
  aligner: { flexGrow: 1 },
}));

const DataTableHeaders: FunctionComponent<DataTableHeadersProps> = ({
  containerRef,
  effectiveColumns,
  dataTableToolBarComponent,
  sortBy,
  orderAsc,
}) => {
  const classes = useStyles();
  const {
    storageKey,
    columns,
    setColumns,
    useDataTableToggle,
    useDataTableLocalStorage,
  } = useContext(DataTableContext);

  const {
    selectAll,
    numberOfSelectedElements,
    handleToggleSelectAll,
  } = useDataTableToggle!(storageKey);

  const [_, setLocalStorageColumns] = useDataTableLocalStorage!<LocalStorageColumns>(`${storageKey}_columns`, {}, true);

  const [anchorEl, setAnchorEl] = useState<PopoverProps['anchorEl']>(null);
  const handleClose = () => setAnchorEl(null);

  const handleToggleVisibility = (columnId: string) => {
    const newColumns = [...effectiveColumns];
    const currentColumn = newColumns.find(({ id }) => id === columnId);
    currentColumn!.visible = !currentColumn!.visible;
    setLocalStorageColumns((curr: LocalStorageColumns) => ({ ...curr, [columnId]: { ...curr[columnId], visible: !currentColumn!.visible } }));
    setColumns(newColumns);
  };

  const ordonableColumns = useMemo(() => effectiveColumns.filter(({ id }) => !['select', 'navigate'].includes(id)), [columns]);

  return (
    <div
      className={classes.headersContainer}
    >
      {effectiveColumns.some(({ id }) => id === 'select') && (
        <div
          style={{ width: 'calc(var(--header-select-size) * 1px)' }}
        >
          <Checkbox
            checked={selectAll}
            onChange={handleToggleSelectAll}
            disabled={!handleToggleSelectAll}
          />
        </div>
      )}
      {numberOfSelectedElements > 0 ? dataTableToolBarComponent : (
        <>
          {effectiveColumns
            .filter(({ id }) => !['select', 'navigate'].includes(id))
            .map((column) => (
              <DataTableHeader
                key={column.id}
                column={column}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                handleClose={handleClose}
                setLocalStorageColumns={setLocalStorageColumns}
                containerRef={containerRef}
                sortBy={sortBy === column.id}
                orderAsc={!!orderAsc}
              />
            ))}
          {effectiveColumns.some(({ id }) => id === 'navigate') && (
            <div
              style={{ width: 'calc(var(--header-navigate-size) * 1px)' }}
            />
          )}
          {effectiveColumns.some(({ id }) => id === 'todo-navigate') && (
            <>
              <div className={classes.aligner} />
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <MoreVert />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <DragDropContext
                  key={(new Date()).toString()}
                  onDragEnd={({ draggableId, source, destination }) => {
                    const result = Array.from(ordonableColumns);
                    const [removed] = result.splice(source.index, 1);
                    result.splice((destination as DraggableLocation).index, 0, removed);

                    const newColumns: DataTableColumns = [
                      effectiveColumns.at(0),
                      ...(result.map((c, index) => {
                        const currentColumn = effectiveColumns.find(({ id }) => id === c.id);
                        return ({ ...currentColumn, order: index });
                      })),
                      effectiveColumns.at(-1),
                    ] as DataTableColumns;

                    setColumns(newColumns);
                    setLocalStorageColumns((curr: LocalStorageColumns) => ({ ...curr, [draggableId]: { ...curr[draggableId], order: destination?.index } }));
                  }}
                >
                  <Droppable droppableId="droppable-list">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {ordonableColumns.map((c, index) => (
                          <Draggable
                            key={index}
                            draggableId={c.id}
                            index={index}
                          >
                            {(item) => (
                              <MenuItem
                                ref={item.innerRef}
                                {...item.draggableProps}
                                {...item.dragHandleProps}
                              >
                                <DragIndicatorOutlined fontSize="small" />
                                <Checkbox
                                  onClick={() => handleToggleVisibility(c.id)}
                                  checked={c.visible}
                                />
                                {c.label}
                              </MenuItem>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </Menu>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DataTableHeaders;
