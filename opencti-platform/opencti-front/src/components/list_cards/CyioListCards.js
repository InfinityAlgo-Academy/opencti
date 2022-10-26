import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import {
  compose, last, map, toPairs,
} from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {
  Share,
  Edit,
  AddCircleOutline,
  FormatListBulleted,
} from '@material-ui/icons';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import responsiblePartiesIcon from '../../resources/images/entities/responsible_parties.svg';
import tasksIcon from '../../resources/images/entities/tasks.svg';
import locations from '../../resources/images/entities/locations.svg';
import roles from '../../resources/images/entities/roles.svg';
import notes from '../../resources/images/entities/Notes.svg';
import parties from '../../resources/images/entities/parties.svg';
import assessmentPlatform from '../../resources/images/entities/assessment_platform.svg';
import labels from '../../resources/images/entities/labelsImage.svg';
import externalReferenceIcon from '../../resources/images/entities/externalReferenceIcon.svg';
import inject18n from '../i18n';
// import Security, { KNOWLEDGE_KNGETEXPORT, KNOWLEDGE_KNUPDATE } from '../../utils/Security';
import Filters from '../../private/components/common/lists/Filters';
import { truncate } from '../../utils/String';
import TopBarMenu from '../../private/components/nav/TopBarMenu';

const styles = (theme) => ({
  container: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    padding: '0 0 50px 0',
  },
  containerOpenExports: {
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    margin: '0 300px 0 -10px',
  },
  toolBar: {
    margin: '0 0 30px 0',
    height: '100%',
    display: 'flex',
    '@media (max-width: 1400px)': {
      flexWrap: 'wrap',
    },
    alignItems: 'self-start',
    justifyContent: 'space-between',
    color: theme.palette.header.text,
    backgroundColor: theme.palette.background.paper,
    // boxShadow: 'inset 0px 4px 4px rgba(0, 0, 0, 0.25)',
  },
  dataEntities: {
    minWidth: '180px',
    width: 'auto',
  },
  parameters: {
    // float: 'left',
    display: 'flex',
    '@media (max-width: 1250px)': {
      flexWrap: 'wrap',
    },
    padding: '18px 18px 0 18px',
  },
  searchBar: {
    width: '220px',
    minWidth: '220px',
  },
  views: {
    // display: 'flex',
    width: '295px',
    minWidth: '280px',
    float: 'right',
    marginTop: '5px',
    padding: '14px 10px 12px 18px',
  },
  menuItems: {
    display: 'flex',
    placeItems: 'center',
  },
  selectedViews: {
    width: '430px',
    minWidth: '415px',
    float: 'right',
    marginTop: '5px',
    padding: '14px 10px 12px 18px',
  },
  cardsContainer: {
    marginTop: -13,
    paddingTop: '0px 16px 16px 16px',
  },
  icon: {
    marginRight: '10px',
  },
  iconButton: {
    float: 'left',
    minWidth: '0px',
    marginRight: 15,
    padding: '7px',
  },
  sortField: {
    float: 'left',
  },
  sortFieldLabel: {
    margin: '7px 15px',
    fontSize: 14,
    float: 'left',
    color: theme.palette.header.text,
  },
  sortIcon: {
    float: 'left',
    margin: '-9px 0 0 15px',
  },
  filters: {
    padding: '0 0 12px 0',
    '@media (max-width: 1250px)': {
      marginTop: '20px',
    },
  },
  filter: {
    marginRight: 10,
    marginBottom: 10,
  },
  operator: {
    fontFamily: 'Consolas, monaco, monospace',
    backgroundColor: theme.palette.background.chip,
    marginRight: 10,
    marginBottom: 10,
  },
});

class CyioListCards extends Component {
  sortBy(event) {
    this.props.handleSort(event.target.value, this.props.orderAsc);
  }

  reverse() {
    this.props.handleSort(this.props.sortBy, !this.props.orderAsc);
  }

