import React, { useContext, useMemo } from 'react';
import Skeleton from '@mui/material/Skeleton';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import { KeyboardArrowRightOutlined } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import { createStyles } from '@mui/styles';
import { Theme as MuiTheme } from '@mui/material/styles/createTheme';
import { useNavigate } from 'react-router-dom';
import { DataTableContext } from './dataTableUtils';
import type { DataTableCellProps, DataTableLineProps } from './dataTableTypes';
import { DataTableColumn } from './dataTableTypes';

const useStyles = makeStyles<MuiTheme & { palette: { background: { nav: string } } }, { cell?: DataTableColumn }>((theme) => createStyles({
  cellContainer: ({ cell }) => ({
    display: 'flex',
    borderBottom: `1px solid ${theme.palette.background.nav}`,
    width: `calc(var(--col-${cell?.id}-size) * 1px)`,
    height: '50px',
    alignItems: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  cellPadding: {
    display: 'flex',
    paddingLeft: 10,
    paddingRight: 10,
    width: 'fill-available',
    alignItems: 'center',
    gap: 3,
  },
  dummyContainer: {
    display: 'flex',
    gap: 8,
  },
  row: {
    display: 'flex',
    '&:hover': {
      backgroundColor:
        theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, .2)'
          : 'rgba(0, 0, 0, .2)',
    },
  },
}));

export const DataTableLineDummy = () => {
  const classes = useStyles({});
  const { effectiveColumns } = useContext(DataTableContext);

  const lines = useMemo(() => (
    <>
      {effectiveColumns.map((column) => (
        <Skeleton
          key={column.id}
          variant="text"
          height={50}
          style={{ width: `calc(var(--col-${column?.id}-size) * 1px)` }}
        />
      ))}
    </>
  ), [effectiveColumns]);
  return (
    <div className={classes.dummyContainer}>
      {lines}
    </div>
  );
};

const DataTableCell = ({
  cell,
  data,
}: DataTableCellProps) => {
  const classes = useStyles({ cell });
  const { useDataCellHelpers } = useContext(DataTableContext);

  const helpers = useDataCellHelpers!(cell);

  return (
    <div
      key={`${cell.id}_${data.id}`}
      className={classes.cellContainer}
    >
      <div className={classes.cellPadding}>
        {cell.render?.(data, helpers) ?? (<div>-</div>)}
      </div>
    </div>
  );
};

const DataTableLine = ({ row, redirectionMode, storageHelpers, effectiveColumns }: DataTableLineProps) => {
  const classes = useStyles({});

  const {
    storageKey,
    useLineData,
    useDataTableToggle,
    useComputeLink,
  } = useContext(DataTableContext);

  const {
    selectAll,
    deSelectedElements,
    selectedElements,
    onToggleEntity,
  } = useDataTableToggle!(storageKey);

  const data = useLineData!(row);

  const navigate = useNavigate();

  let link = useComputeLink!(data)!;
  if (redirectionMode && redirectionMode !== 'overview') {
    link = `${link}/${redirectionMode}`;
  }

  return (
    <div
      key={row.id}
      className={classes.row}
      onClick={() => navigate(link)}
    >
      <div
        key={`select_${data.id}`}
        className={classes.cellContainer}
        style={{
          width: 'calc(var(--col-select-size) * 1px)',
        }}
      >
        {effectiveColumns.at(0)?.id === 'select' && (
          <Checkbox
            onClick={(event) => onToggleEntity(data, event)}
            checked={
              (selectAll
                && !((data?.id || 'id') in (deSelectedElements || {})))
              || (data?.id || 'id') in (selectedElements || {})
            }
          />
        )}
      </div>
      {effectiveColumns.slice(1, -1).map((column) => (
        <DataTableCell
          key={column.id}
          cell={column}
          data={data}
          storageHelpers={storageHelpers}
        />
      ))}
      <div
        key={`navigate_${data.id}`}
        className={classes.cellContainer}
        style={{
          width: 'calc(var(--col-navigate-size) * 1px)',
        }}
      >
        {effectiveColumns.at(-1)?.id === 'navigate' && (
          <IconButton onClick={() => navigate(link)}>
            <KeyboardArrowRightOutlined />
          </IconButton>
        )}
      </div>
    </div>
  );
};

export default DataTableLine;
