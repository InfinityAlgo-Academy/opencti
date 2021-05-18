import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import {
  AspectRatio,
  FilterListOutlined,
  AccountBalanceOutlined,
  DeleteOutlined,
  LinkOutlined,
  CenterFocusStrongOutlined,
  EditOutlined,
  InfoOutlined,
  ScatterPlotOutlined,
  DateRangeOutlined,
} from '@material-ui/icons';
import {
  Video3d,
  SelectAll,
  SelectGroup,
  FamilyTree,
  AutoFix,
} from 'mdi-material-ui';
import Tooltip from '@material-ui/core/Tooltip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Drawer from '@material-ui/core/Drawer';
import Popover from '@material-ui/core/Popover';
import Divider from '@material-ui/core/Divider';
import TimeRange from 'react-timeline-range-slider';
import {
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  YAxis,
  ZAxis,
} from 'recharts';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import inject18n from '../../../../components/i18n';
import ContainerAddStixCoreObjects from '../../common/containers/ContainerAddStixCoreObjects';
import StixCoreRelationshipCreation from '../../common/stix_core_relationships/StixCoreRelationshipCreation';
import { dateFormat } from '../../../../utils/Time';
import { truncate } from '../../../../utils/String';
import StixCoreRelationshipEdition from '../../common/stix_core_relationships/StixCoreRelationshipEdition';
import StixDomainObjectEdition from '../../common/stix_domain_objects/StixDomainObjectEdition';
import { resolveLink } from '../../../../utils/Entity';
import { parseDomain } from '../../../../utils/Graph';
import ThemeDark from '../../../../components/ThemeDark';

