import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import {
  compose, last, map, toPairs,
} from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import {
  Edit,
  Delete,
  ArrowDropDown,
  ArrowDropUp,
  DashboardOutlined,
  TableChartOutlined,
  AppsOutlined,
  AddCircleOutline,
} from '@material-ui/icons';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { FileExportOutline } from 'mdi-material-ui';
import Checkbox from '@material-ui/core/Checkbox';
import Alert from '@material-ui/lab/Alert';
import SearchInput from '../SearchInput';
import inject18n from '../i18n';
import StixDomainObjectsExports from '../../private/components/common/stix_domain_objects/StixDomainObjectsExports';
import Security, { KNOWLEDGE_KNGETEXPORT } from '../../utils/Security';
import Filters from '../../private/components/common/lists/Filters';
import StixCyberObservablesExports from '../../private/components/observations/stix_cyber_observables/StixCyberObservablesExports';
import { truncate } from '../../utils/String';
import TopBar from '../../private/components/nav/TopBar';

const styles = (theme) => ({
  container: {
    transition: theme.transitions.create('padding', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    padding: '50px 0 50px 0',
  },
  containerNoPadding: {
    transition: theme.transitions.create('padding', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    padding: '0 0 0 0',
  },
  containerOpenExports: {
    flexGrow: 1,
    transition: theme.transitions.create('padding', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: '0 310px 50px 0',
  },
  toolBar: {
    marginLeft: -25,
    marginRight: -25,
    marginTop: -20,
    height: '64px',
    color: theme.palette.header.text,
    boxShadow: 'inset 0px 4px 4px rgba(0, 0, 0, 0.25)',
  },
  parameters: {
    float: 'left',
    padding: '18px',
  },
  views: {
    float: 'right',
    padding: '10px',
  },
  iconButton: {
    minWidth: '0px',
    marginLeft: 15,
    padding: '7px',
  },
  linesContainer: {
    margin: '10px 0 0 0',
    padding: 0,
  },
  linesContainerBottomNav: {
    margin: '10px 0 90px 0',
    padding: 0,
  },
  item: {
    paddingLeft: 10,
    // textTransform: 'uppercase',
  },
  sortIcon: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
  },
  headerItem: {
    float: 'left',
    fontSize: 12,
    fontWeight: '700',
  },
  sortableHeaderItem: {
    float: 'left',
    paddingLeft: 10,
    fontSize: 16,
    fontWeight: '700',
    cursor: 'pointer',
  },
  filters: {
    float: 'left',
    margin: '2px 0 0 10px',
  },
  filter: {
    marginRight: 10,
  },
  operator: {
    fontFamily: 'Consolas, monaco, monospace',
    backgroundColor: theme.palette.background.chip,
    marginRight: 10,
  },
  info: {
    paddingTop: 10,
  },
});

class ListLines extends Component {
  reverseBy(field) {
    this.props.handleSort(field, !this.props.orderAsc);
  }

  renderHeaderElement(field, label, width, isSortable) {
    const {
      classes, t, sortBy, orderAsc, handleToggleSelectAll,
    } = this.props;
    if (isSortable) {
      const orderComponent = orderAsc ? (
        <ArrowDropDown
          classes={{ root: classes.sortIcon }}
          style={{ top: typeof handleToggleSelectAll === 'function' ? 7 : 0 }}
        />
      ) : (
        <ArrowDropUp
          classes={{ root: classes.sortIcon }}
          style={{ top: typeof handleToggleSelectAll === 'function' ? 7 : 0 }}
        />
      );
      return (
        <div
          key={field}
          className={classes.sortableHeaderItem}
          style={{ width }}
          onClick={this.reverseBy.bind(this, field)}
        >
          <span>{t(label)}</span>
          {sortBy === field ? orderComponent : ''}
        </div>
      );
    }
    return (
      <div className={classes.headerItem} style={{ width }} key={field}>
        <span>{t(label)}</span>
      </div>
    );
  }

  render() {
    const {
      t,
      classes,
      disablePopover,
      handleSearch,
      handleChangeView,
      disableCards,
      enableDuplicates,
      handleAddFilter,
      handleRemoveFilter,
      handleToggleExports,
      handleDeleteElements,
      selectedElements,
      handleToggleSelectAll,
      selectAll,
      openExports,
      noPadding,
      noBottomPadding,
      dataColumns,
      secondaryAction,
      paginationOptions,
      keyword,
      filters,
      bottomNav,
      children,
      exportEntityType,
      exportContext,
      numberOfElements,
      availableFilterKeys,
      handleNewCreation,
      noHeaders,
      iconExtension,
      searchVariant,
      OperationsComponent,
      CreateItemComponent,
      message,
    } = this.props;
    console.log('selectedElementsDartLight', Object.entries(selectedElements || {}));
    let className = classes.container;
    if (noBottomPadding) {
      className = classes.containerWithoutPadding;
    } else if (openExports && !noPadding) {
      className = classes.containerOpenExports;
    }
    return (
      <>
        <div
          className={classes.toolBar}
          elevation={1}
          style={{ backgroundColor: '#075AD333' }}
        >
          <div className={classes.parameters}>
            {typeof handleSearch === 'function' && (
              <div style={{ float: 'left', marginRight: 20 }}>
                <SearchInput
                  variant={searchVariant || 'small'}
                  onSubmit={handleSearch.bind(this)}
                  keyword={keyword}
                />
              </div>
            )}
            {availableFilterKeys && availableFilterKeys.length > 0 && (
              <Filters
                availableFilterKeys={availableFilterKeys}
                handleAddFilter={handleAddFilter}
                currentFilters={filters}
              />
            )}
            {numberOfElements && (
                <div style={{ float: 'left', padding: '5px' }}>
                  {t('Count:')}{' '}
                  <strong>{`${numberOfElements.number}${numberOfElements.symbol}`}</strong>
                </div>
            )}
            {(!availableFilterKeys || availableFilterKeys.length === 0)
              && !noHeaders && <div style={{ height: 38 }}> &nbsp; </div>}
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
                          )}
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
          <div className={classes.views}>
            <div style={{ float: 'right' }}>
              {typeof handleChangeView === 'function' && (
                OperationsComponent && (
                  <div className={classes.iconButton} style={{ display: 'inline-block' }}>
                    {React.cloneElement(OperationsComponent, {
                      id: Object.entries(selectedElements || {}).length !== 0
                        && Object.entries(selectedElements)[0][0],
                      isAllselected: selectAll,
                    })}
                  </div>
                )
              )}
              {/* {typeof handleChangeView === 'function' && (
                <Tooltip title={t('Delete')}>
                  <Button
                    variant="contained"
                    className={classes.iconButton}
                    size="large"
                    color="primary"
                    // disabled={!selectAll}
                    onClick={ () => handleDeleteElements()}
                  >
                    <Delete fontSize="inherit"/>
                  </Button>
                </Tooltip>
              )} */}
              {/* {typeof handleChangeView === 'function' && (
                <Tooltip title={t('Edit')}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={true}
                    className={classes.iconButton}
                    size="large"
                  >
                    <Edit fontSize="inherit"/>
                  </Button>
                </Tooltip>
              )} */}
              {typeof handleChangeView === 'function' && (
                <Tooltip title={t('Create New')}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddCircleOutline />}
                    onClick={handleNewCreation.bind(this)}
                    color='primary'
                    style={{ marginLeft: 15 }}
                  >
                    {t('New')}
                  </Button>
                </Tooltip>
                // <div style={{ display: 'inline-block' }}>
                //   {React.cloneElement(CreateItemComponent, { paginationOptions })}
                // </div>
              )}
              {/* {typeof handleChangeView === 'function' && enableDuplicates && (
                <Tooltip title={t('Detect duplicates')}>
                  <IconButton
                    color="secondary"
                    onClick={handleChangeView.bind(this, 'duplicates')}
                  >
                    <TableChartOutlined />
                  </IconButton>
                </Tooltip>
              )} */}
              {/* <Security needs={[KNOWLEDGE_KNGETEXPORT]}>
                {typeof handleToggleExports === 'function' && (
                  <Tooltip title={t('Exports panel')}>
                    <IconButton
                      color={openExports ? 'secondary' : 'primary'}
                      onClick={handleToggleExports.bind(this)}
                    >
                      <FileExportOutline />
                    </IconButton>
                  </Tooltip>
                )}
              </Security> */}
              {typeof handleChangeView === 'function' && !disableCards && (
                <Tooltip title={t('Cards view')}>
                  <IconButton
                    color="primary"
                    onClick={handleChangeView.bind(this, 'cards')}
                  >
                    <AppsOutlined />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
        <TopBar />
        <div className={className}>
          <div className="clearfix" />
          {message && (
            <div style={{ width: '100%' }}>
              <Alert
                severity="info"
                variant="outlined"
                style={{ padding: '0px 10px 0px 10px' }}
                classes={{ message: classes.info }}
              >
                {message}
              </Alert>
            </div>
          )}
          <List
            classes={{
              root: bottomNav
                ? classes.linesContainerBottomNav
                : classes.linesContainer,
            }}
          >
            {!noHeaders ? (
              <ListItem
                classes={{ root: classes.item }}
                divider={true}
                style={{ paddingTop: 0 }}
              >
                <ListItemIcon
                  style={{
                    minWidth:
                      typeof handleToggleSelectAll === 'function' ? 38 : 56,
                  }}
                >
                  {typeof handleToggleSelectAll === 'function' ? (
                    <Checkbox
                      edge="start"
                      checked={selectAll}
                      disableRipple={true}
                      onChange={handleToggleSelectAll.bind(this)}
                    />
                  ) : (
                    <span
                      style={{
                        padding: '0 8px 0 8px',
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      &nbsp;
                    </span>
                  )}
                </ListItemIcon>
                {iconExtension && (
                  <ListItemIcon>
                    <span
                      style={{
                        padding: '0 8px 0 8px',
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      &nbsp;
                    </span>
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={
                    <div>
                      {toPairs(dataColumns).map((dataColumn) => this.renderHeaderElement(
                        dataColumn[0],
                        dataColumn[1].label,
                        dataColumn[1].width,
                        dataColumn[1].isSortable,
                      ))}
                    </div>
                  }
                />
                {secondaryAction && (
                  <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
                )}
              </ListItem>
            ) : (
              ''
            )}
            {children}
          </List>
          {typeof handleToggleExports === 'function'
            && exportEntityType !== 'Stix-Cyber-Observable' && (
              <Security needs={[KNOWLEDGE_KNGETEXPORT]}>
                <StixDomainObjectsExports
                  open={openExports}
                  handleToggle={handleToggleExports.bind(this)}
                  paginationOptions={paginationOptions}
                  exportEntityType={exportEntityType}
                  context={exportContext}
                />
              </Security>
          )}
          {typeof handleToggleExports === 'function'
            && exportEntityType === 'Stix-Cyber-Observable' && (
              <Security needs={[KNOWLEDGE_KNGETEXPORT]}>
                <StixCyberObservablesExports
                  open={openExports}
                  handleToggle={handleToggleExports.bind(this)}
                  paginationOptions={paginationOptions}
                  context={exportContext}
                />
              </Security>
          )}
        </div>
      </>
    );
  }
}

ListLines.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  selectedElements: PropTypes.object,
  disablePopover: PropTypes.bool,
  children: PropTypes.object,
  handleSearch: PropTypes.func,
  handleSort: PropTypes.func,
  handleChangeView: PropTypes.func,
  disableCards: PropTypes.bool,
  enableDuplicates: PropTypes.bool,
  handleAddFilter: PropTypes.func,
  handleRemoveFilter: PropTypes.func,
  handleToggleExports: PropTypes.func,
  handleToggleSelectAll: PropTypes.func,
  selectAll: PropTypes.bool,
  openExports: PropTypes.bool,
  noPadding: PropTypes.bool,
  noBottomPadding: PropTypes.bool,
  views: PropTypes.array,
  exportEntityType: PropTypes.string,
  exportContext: PropTypes.string,
  keyword: PropTypes.string,
  filters: PropTypes.object,
  sortBy: PropTypes.string,
  orderAsc: PropTypes.bool,
  dataColumns: PropTypes.object.isRequired,
  paginationOptions: PropTypes.object,
  secondaryAction: PropTypes.bool,
  bottomNav: PropTypes.bool,
  numberOfElements: PropTypes.object,
  availableFilterKeys: PropTypes.array,
  noHeaders: PropTypes.bool,
  iconExtension: PropTypes.bool,
  searchVariant: PropTypes.string,
  message: PropTypes.string,
};

export default compose(inject18n, withStyles(styles))(ListLines);
