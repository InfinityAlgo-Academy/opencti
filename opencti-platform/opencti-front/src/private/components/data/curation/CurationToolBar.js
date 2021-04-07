import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import {
  compose,
  values,
  map,
  uniq,
  head,
  propOr,
  concat,
  pluck,
  flatten,
  pathOr,
  tail,
  filter,
  includes,
  isNil,
} from 'ramda';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { Close, Delete } from '@material-ui/icons';
import { Merge } from 'mdi-material-ui';
import Drawer from '@material-ui/core/Drawer';
import { ConnectionHandler } from 'relay-runtime';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Radio from '@material-ui/core/Radio';
import Alert from '@material-ui/lab/Alert/Alert';
import Chip from '@material-ui/core/Chip';
import { commitMutation, MESSAGING$ } from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import ItemIcon from '../../../../components/ItemIcon';
import { truncate } from '../../../../utils/String';
import ItemMarking from '../../../../components/ItemMarking';

const styles = (theme) => ({
  bottomNav: {
    zIndex: 1000,
    padding: '0 230px 0 180px',
    backgroundColor: theme.palette.navBottom.background,
    display: 'flex',
    height: 50,
  },
  title: {
    flex: '1 1 100%',
    fontSize: '12px',
  },
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    backgroundColor: theme.palette.navAlt.background,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: 0,
  },
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 230,
  },
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
  header: {
    backgroundColor: theme.palette.navAlt.backgroundHeader,
    padding: '20px 20px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
  },
  container: {
    padding: '10px 20px 20px 20px',
  },
  aliases: {
    margin: '0 7px 7px 0',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const curationToolBarDeletionMutation = graphql`
  mutation CurationToolBarDeletionMutation($id: [ID]!) {
    stixDomainObjectsDelete(id: $id)
  }
`;

const curationToolBarMergeMutation = graphql`
  mutation CurationToolBarMergeMutation(
    $id: ID!
    $stixCoreObjectsIds: [String]!
  ) {
    stixCoreObjectEdit(id: $id) {
      merge(stixCoreObjectsIds: $stixCoreObjectsIds) {
        id
      }
    }
  }
`;

class CurationToolBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayMerge: false,
      displayDelete: false,
      keptEntityId: null,
      merging: false,
      deleting: false,
    };
  }

  handleOpenMerge() {
    this.setState({ displayMerge: true });
  }

  handleCloseMerge() {
    this.setState({ displayMerge: false });
  }

  handleOpenDelete() {
    this.setState({ displayDelete: true });
  }

  handleCloseDelete() {
    this.setState({ displayDelete: false });
  }

  submitDelete() {
    this.setState({ deleting: true });
    const stixDomainObjectsIds = Object.keys(this.props.selectedElements);
    commitMutation({
      mutation: curationToolBarDeletionMutation,
      variables: {
        id: stixDomainObjectsIds,
      },
      updater: (store) => {
        const container = store.getRoot();
        const userProxy = store.get(container.getDataID());
        const conn = ConnectionHandler.getConnection(
          userProxy,
          'Pagination_stixDomainObjects',
          this.props.paginationOptions,
        );
        stixDomainObjectsIds.map((id) => ConnectionHandler.deleteNode(conn, id));
      },
      onCompleted: () => {
        this.setState({ deleting: false });
        this.props.handleResetSelectedElements();
        this.handleCloseDelete();

        MESSAGING$.notifySuccess(
          this.props.t('Successfully deleted selected entities'),
        );
      },
    });
  }

  handleChangeKeptEntityId(entityId) {
    this.setState({ keptEntityId: entityId });
  }

  submitMerge() {
    this.setState({ merging: true });
    const { selectedElements } = this.props;
    const { keptEntityId } = this.state;
    const stixDomainObjectsIds = Object.keys(selectedElements);
    const selectedElementsList = values(selectedElements);
    const keptElement = keptEntityId
      ? head(filter((n) => n.id === keptEntityId, selectedElementsList))
      : head(selectedElementsList);
    const filteredStixDomainObjectsIds = keptEntityId
      ? filter((n) => n !== keptEntityId, stixDomainObjectsIds)
      : tail(stixDomainObjectsIds);
    commitMutation({
      mutation: curationToolBarMergeMutation,
      variables: {
        id: keptElement.id,
        stixCoreObjectsIds: filteredStixDomainObjectsIds,
      },
      updater: (store) => {
        const container = store.getRoot();
        const userProxy = store.get(container.getDataID());
        const conn = ConnectionHandler.getConnection(
          userProxy,
          'Pagination_stixDomainObjects',
          this.props.paginationOptions,
        );
        filteredStixDomainObjectsIds.map((id) => ConnectionHandler.deleteNode(conn, id));
      },
      onCompleted: () => {
        this.setState({ merging: false });
        this.props.handleResetSelectedElements();
        this.handleCloseMerge();
        MESSAGING$.notifySuccess(
          this.props.t('Successfully merged selected entities'),
        );
      },
    });
  }

  render() {
    const { t, classes, selectedElements } = this.props;
    const { keptEntityId } = this.state;
    const notMergableTypes = ['Indicator', 'Note', 'Opinion', 'Observed-Data'];
    const numberOfSelectedElements = Object.keys(selectedElements).length;
    const typesAreDifferent = uniq(map((n) => n.entity_type, values(selectedElements))).length > 1;
    const typesAreNotMergable = includes(
      uniq(map((n) => n.entity_type, values(selectedElements)))[0],
      notMergableTypes,
    );
    const selectedElementsList = values(selectedElements);
    let keptElement = null;
    let newAliases = [];
    if (!typesAreNotMergable && !typesAreDifferent) {
      keptElement = keptEntityId
        ? head(filter((n) => n.id === keptEntityId, selectedElementsList))
        : head(selectedElementsList);
      if (keptElement) {
        const names = filter(
          (n) => n !== keptElement.name,
          pluck('name', selectedElementsList),
        );
        const aliases = !isNil(keptElement.aliases)
          ? filter(
            (n) => !isNil(n),
            flatten(pluck('aliases', selectedElementsList)),
          )
          : filter(
            (n) => !isNil(n),
            flatten(pluck('x_opencti_aliases', selectedElementsList)),
          );
        newAliases = filter((n) => n.length > 0, uniq(concat(names, aliases)));
      }
    }
    return (
      <Drawer
        anchor="bottom"
        variant="permanent"
        classes={{ paper: classes.bottomNav }}
      >
        <Toolbar style={{ minHeight: 54 }}>
          <Typography
            className={classes.title}
            color="inherit"
            variant="subtitle1"
          >
            {numberOfSelectedElements} {t('selected')}
          </Typography>
          <Tooltip title={t('Merge')}>
            <span>
              <IconButton
                aria-label="merge"
                disabled={
                  typesAreNotMergable
                  || typesAreDifferent
                  || numberOfSelectedElements < 2
                }
                onClick={this.handleOpenMerge.bind(this)}
                color="primary"
              >
                <Merge />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('Delete')}>
            <span>
              <IconButton
                aria-label="delete"
                disabled={numberOfSelectedElements === 0 || this.state.deleting}
                onClick={this.handleOpenDelete.bind(this)}
                color="primary"
              >
                <Delete />
              </IconButton>
            </span>
          </Tooltip>
        </Toolbar>
        <Drawer
          open={this.state.displayMerge}
          anchor="right"
          classes={{ paper: classes.drawerPaper }}
          onClose={this.handleCloseMerge.bind(this)}
        >
          <div className={classes.header}>
            <IconButton
              aria-label="Close"
              className={classes.closeButton}
              onClick={this.handleCloseMerge.bind(this)}
            >
              <Close fontSize="small" />
            </IconButton>
            <Typography variant="h6">{t('Merge entities')}</Typography>
          </div>
          <div className={classes.container}>
            <Typography
              variant="h4"
              gutterBottom={true}
              style={{ marginTop: 20 }}
            >
              {t('Selected entities')}
            </Typography>
            <List>
              {selectedElementsList.map((element) => (
                <ListItem key={element.id} dense={true} divider={true}>
                  <ListItemIcon>
                    <ItemIcon type={element.entity_type} />
                  </ListItemIcon>
                  <ListItemText
                    primary={element.name}
                    secondary={truncate(element.description, 60)}
                  />
                  <div style={{ marginRight: 50 }}>
                    {pathOr('', ['createdBy', 'name'], element)}
                  </div>
                  <div style={{ marginRight: 50 }}>
                    {pathOr([], ['objectMarking', 'edges'], element).length
                    > 0 ? (
                        map(
                          (markingDefinition) => (
                          <ItemMarking
                            key={markingDefinition.node.id}
                            label={markingDefinition.node.definition}
                            color={markingDefinition.node.x_opencti_color}
                            variant="inList"
                          />
                          ),
                          element.objectMarking.edges,
                        )
                      ) : (
                      <ItemMarking label="TLP:WHITE" variant="inList" />
                      )}
                  </div>
                  <ListItemSecondaryAction>
                    <Radio
                      checked={
                        keptEntityId
                          ? keptEntityId === element.id
                          : head(selectedElementsList).id === element.id
                      }
                      onChange={this.handleChangeKeptEntityId.bind(
                        this,
                        element.id,
                      )}
                      value="a"
                      name="radio-button-demo"
                      inputProps={{ 'aria-label': 'A' }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Typography
              variant="h4"
              gutterBottom={true}
              style={{ marginTop: 20 }}
            >
              {t('Merged entity')}
            </Typography>
            <Typography
              variant="h3"
              gutterBottom={true}
              style={{ marginTop: 20 }}
            >
              {t('Name')}
            </Typography>
            {propOr(null, 'name', keptElement)}
            <Typography
              variant="h3"
              gutterBottom={true}
              style={{ marginTop: 20 }}
            >
              {t('Aliases')}
            </Typography>
            {newAliases.map((label) => (label.length > 0 ? (
                <Chip
                  key={label}
                  classes={{ root: classes.aliases }}
                  label={label}
                />
            ) : (
              ''
            )))}
            <Typography
              variant="h3"
              gutterBottom={true}
              style={{ marginTop: 20 }}
            >
              {t('Author')}
            </Typography>
            {pathOr('', ['createdBy', 'name'], keptElement)}
            <Typography
              variant="h3"
              gutterBottom={true}
              style={{ marginTop: 20 }}
            >
              {t('Marking')}
            </Typography>
            {pathOr([], ['markingDefinitions', 'edges'], keptElement).length
            > 0 ? (
                map(
                  (markingDefinition) => (
                  <ItemMarking
                    key={markingDefinition.node.id}
                    label={markingDefinition.node.definition}
                  />
                  ),
                  pathOr([], ['objectMarking', 'edges'], keptElement),
                )
              ) : (
              <ItemMarking label="TLP:WHITE" />
              )}
            <Alert severity="warning" style={{ marginTop: 20 }}>
              {t(
                'The relations attached to selected entities will be copied to the merged entity.',
              )}
            </Alert>
            <div className={classes.buttons}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.submitMerge.bind(this)}
                classes={{ root: classes.button }}
                disabled={this.state.merging}
              >
                {t('Merge')}
              </Button>
            </div>
          </div>
        </Drawer>
        <Dialog
          open={this.state.displayDelete}
          keepMounted={true}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to delete these entities?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleCloseDelete.bind(this)}
              color="primary"
              disabled={this.state.deleting}
            >
              {t('Cancel')}
            </Button>
            <Button
              onClick={this.submitDelete.bind(this)}
              color="primary"
              disabled={this.state.deleting}
            >
              {t('Delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </Drawer>
    );
  }
}

CurationToolBar.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  paginationOptions: PropTypes.object,
  selectedElements: PropTypes.object,
  handleResetSelectedElements: PropTypes.func,
};

export default compose(inject18n, withStyles(styles))(CurationToolBar);
