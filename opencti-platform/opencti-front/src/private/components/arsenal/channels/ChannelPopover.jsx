import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import { withRouter } from 'react-router-dom';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import MoreVert from '@mui/icons-material/MoreVert';
import { graphql } from 'react-relay';
import ToggleButton from '@mui/material/ToggleButton';
import StixCoreObjectEnrichment from '../../common/stix_core_objects/StixCoreObjectEnrichment';
import inject18n from '../../../../components/i18n';
import { commitMutation, QueryRenderer } from '../../../../relay/environment';
import { channelEditionQuery } from './ChannelEdition';
import ChannelEditionContainer from './ChannelEditionContainer';
import Security from '../../../../utils/Security';
import { KNOWLEDGE_KNENRICHMENT, KNOWLEDGE_KNUPDATE_KNDELETE } from '../../../../utils/hooks/useGranted';
import Transition from '../../../../components/Transition';

const ChannelPopoverDeletionMutation = graphql`
  mutation ChannelPopoverDeletionMutation($id: ID!) {
    channelDelete(id: $id)
  }
`;

class ChannelPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      displayDelete: false,
      displayEdit: false,
      displayEnrichment: false,
      deleting: false,
    };
  }

  handleOpen(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenDelete() {
    this.setState({ displayDelete: true });
    this.handleClose();
  }

  handleCloseDelete() {
    this.setState({ displayDelete: false });
  }

  submitDelete() {
    this.setState({ deleting: true });
    commitMutation({
      mutation: ChannelPopoverDeletionMutation,
      variables: {
        id: this.props.id,
      },
      onCompleted: () => {
        this.setState({ deleting: false });
        this.handleClose();
        this.props.history.push('/dashboard/arsenal/channels');
      },
    });
  }

  handleOpenEdit() {
    this.setState({ displayEdit: true });
    this.handleClose();
  }

  handleCloseEdit() {
    this.setState({ displayEdit: false });
  }

  handleOpenEnrichment() {
    this.setState({ displayEnrichment: true });
    this.handleClose();
  }

  handleCloseEnrichment() {
    this.setState({ displayEnrichment: false });
  }

  render() {
    const { t, id } = this.props;
    return (
      <>
        <ToggleButton
          value="popover"
          size="small"

          onClick={this.handleOpen.bind(this)}
        >
          <MoreVert fontSize="small" color="primary" />
        </ToggleButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleClose.bind(this)}
        >
          <MenuItem onClick={this.handleOpenEdit.bind(this)}>
            {t('Update')}
          </MenuItem>
          <Security needs={[KNOWLEDGE_KNENRICHMENT]}>
            <MenuItem onClick={this.handleOpenEnrichment.bind(this)}>
              {t('Enrich')}
            </MenuItem>
          </Security>
          <Security needs={[KNOWLEDGE_KNUPDATE_KNDELETE]}>
            <MenuItem onClick={this.handleOpenDelete.bind(this)}>
              {t('Delete')}
            </MenuItem>
          </Security>
        </Menu>
        <StixCoreObjectEnrichment stixCoreObjectId={id} open={this.state.displayEnrichment} handleClose={this.handleCloseEnrichment.bind(this)} />
        <Dialog
          PaperProps={{ elevation: 1 }}
          open={this.state.displayDelete}
          keepMounted={true}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to delete this channel?')}
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
        <QueryRenderer
          query={channelEditionQuery}
          variables={{ id }}
          render={({ props }) => {
            if (props) {
              return (
                <ChannelEditionContainer
                  channel={props.channel}
                  handleClose={this.handleCloseEdit.bind(this)}
                  open={this.state.displayEdit}
                />
              );
            }
            return <div />;
          }}
        />
      </>
    );
  }
}

ChannelPopover.propTypes = {
  id: PropTypes.string,
  classes: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(inject18n, withRouter)(ChannelPopover);
