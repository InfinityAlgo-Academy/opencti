import Button from '@mui/material/Button';
import { FilterListOutlined } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import { RayEndArrow, RayStartArrow } from 'mdi-material-ui';
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { useFormatter } from '../../../../components/i18n';
import { directFilters, inlineFilters } from '../../../../utils/filters/filtersUtils';
import FilterAutocomplete from './FilterAutocomplete';
import InlineFilters from './InlineFilters';

const useStyles = makeStyles(() => ({
  filters: {
    float: 'left',
    margin: '-3px 0 0 -5px',
  },
  container: {
    width: 600,
    padding: 20,
  },
  autocomplete: {
    float: 'left',
    margin: '5px 10px 0 10px',
    width: 200,
  },
  booleanFilter: {
    float: 'left',
    margin: '5px 10px 0 10px',
  },
}));

const ListFiltersWithoutLocalStorage = ({
  size,
  fontSize,
  handleOpenFilters,
  handleCloseFilters,
  open,
  anchorEl,
  noDirectFilters,
  availableFilterKeys,
  filterElement,
  searchContext,
  variant,
  type,
  inputValues,
  setInputValues,
  availableEntityTypes,
  availableRelationshipTypes,
  availableRelationFilterTypes,
  allEntityTypes,
  defaultHandleAddFilter,
  defaultHandleRemoveFilter,
  handleSwitchFilter,
}) => {
  const { t } = useFormatter();
  const classes = useStyles();
  let icon = <FilterListOutlined fontSize={fontSize || 'medium'} />;
  let tooltip = t('Filters');
  let color = 'primary';
  if (type === 'from') {
    icon = <RayStartArrow fontSize={fontSize || 'medium'} />;
    tooltip = t('Dynamic source filters');
    color = 'warning';
  } else if (type === 'to') {
    icon = <RayEndArrow fontSize={fontSize || 'medium'} />;
    tooltip = t('Dynamic target filters');
    color = 'success';
  }
  return (
    <div className={classes.filters}>
      {variant === 'text' ? (
        <Tooltip title={tooltip}>
          <Button
            variant="contained"
            color={color}
            onClick={handleOpenFilters}
            startIcon={icon}
            size="small"
            style={{ float: 'left', margin: '0 15px 0 7px' }}
          >
            {t('Filters')}
          </Button>
        </Tooltip>
      ) : (
        <Tooltip title={tooltip}>
          <IconButton
            color={color}
            onClick={handleOpenFilters}
            style={{ float: 'left', marginTop: -2 }}
            size={size || 'large'}
          >
            {icon}
          </IconButton>
        </Tooltip>
      )}
      <Popover
        classes={{ paper: classes.container }}
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseFilters}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        elevation={1}
        className="noDrag"
      >
        {filterElement}
      </Popover>
      {!noDirectFilters
        && availableFilterKeys.filter((n) => directFilters.includes(n)).map(
          (filterKey) => {
            if (inlineFilters.includes(filterKey)) {
              return (
                <div className={classes.booleanFilter} key={filterKey}>
                  <InlineFilters
                    filterKey={filterKey}
                    defaultHandleRemoveFilter={defaultHandleRemoveFilter}
                    handleSwitchFilter={handleSwitchFilter}
                  />
                </div>
              );
            }
            return (
              <div className={classes.autocomplete} key={filterKey}>
                <FilterAutocomplete
                  filterKey={filterKey}
                  searchContext={searchContext}
                  defaultHandleAddFilter={defaultHandleAddFilter}
                  inputValues={inputValues}
                  setInputValues={setInputValues}
                  availableEntityTypes={availableEntityTypes}
                  availableRelationshipTypes={availableRelationshipTypes}
                  availableRelationFilterTypes={availableRelationFilterTypes}
                  allEntityTypes={allEntityTypes}
                  openOnFocus={false}
                />
              </div>
            );
          },
        )}
      <div className="clearfix" />
    </div>
  );
};

export default ListFiltersWithoutLocalStorage;