  render() {
    const {
      t,
      classes,
      handleChangeView,
      handleAddFilter,
      handleRemoveFilter,
      openExports,
      OperationsComponent,
      handleDisplayEdit,
      selectedElements,
      disabled,
      filterEntityType,
      selectedDataEntity,
      filters,
      selectAll,
      children,
      handleNewCreation,
      numberOfElements,
      availableFilterKeys,
      handleClearSelectedElements,
    } = this.props;
    const totalElementsSelected = selectedElements && Object.keys(selectedElements).length;

    return (
      <div
        className={
          openExports ? classes.containerOpenExports : classes.container
        }
      >
        <div
          className={classes.toolBar}
          elevation={1}
        >
          <div className={classes.parameters}>
            <div className={classes.searchBar}>
              {/* <div style={{ float: 'left', marginRight: 20 }}>
                <SearchInput
                  variant="small"
                  onSubmit={handleSearch.bind(this)}
                  keyword={keyword}
                  disabled={true}
                />
              </div> */}
              {availableFilterKeys && availableFilterKeys.length > 0 ? (
                <Filters
                  availableFilterKeys={availableFilterKeys}
                  handleAddFilter={handleAddFilter}
                  currentFilters={filters}
                  filterEntityType={filterEntityType}
                  variant='text'
                />
              ) : (
                ''
              )}
              {numberOfElements ? (
                <div style={{ float: 'left', padding: '5px' }}>
                  {t('Count:')}{' '}
                  <strong>{`${numberOfElements.number}${numberOfElements.symbol}`}</strong>
                </div>
              ) : (
                ''
              )}
              {/* <InputLabel
                classes={{ root: classes.sortFieldLabel }}
                style={{
                  marginLeft:
                    availableFilterKeys && availableFilterKeys.length > 0 ? 10 : 0,
                }}
              >
                {t('Sort by')}
              </InputLabel>
              <FormControl classes={{ root: classes.sortField }}>
                <Select
                  name="sort-by"
                  value={sortBy}
                  onChange={this.sortBy.bind(this)}
                  inputProps={{
                    name: 'sort-by',
                    id: 'sort-by',
                  }}
                >
                  {toPairs(dataColumns).map((dataColumn) => (
                    <MenuItem key={dataColumn[0]} value={dataColumn[0]}>
                      {t(dataColumn[1].label)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton
                aria-label="Sort by"
                onClick={this.reverse.bind(this)}
                classes={{ root: classes.sortIcon }}
              >
                {orderAsc ? <ArrowDownward /> : <ArrowUpward />}
              </IconButton> */}
            </div>
            {(filterEntityType === 'Entities' || filterEntityType === 'DataSources') && (
              <FormControl
                size='small'
                fullWidth={true}
                variant='outlined'
                className={classes.dataEntities}
              >
                <InputLabel>
                  Data Types
                </InputLabel>
                <Select
                  variant='outlined'
                  label='Data Types'
                  value={selectedDataEntity}
                >
                  <MenuItem
                    component={Link}
                    to='/data/entities/responsibility'
                    value='responsibility'
                  >
                  <div className={ classes.menuItems }>
                    <img src={roles} className={classes.icon} alt="" />
                    {t('Responsibility')}
                  </div>
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to='/data/entities/locations'
                    value='locations'
                  >
                  <div className={ classes.menuItems }>
                    <img src={locations} className={classes.icon} alt="" />
                    {t('Locations')}
                  </div>
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to='/data/entities/parties'
                    value='parties'
                  >
                  <div className={ classes.menuItems }>
                    <img src={parties} className={classes.icon} alt="" />
                    {t('Parties')}
                  </div>
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to='/data/entities/responsible_parties'
                    value='responsible_parties'
                  >
                  <div className={ classes.menuItems }>
                    <img src={responsiblePartiesIcon} style={{ marginRight: '12px' }} alt="" />
                    {t('Responsible Parties')}
                  </div>
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to='/data/entities/tasks'
                    value='tasks'
                  >
                  <div className={ classes.menuItems }>
                    <img src={tasksIcon} className={classes.icon} alt="" />
                    {t('Tasks')}
                  </div>
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to='/data/entities/assessment_platform'
                    value='assessment_platform'
                  >
                  <div className={ classes.menuItems }>
                    <img src={assessmentPlatform} className={classes.icon} alt="" />
                    {t('Assessment Platform')}
                  </div>
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to='/data/entities/notes'
                    value='notes'
                  >
                    <img src={notes} className={classes.icon} alt="" />
                    {t('Notes')}
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to='/data/entities/labels'
                    value='labels'
                  >
                  <div className={ classes.menuItems }>
                    <img src={labels} className={classes.icon} alt="" />
                    {t('Labels')}
                  </div>
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to='/data/entities/external_references'
                    value='external_references'
                  >
                  <div className={ classes.menuItems }>
                    <img src={externalReferenceIcon} className={classes.icon} alt="" />
                    {t('External References')}
                  </div>
                  </MenuItem>
                </Select>
              </FormControl>
            )}
            <div className={classes.filters}>
              {map((currentFilter) => {
                const label = `${truncate(t(`filter_${currentFilter[0]}`), 20)}`;
                const values = (
                  <span>
                    {map(
                      (n) => (
                        <span key={n.value}>
                          {n.value && n.value.length > 0
                            ? truncate(n.value, 15)
                            : t('No label')}{' '}
                          {last(currentFilter[1]).value !== n.value && (
                            <code>OR</code>
                          )}{' '}
                        </span>
                      ),
                      currentFilter[1],
                    )}
                  </span>
                );
                return (
                  <span>
                    <Chip
                      key={currentFilter[0]}
                      classes={{ root: classes.filter }}
                      label={
                        <div>
                          <strong>{label}</strong>: {values}
                        </div>
                      }
                      onDelete={handleRemoveFilter.bind(this, currentFilter[0])}
                    />
                    {last(toPairs(filters))[0] !== currentFilter[0] && (
                      <Chip
                        classes={{ root: classes.operator }}
                        label={t('AND')}
                      />
                    )}
                  </span>
                );
              }, toPairs(filters))}
            </div>
          </div>
          <div className={totalElementsSelected > 0 ? classes.selectedViews : classes.views}>
            <div style={{ float: 'right' }}>
              {totalElementsSelected > 0 && (
                <Chip
                  className={classes.iconButton}
                  label={
                    <>
                      <strong>{totalElementsSelected}</strong> Selected
                    </>
                  }
                  onDelete={handleClearSelectedElements} />
              )}
              {typeof handleChangeView === 'function' && (
                // <Security needs={[KNOWLEDGE_KNUPDATE]}>
                <>
                  <Tooltip title={t('Edit')}>
                    <Button
                      variant="contained"
                      onClick={handleDisplayEdit && handleDisplayEdit.bind(this, selectedElements)}
                      className={classes.iconButton}
                      disabled={Boolean(Object.entries(selectedElements || {}).length !== 1)
                        || disabled}
                      color="primary"
                      size="large"
                    >
                      <Edit fontSize="inherit" />
                    </Button>
                  </Tooltip>
                  {(filterEntityType === 'Entities' || filterEntityType === 'DataSources') && (
                    <Tooltip title={t('Merge')}>
                      <Button
                        variant="contained"
                        // onClick={handleDisplayEdit &&
                        // handleDisplayEdit.bind(this, selectedElements)}
                        className={classes.iconButton}
                        // disabled={Boolean(Object.entries(selectedElements || {}).length !== 1)
                        //   || disabled}
                        disabled={true}
                        color="primary"
                        size="large"
                      >
                        <Share fontSize="inherit" />
                      </Button>
                    </Tooltip>
                  )}
                  <div style={{ display: 'inline-block' }}>
                    {OperationsComponent && React.cloneElement(OperationsComponent, {
                      id: Object.entries(selectedElements || {}).length !== 0
                        && Object.entries(selectedElements)[0][0],
                      isAllselected: selectAll,
                    })}
                  </div>
                  <Tooltip title={t('Create New')}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddCircleOutline />}
                      onClick={handleNewCreation && handleNewCreation.bind(this)}
                      color='primary'
                      style={{ marginTop: '-22px' }}
                      disabled={disabled || false}
                    >
                      {t('New')}
                    </Button>
                  </Tooltip>
                </>
                // </Security>
              )}
              {typeof handleChangeView === 'function' && (
                <Tooltip title={t('Lines view')}>
                  <IconButton
                    color="primary"
                    onClick={handleChangeView.bind(this, 'lines')}
                    style={{ marginTop: '-23px' }}
                    data-cy='lines view'
                  >
                    <FormatListBulleted />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
        <div className="clearfix" />
        <TopBarMenu />
        <div className={classes.cardsContainer}>{children}</div>
      </div>
    );
  }
}

CyioListCards.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  children: PropTypes.object,
  selectedDataEntity: PropTypes.string,
  handleSearch: PropTypes.func.isRequired,
  handleSort: PropTypes.func.isRequired,
  handleChangeView: PropTypes.func,
  handleAddFilter: PropTypes.func,
  handleRemoveFilter: PropTypes.func,
  handleToggleExports: PropTypes.func,
  handleClearSelectedElements: PropTypes.func,
  openExports: PropTypes.bool,
  disabled: PropTypes.bool,
  views: PropTypes.array,
  filterEntityType: PropTypes.string,
  exportContext: PropTypes.string,
  keyword: PropTypes.string,
  filters: PropTypes.object,
  sortBy: PropTypes.string.isRequired,
  orderAsc: PropTypes.bool.isRequired,
  dataColumns: PropTypes.object.isRequired,
  paginationOptions: PropTypes.object,
  numberOfElements: PropTypes.object,
  availableFilterKeys: PropTypes.array,
};

export default compose(inject18n, withRouter, withStyles(styles))(CyioListCards);