const styles = (theme) => ({
  bottomNav: {
    zIndex: 1000,
    backgroundColor: theme.palette.navBottom.background,
    display: 'flex',
    overflow: 'hidden',
  },
  divider: {
    display: 'inline-block',
    verticalAlign: 'middle',
    height: '100%',
    margin: '0 5px 0 5px',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class ReportKnowledgeGraphBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openStixCoreObjectsTypes: false,
      anchorElStixCoreObjectsTypes: null,
      openMarkedBy: false,
      anchorElMarkedBy: null,
      openCreatedBy: false,
      anchorElCreatedBy: null,
      openSelectByType: false,
      anchorElSelectByType: null,
      openCreatedRelation: false,
      relationReversed: false,
      openEditRelation: false,
      openEditEntity: false,
      displayRemove: false,
    };
  }

  handleOpenRemove() {
    this.setState({ displayRemove: true });
  }

  handleCloseRemove() {
    this.setState({ displayRemove: false });
  }

  handleOpenStixCoreObjectsTypes(event) {
    this.setState({
      openStixCoreObjectsTypes: true,
      anchorElStixCoreObjectsTypes: event.currentTarget,
    });
  }

  handleCloseStixCoreObjectsTypes() {
    this.setState({
      openStixCoreObjectsTypes: false,
      anchorElStixCoreObjectsTypes: null,
    });
  }

  handleOpenCreatedBy(event) {
    this.setState({
      openCreatedBy: true,
      anchorElCreatedBy: event.currentTarget,
    });
  }

  handleCloseCreatedBy() {
    this.setState({ openCreatedBy: false, anchorElCreatedBy: null });
  }

  handleOpenMarkedBy(event) {
    this.setState({
      openMarkedBy: true,
      anchorElMarkedBy: event.currentTarget,
    });
  }

  handleOpenSelectByType(event) {
    this.setState({
      openSelectByType: true,
      anchorElSelectByType: event.currentTarget,
    });
  }

  handleCloseSelectByType() {
    this.setState({
      openSelectByType: false,
      anchorElSelectByType: null,
    });
  }

  handleCloseMarkedBy() {
    this.setState({ openMarkedBy: false, anchorElMarkedBy: null });
  }

  handleOpenCreateRelationship() {
    this.setState({ openCreatedRelation: true });
  }

  handleCloseCreateRelationship() {
    this.setState({ openCreatedRelation: false });
  }

  handleReverseRelation() {
    this.setState({ relationReversed: !this.state.relationReversed });
  }

  handleOpenEditItem() {
    if (
      this.props.numberOfSelectedNodes === 1
      && !this.props.selectedNodes[0].relationship_type
    ) {
      this.setState({ openEditEntity: true });
    } else if (
      this.props.numberOfSelectedLinks === 1
      || this.props.selectedNodes[0].relationship_type
    ) {
      this.setState({ openEditRelation: true });
    }
  }

  handleCloseEntityEdition() {
    this.setState({ openEditEntity: false });
    this.props.handleCloseEntityEdition(
      R.propOr(null, 'id', this.props.selectedNodes[0]),
    );
  }

  handleCloseRelationEdition() {
    this.setState({ openEditRelation: false });
    this.props.handleCloseRelationEdition(
      R.propOr(null, 'id', this.props.selectedLinks[0]),
    );
  }

  handleSelectByType(type) {
    this.props.handleSelectByType(type);
    this.handleCloseSelectByType();
  }

  render() {
    const {
      t,
      classes,
      currentMode3D,
      currentModeTree,
      currentModeFixed,
      currentCreatedBy,
      currentMarkedBy,
      currentStixCoreObjectsTypes,
      handleToggle3DMode,
      handleToggleTreeMode,
      handleToggleFixedMode,
      handleToggleCreatedBy,
      handleToggleMarkedBy,
      handleToggleStixCoreObjectType,
      handleZoomToFit,
      stixCoreObjectsTypes,
      createdBy,
      markedBy,
      report,
      onAdd,
      onDelete,
      handleDeleteSelected,
      numberOfSelectedNodes,
      numberOfSelectedLinks,
      selectedNodes,
      selectedLinks,
      lastLinkFirstSeen,
      lastLinkLastSeen,
      onAddRelation,
      handleSelectAll,
      handleResetLayout,
      displayTimeRange,
      timeRangeInterval,
      selectedTimeRangeInterval,
      handleToggleDisplayTimeRange,
      handleTimeRangeChange,
      timeRangeValues,
    } = this.props;
    const {
      openStixCoreObjectsTypes,
      anchorElStixCoreObjectsTypes,
      openMarkedBy,
      anchorElMarkedBy,
      openCreatedBy,
      anchorElCreatedBy,
      openSelectByType,
      anchorElSelectByType,
      openCreatedRelation,
      relationReversed,
      openEditRelation,
      openEditEntity,
    } = this.state;
    const viewEnabled = (numberOfSelectedNodes === 1 && numberOfSelectedLinks === 0)
      || (numberOfSelectedNodes === 0 && numberOfSelectedLinks === 1);
    let viewLink = null;
    if (viewEnabled) {
      if (numberOfSelectedNodes === 1) {
        if (selectedNodes[0].relationship_type) {
          viewLink = `${resolveLink(selectedNodes[0].fromType)}/${
            selectedNodes[0].fromId
          }/knowledge/relations/${selectedNodes[0].id}`;
        } else {
          viewLink = `${resolveLink(selectedNodes[0].entity_type)}/${
            selectedNodes[0].id
          }`;
        }
      } else if (numberOfSelectedLinks === 1) {
        const remoteRelevant = selectedLinks[0].source.relationship_type
          ? selectedLinks[0].target
          : selectedLinks[0].source;
        viewLink = `${resolveLink(remoteRelevant.entity_type)}/${
          remoteRelevant.id
        }/knowledge/relations/${selectedLinks[0].id}`;
      }
    }
    const editionEnabled = (numberOfSelectedNodes === 1
        && numberOfSelectedLinks === 0
        && !selectedNodes[0].isObservable)
      || (numberOfSelectedNodes === 0 && numberOfSelectedLinks === 1);
    const relationEnabled = (numberOfSelectedNodes === 2 && numberOfSelectedLinks === 0)
      || (numberOfSelectedNodes === 1 && numberOfSelectedLinks === 1);
    let relationFrom = null;
    let relationTo = null;
    if (numberOfSelectedNodes === 2) {
      relationFrom = relationReversed ? selectedNodes[1] : selectedNodes[0];
      relationTo = relationReversed ? selectedNodes[0] : selectedNodes[1];
    } else if (numberOfSelectedNodes === 1 && numberOfSelectedLinks === 1) {
      relationFrom = relationReversed ? selectedNodes[0] : selectedLinks[0];
      relationTo = relationReversed ? selectedLinks[0] : selectedNodes[0];
    }
    return (
      <Drawer
        anchor="bottom"
        variant="permanent"
        classes={{ paper: classes.bottomNav }}
      >
        <div
          style={{
            height: displayTimeRange ? 134 : 54,
            verticalAlign: 'top',
            transition: 'height 0.2s linear',
          }}
        >
          <div
            style={{
              verticalAlign: 'top',
              width: '100%',
              height: 54,
              paddingTop: 3,
            }}
          >
            <div
              style={{
                float: 'left',
                marginLeft: 185,
                height: '100%',
                display: 'flex',
              }}
            >
              <Tooltip
                title={
                  currentMode3D ? t('Disable 3D mode') : t('Enable 3D mode')
                }
              >
                <span>
                  <IconButton
                    color={currentMode3D ? 'secondary' : 'primary'}
                    onClick={handleToggle3DMode.bind(this)}
                  >
                    <Video3d />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip
                title={
                  currentModeTree
                    ? t('Disable tree mode')
                    : t('Enable tree mode')
                }
              >
                <span>
                  <IconButton
                    color={currentModeTree ? 'secondary' : 'primary'}
                    onClick={handleToggleTreeMode.bind(this)}
                    disabled={currentModeFixed}
                  >
                    <FamilyTree />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip
                title={
                  currentModeFixed ? t('Enable forces') : t('Disable forces')
                }
              >
                <span>
                  <IconButton
                    color={currentModeFixed ? 'primary' : 'secondary'}
                    onClick={handleToggleFixedMode.bind(this)}
                  >
                    <ScatterPlotOutlined />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={t('Display time range selector')}>
                <span>
                  <IconButton
                    color={displayTimeRange ? 'secondary' : 'primary'}
                    onClick={handleToggleDisplayTimeRange.bind(this)}
                  >
                    <DateRangeOutlined />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={t('Fit graph to canvas')}>
                <span>
                  <IconButton
                    color="primary"
                    onClick={handleZoomToFit.bind(this)}
                  >
                    <AspectRatio />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={t('Unfix the nodes and re-apply forces')}>
                <span>
                  <IconButton
                    color="primary"
                    onClick={handleResetLayout.bind(this)}
                    disabled={currentModeFixed}
                  >
                    <AutoFix />
                  </IconButton>
                </span>
              </Tooltip>
              <Divider className={classes.divider} orientation="vertical" />
              <Tooltip title={t('Filter entity types')}>
                <span>
                  <IconButton
                    color="primary"
                    onClick={this.handleOpenStixCoreObjectsTypes.bind(this)}
                  >
                    <FilterListOutlined />
                  </IconButton>
                </span>
              </Tooltip>
              <Popover
                classes={{ paper: classes.container }}
                open={openStixCoreObjectsTypes}
                anchorEl={anchorElStixCoreObjectsTypes}
                onClose={this.handleCloseStixCoreObjectsTypes.bind(this)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <List>
                  {stixCoreObjectsTypes.map((stixCoreObjectType) => (
                    <ListItem
                      key={stixCoreObjectType}
                      role={undefined}
                      dense={true}
                      button={true}
                      onClick={handleToggleStixCoreObjectType.bind(
                        this,
                        stixCoreObjectType,
                      )}
                    >
                      <ListItemIcon style={{ minWidth: 40 }}>
                        <Checkbox
                          edge="start"
                          checked={currentStixCoreObjectsTypes.includes(
                            stixCoreObjectType,
                          )}
                          disableRipple={true}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={t(`entity_${stixCoreObjectType}`)}
                      />
                    </ListItem>
                  ))}
                </List>
              </Popover>
              <Tooltip title={t('Filter marking definitions')}>
                <span>
                  <IconButton
                    color="primary"
                    onClick={this.handleOpenMarkedBy.bind(this)}
                  >
                    <CenterFocusStrongOutlined />
                  </IconButton>
                </span>
              </Tooltip>
              <Popover
                classes={{ paper: classes.container }}
                open={openMarkedBy}
                anchorEl={anchorElMarkedBy}
                onClose={this.handleCloseMarkedBy.bind(this)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <List>
                  {markedBy.map((markingDefinition) => (
                    <ListItem
                      key={markingDefinition.id}
                      role={undefined}
                      dense={true}
                      button={true}
                      onClick={handleToggleMarkedBy.bind(
                        this,
                        markingDefinition.id,
                      )}
                    >
                      <ListItemIcon style={{ minWidth: 40 }}>
                        <Checkbox
                          edge="start"
                          checked={currentMarkedBy.includes(
                            markingDefinition.id,
                          )}
                          disableRipple={true}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={truncate(markingDefinition.definition, 20)}
                      />
                    </ListItem>
                  ))}
                </List>
              </Popover>
              <Tooltip title={t('Filter authors (created by)')}>
                <span>
                  <IconButton
                    color="primary"
                    onClick={this.handleOpenCreatedBy.bind(this)}
                  >
                    <AccountBalanceOutlined />
                  </IconButton>
                </span>
              </Tooltip>
              <Popover
                classes={{ paper: classes.container }}
                open={openCreatedBy}
                anchorEl={anchorElCreatedBy}
                onClose={this.handleCloseCreatedBy.bind(this)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <List>
                  {createdBy.map((createdByRef) => (
                    <ListItem
                      key={createdBy.id}
                      role={undefined}
                      dense={true}
                      button={true}
                      onClick={handleToggleCreatedBy.bind(
                        this,
                        createdByRef.id,
                      )}
                    >
                      <ListItemIcon style={{ minWidth: 40 }}>
                        <Checkbox
                          edge="start"
                          checked={currentCreatedBy.includes(createdByRef.id)}
                          disableRipple={true}
                        />
                      </ListItemIcon>
                      <ListItemText primary={createdByRef.name} />
                    </ListItem>
                  ))}
                </List>
              </Popover>
              <Divider className={classes.divider} orientation="vertical" />
              <Tooltip title={t('Select by entity type')}>
                <span>
                  <IconButton
                    color="primary"
                    onClick={this.handleOpenSelectByType.bind(this)}
                  >
                    <SelectGroup />
                  </IconButton>
                </span>
              </Tooltip>
              <Popover
                classes={{ paper: classes.container }}
                open={openSelectByType}
                anchorEl={anchorElSelectByType}
                onClose={this.handleCloseSelectByType.bind(this)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <List>
                  {stixCoreObjectsTypes.map((stixCoreObjectType) => (
                    <ListItem
                      key={stixCoreObjectType}
                      role={undefined}
                      dense={true}
                      button={true}
                      onClick={this.handleSelectByType.bind(
                        this,
                        stixCoreObjectType,
                      )}
                    >
                      <ListItemText
                        primary={t(`entity_${stixCoreObjectType}`)}
                      />
                    </ListItem>
                  ))}
                </List>
              </Popover>
              <Tooltip title={t('Select all nodes')}>
                <span>
                  <IconButton
                    color="primary"
                    onClick={handleSelectAll.bind(this)}
                  >
                    <SelectAll />
                  </IconButton>
                </span>
              </Tooltip>
            </div>
            {report && (
              <div
                style={{
                  float: 'right',
                  display: 'flex',
                  height: '100%',
                }}
              >
                {onAdd && (
                  <ContainerAddStixCoreObjects
                    containerId={report.id}
                    containerStixCoreObjects={report.objects.edges}
                    knowledgeGraph={true}
                    defaultCreatedBy={R.propOr(null, 'createdBy', report)}
                    defaultMarkingDefinitions={R.map(
                      (n) => n.node,
                      R.pathOr([], ['objectMarking', 'edges'], report),
                    )}
                    targetStixCoreObjectTypes={[
                      'Stix-Domain-Object',
                      'Stix-Cyber-Observable',
                    ]}
                    onAdd={onAdd}
                    onDelete={onDelete}
                  />
                )}
                <Tooltip title={t('View the item')}>
                  <span>
                    <IconButton
                      color="primary"
                      component={Link}
                      target="_blank"
                      to={viewLink}
                      disabled={!viewEnabled}
                    >
                      <InfoOutlined />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={t('Edit the selected item')}>
                  <span>
                    <IconButton
                      color="primary"
                      onClick={this.handleOpenEditItem.bind(this)}
                      disabled={!editionEnabled}
                    >
                      <EditOutlined />
                    </IconButton>
                  </span>
                </Tooltip>
                <StixDomainObjectEdition
                  open={openEditEntity}
                  stixDomainObjectId={R.propOr(null, 'id', selectedNodes[0])}
                  handleClose={this.handleCloseEntityEdition.bind(this)}
                />
                <StixCoreRelationshipEdition
                  open={openEditRelation}
                  stixCoreRelationshipId={
                    R.propOr(null, 'id', selectedNodes[0])
                    || R.propOr(null, 'id', selectedLinks[0])
                  }
                  handleClose={this.handleCloseRelationEdition.bind(this)}
                />
                {onAddRelation && (
                  <Tooltip title={t('Create a relationship')}>
                    <span>
                      <IconButton
                        color="primary"
                        onClick={this.handleOpenCreateRelationship.bind(this)}
                        disabled={!relationEnabled}
                      >
                        <LinkOutlined />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
                {onAddRelation && (
                  <StixCoreRelationshipCreation
                    open={openCreatedRelation}
                    from={relationFrom}
                    to={relationTo}
                    firstSeen={lastLinkFirstSeen || dateFormat(report.published)}
                    lastSeen={lastLinkLastSeen || dateFormat(report.published)}
                    weight={report.confidence}
                    handleClose={this.handleCloseCreateRelationship.bind(this)}
                    handleResult={onAddRelation}
                    handleReverseRelation={this.handleReverseRelation.bind(this)}
                    defaultCreatedBy={R.propOr(null, 'createdBy', report)}
                    defaultMarkingDefinitions={R.map(
                      (n) => n.node,
                      R.pathOr([], ['objectMarking', 'edges'], report),
                    )}
                  />
                )}
                {handleDeleteSelected && (
                  <Tooltip title={t('Remove selected items')}>
                    <span>
                      <IconButton
                        color="primary"
                        onClick={this.handleOpenRemove.bind(this)}
                        disabled={
                          numberOfSelectedNodes === 0
                          && numberOfSelectedLinks === 0
                        }
                      >
                        <DeleteOutlined />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
                <Dialog
                  open={this.state.displayRemove}
                  keepMounted={true}
                  TransitionComponent={Transition}
                  onClose={this.handleCloseRemove.bind(this)}
                >
                  <DialogContent>
                    <DialogContentText>
                      {t(
                        'Do you want to remove these elements from this report?',
                      )}
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.handleCloseRemove.bind(this)}>
                      {t('Cancel')}
                    </Button>
                    <Button
                      onClick={() => {
                        this.handleCloseRemove();
                        handleDeleteSelected();
                      }}
                      color="primary"
                    >
                      {t('Remove')}
                    </Button>
                  </DialogActions>
                </Dialog>
              </div>
            )}
            <div className="clearfix" />
            <div style={{ height: '100%', padding: '30px 10px 0px 190px' }}>
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  bottom: -50,
                  left: 120,
                }}
              >
                <ResponsiveContainer width="100%" height={60}>
                  <ScatterChart
                    width="100%"
                    height={60}
                    margin={{
                      top: 32,
                      right: 150,
                      bottom: 0,
                      left: 0,
                    }}
                  >
                    <YAxis
                      type="number"
                      dataKey="index"
                      name="scatter"
                      height={10}
                      width={80}
                      tick={false}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ZAxis
                      type="number"
                      dataKey="value"
                      range={[15, 200]}
                      domain={parseDomain(timeRangeValues)}
                    />
                    <Scatter
                      data={timeRangeValues}
                      fill={ThemeDark.palette.primary.main}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <TimeRange
                ticksNumber={15}
                selectedInterval={selectedTimeRangeInterval}
                timelineInterval={timeRangeInterval}
                onUpdateCallback={() => null}
                onChangeCallback={handleTimeRangeChange}
                formatTick={dateFormat}
                containerClassName="timerange"
              />
            </div>
          </div>
        </div>
      </Drawer>
    );
  }
}

ReportKnowledgeGraphBar.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  report: PropTypes.object,
  handleToggle3DMode: PropTypes.func,
  currentMode3D: PropTypes.bool,
  handleToggleTreeMode: PropTypes.func,
  currentModeTree: PropTypes.bool,
  currentModeFixed: PropTypes.bool,
  handleToggleFixedMode: PropTypes.func,
  handleZoomToFit: PropTypes.func,
  handleToggleStixCoreObjectType: PropTypes.func,
  stixCoreObjectsTypes: PropTypes.array,
  currentStixCoreObjectsTypes: PropTypes.array,
  handleToggleMarkedBy: PropTypes.func,
  markedBy: PropTypes.array,
  currentMarkedBy: PropTypes.array,
  handleToggleCreatedBy: PropTypes.func,
  createdBy: PropTypes.array,
  currentCreatedBy: PropTypes.array,
  selectedNodes: PropTypes.array,
  selectedLinks: PropTypes.array,
  numberOfSelectedNodes: PropTypes.number,
  numberOfSelectedLinks: PropTypes.number,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
  onAddRelation: PropTypes.func,
  handleDeleteSelected: PropTypes.func,
  lastLinkFirstSeen: PropTypes.string,
  lastLinkLastSeen: PropTypes.string,
  handleCloseEntityEdition: PropTypes.func,
  handleCloseRelationEdition: PropTypes.func,
  handleSelectAll: PropTypes.func,
  handleSelectByType: PropTypes.func,
  handleResetLayout: PropTypes.func,
  displayTimeRange: PropTypes.bool,
  handleToggleDisplayTimeRange: PropTypes.func,
  handleTimeRangeChange: PropTypes.func,
  timeRangeInterval: PropTypes.array,
  selectedTimeRangeInterval: PropTypes.array,
  timeRangeValues: PropTypes.array,
};

export default R.compose(
  inject18n,
  withStyles(styles),
)(ReportKnowledgeGraphBar);
