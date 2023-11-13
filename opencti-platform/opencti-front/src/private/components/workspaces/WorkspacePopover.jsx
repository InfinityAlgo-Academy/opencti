import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import MoreVert from '@mui/icons-material/MoreVert';
import { graphql, useMutation } from 'react-relay';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom-v5-compat';
import { useFormatter } from '../../../components/i18n';
import { QueryRenderer } from '../../../relay/environment';
import WorkspaceEditionContainer from './WorkspaceEditionContainer';
import Security from '../../../utils/Security';
import { EXPLORE_EXUPDATE_EXDELETE } from '../../../utils/hooks/useGranted';
import Transition from '../../../components/Transition';
import { deleteNode } from '../../../utils/store';
import handleExportJson from './workspaceExportHandler';

const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
  },
}));

const workspaceEditionQuery = graphql`
  query WorkspacePopoverContainerQuery($id: String!) {
    workspace(id: $id) {
      ...WorkspaceEditionContainer_workspace
    }
  }
`;

const WorkspacePopoverDeletionMutation = graphql`
  mutation WorkspacePopoverDeletionMutation($id: ID!) {
    workspaceDelete(id: $id)
  }
`;

const WorkspacePopover = ({ workspace, paginationOptions }) => {
  const { id, type } = workspace;
  const navigate = useNavigate();
  const classes = useStyles();
  const { t } = useFormatter();
  const [anchorEl, setAnchorEl] = useState(null);
  const [displayDelete, setDisplayDelete] = useState(false);
  const [displayEdit, setDisplayEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleOpenDelete = () => {
    setDisplayDelete(true);
    handleClose();
  };
  const handleCloseDelete = () => setDisplayDelete(false);
  const [commit] = useMutation(WorkspacePopoverDeletionMutation);
  const submitDelete = () => {
    setDeleting(true);
    commit({
      variables: { id },
      updater: (store) => {
        if (paginationOptions) {
          deleteNode(store, 'Pagination_workspaces', paginationOptions, id);
        }
      },
      onCompleted: () => {
        setDeleting(false);
        handleClose();
        if (paginationOptions) {
          handleCloseDelete();
        } else {
          navigate(`/dashboard/workspaces/${type}s`);
        }
      },
    });
  };
  const handleOpenEdit = () => {
    setDisplayEdit(true);
    handleClose();
  };
  const handleCloseEdit = () => setDisplayEdit(false);
  const userCanManage = workspace.currentUserAccessRight === 'admin';
  const userCanEdit = userCanManage || workspace.currentUserAccessRight === 'edit';
  if (!userCanEdit) {
    return <></>;
  }
  return (
    <div className={classes.container}>
      <IconButton
        onClick={handleOpen}
        aria-haspopup="true"
        size="large"
        style={{ marginTop: 3 }}
      >
        <MoreVert />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleOpenEdit}>{t('Update')}</MenuItem>
        <MenuItem onClick={() => handleExportJson(workspace)}>{t('Export')}</MenuItem>
        <Security needs={[EXPLORE_EXUPDATE_EXDELETE]} hasAccess={userCanManage}>
          <MenuItem onClick={handleOpenDelete}>{t('Delete')}</MenuItem>
        </Security>
      </Menu>
      <Dialog
        open={displayDelete}
        PaperProps={{ elevation: 1 }}
        keepMounted={true}
        TransitionComponent={Transition}
        onClose={handleCloseDelete}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this workspace?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} disabled={deleting}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitDelete} disabled={deleting}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <QueryRenderer
        query={workspaceEditionQuery}
        variables={{ id }}
        render={({ props: editionProps }) => {
          if (editionProps) {
            return (
              <WorkspaceEditionContainer
                workspace={editionProps.workspace}
                handleClose={handleCloseEdit}
                open={displayEdit}
              />
            );
          }
          return <div />;
        }}
      />
    </div>
  );
};

WorkspacePopover.propTypes = {
  workspace: PropTypes.object,
  paginationOptions: PropTypes.object,
};

export default WorkspacePopover;
