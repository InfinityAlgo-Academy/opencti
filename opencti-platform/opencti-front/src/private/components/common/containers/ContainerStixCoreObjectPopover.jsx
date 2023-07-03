import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { compose } from 'ramda';
import { graphql } from 'react-relay';
import withStyles from '@mui/styles/withStyles';
import withTheme from '@mui/styles/withTheme';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Slide from '@mui/material/Slide';
import MoreVert from '@mui/icons-material/MoreVert';
import { ConnectionHandler } from 'relay-runtime';
import Alert from '@mui/material/Alert';
import inject18n from '../../../../components/i18n';
import { commitMutation } from '../../../../relay/environment';
import { KNOWLEDGE_KNUPDATE_KNDELETE } from '../../../../utils/hooks/useGranted';
import Security from '../../../../utils/Security';
import { encodeMappingData } from '../../../../utils/Graph';
import { deleteElementByValue } from '../../../../utils/utils';

const styles = (theme) => ({
  container: {
    margin: 0,
  },
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    overflow: 'auto',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: 0,
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

export const containerStixCoreObjectPopoverRemoveMutation = graphql`
  mutation ContainerStixCoreObjectPopoverRemoveMutation(
    $id: ID!
    $toId: StixRef!
    $relationship_type: String!
  ) {
    containerEdit(id: $id) {
      relationDelete(toId: $toId, relationship_type: $relationship_type) {
        id
      }
    }
  }
`;

export const containerStixCoreObjectPopoverFieldPatchMutation = graphql`
  mutation ContainerStixCoreObjectPopoverFieldPatchMutation(
    $id: ID!
    $input: [EditInput!]!
  ) {
    stixDomainObjectEdit(id: $id) {
      fieldPatch(input: $input) {
        ... on Report {
          content_mapping
        }
        ... on Case {
          content_mapping
        }
        ... on Grouping {
          content_mapping
        }
      }
    }
  }
`;

export const containerStixCoreObjectPopoverDeleteMutation = graphql`
  mutation ContainerStixCoreObjectPopoverDeleteMutation($id: ID!) {
    stixCoreObjectEdit(id: $id) {
      delete
    }
  }
`;

class ContainerStixCoreObjectPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      displayDeleteMapping: false,
      displayRemove: false,
      displayDelete: false,
      removing: false,
      deleting: false,
      deletingMapping: false,
    };
  }

  handleOpen(event) {
    this.setState({ anchorEl: event.currentTarget });
    event.stopPropagation();
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenRemove() {
    this.setState({ displayRemove: true });
    this.handleClose();
  }

  handleCloseRemove() {
    this.setState({ removing: false, displayRemove: false });
  }

  handleOpenDeleteMapping() {
    this.setState({ displayDeleteMapping: true });
    this.handleClose();
  }

  handleCloseDeleteMapping() {
    this.setState({ deletingMapping: false, displayDeleteMapping: false });
  }

  handleOpenDelete() {
    this.setState({ displayDelete: true });
    this.handleClose();
  }

  handleCloseDelete() {
    this.setState({ deleting: false, displayDelete: false });
  }

  submitDeleteMapping() {
    const { containerId, toStandardId, contentMappingData } = this.props;
    this.setState({ removing: true });
    const newMappingData = deleteElementByValue(contentMappingData, toStandardId);
    commitMutation({
      mutation: containerStixCoreObjectPopoverFieldPatchMutation,
      variables: {
        id: containerId,
        input: {
          key: 'content_mapping',
          value: encodeMappingData(newMappingData),
        },
      },
      onCompleted: () => {
        this.handleCloseDeleteMapping();
      },
    });
  }

  submitRemove() {
    const {
      containerId,
      toId,
      relationshipType,
      paginationKey,
      paginationOptions,
      selectedElements,
      setSelectedElements,
    } = this.props;
    this.setState({ removing: true });
    commitMutation({
      mutation: containerStixCoreObjectPopoverRemoveMutation,
      variables: {
        id: containerId,
        toId,
        relationship_type: relationshipType,
      },
      updater: (store) => {
        // ID is not valid pagination options, will be handled better when hooked
        const options = { ...paginationOptions };
        delete options.id;
        delete options.count;
        if (toId) {
          const conn = ConnectionHandler.getConnection(
            store.get(containerId),
            paginationKey,
            options,
          );
          ConnectionHandler.deleteNode(conn, toId);
        }
      },
      onCompleted: () => {
        this.submitDeleteMapping();
        this.handleCloseRemove();
        const newSelectedElements = R.omit([toId], selectedElements);
        setSelectedElements?.(newSelectedElements);
      },
    });
  }

  submitDelete() {
    const {
      containerId,
      toId,
      paginationKey,
      paginationOptions,
      selectedElements,
      setSelectedElements,
    } = this.props;
    this.setState({ deleting: true });
    commitMutation({
      mutation: containerStixCoreObjectPopoverDeleteMutation,
      variables: {
        id: toId,
      },
      updater: (store) => {
        // ID is not valid pagination options, will be handled better when hooked
        const options = { ...paginationOptions };
        delete options.id;
        delete options.count;
        if (toId) {
          const conn = ConnectionHandler.getConnection(
            store.get(containerId),
            paginationKey,
            options,
          );
          ConnectionHandler.deleteNode(conn, toId);
        }
      },
      onCompleted: () => {
        this.submitDeleteMapping();
        this.handleCloseDelete();
        const newSelectedElements = R.omit([toId], selectedElements);
        setSelectedElements?.(newSelectedElements);
      },
    });
  }

  render() {
    const { classes, t, theme, contentMappingData, mapping } = this.props;
    return (
      <div className={classes.container}>
        <IconButton
          onClick={this.handleOpen.bind(this)}
          disabled={this.props.menuDisable ?? false}
          aria-haspopup="true"
          size="large"
        >
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleClose.bind(this)}
        >
          {contentMappingData && mapping && mapping > 0 && (
            <MenuItem onClick={this.handleOpenDeleteMapping.bind(this)}>
              {t('Delete mapping')}
            </MenuItem>
          )}
          <MenuItem onClick={this.handleOpenRemove.bind(this)}>
            {t('Remove')}
          </MenuItem>
          <Security needs={[KNOWLEDGE_KNUPDATE_KNDELETE]}>
            <MenuItem
              onClick={this.handleOpenDelete.bind(this)}
              style={{ color: theme.palette.warning.main }}
            >
              {t('Delete')}
            </MenuItem>
          </Security>
        </Menu>
        <Dialog
          PaperProps={{ elevation: 1 }}
          open={this.state.displayDeleteMapping}
          keepMounted={true}
          TransitionComponent={Transition}
          onClose={this.handleCloseDeleteMapping.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to delete the mapping for this entity?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleCloseDeleteMapping.bind(this)}
              disabled={this.state.deletingMapping}
            >
              {t('Cancel')}
            </Button>
            <Button
              color="secondary"
              onClick={this.submitDeleteMapping.bind(this)}
              disabled={this.state.deletingMapping}
            >
              {t('Delete mapping')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          PaperProps={{ elevation: 1 }}
          open={this.state.displayRemove}
          keepMounted={true}
          TransitionComponent={Transition}
          onClose={this.handleCloseRemove.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to remove the entity from this container?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleCloseRemove.bind(this)}
              disabled={this.state.removing}
            >
              {t('Cancel')}
            </Button>
            <Button
              color="secondary"
              onClick={this.submitRemove.bind(this)}
              disabled={this.state.removing}
            >
              {t('Remove')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          PaperProps={{ elevation: 1 }}
          open={this.state.displayDelete}
          keepMounted={true}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to delete this entity?')}
              <Alert severity="warning" style={{ marginTop: 20 }}>
                {t(
                  'You are about to completely delete the entity from the platform (not only from the container), be sure of what you are doing.',
                )}
              </Alert>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleCloseDelete.bind(this)}
              disabled={this.state.deleting}
            >
              {t('Cancel')}
            </Button>
            <Button
              color="secondary"
              onClick={this.submitDelete.bind(this)}
              disabled={this.state.deleting}
            >
              {t('Delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

ContainerStixCoreObjectPopover.propTypes = {
  containerId: PropTypes.string,
  toId: PropTypes.string,
  toStandardId: PropTypes.string,
  relationshipType: PropTypes.string,
  paginationKey: PropTypes.string,
  paginationOptions: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  selectedElements: PropTypes.object,
  setSelectedElements: PropTypes.func,
  contentMappingData: PropTypes.object,
  mapping: PropTypes.number,
};

export default compose(
  inject18n,
  withTheme,
  withStyles(styles),
)(ContainerStixCoreObjectPopover);
