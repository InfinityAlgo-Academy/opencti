import React, { useState } from 'react';
import MoreVert from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { graphql } from 'react-relay';
import { PopoverProps } from '@mui/material/Popover';
import { Link } from 'react-router-dom';
import { DraftsLinesPaginationQuery$variables } from '@components/drafts/__generated__/DraftsLinesPaginationQuery.graphql';
import { DraftPopoverDeleteMutation, DraftPopoverDeleteMutation$data } from '@components/drafts/__generated__/DraftPopoverDeleteMutation.graphql';
import useApiMutation from '../../../utils/hooks/useApiMutation';
import Transition from '../../../components/Transition';
import { KNOWLEDGE } from '../../../utils/hooks/useGranted';
import Security from '../../../utils/Security';
import { useFormatter } from '../../../components/i18n';
import { MESSAGING$ } from '../../../relay/environment';
import { deleteNode } from '../../../utils/store';
import { RelayError } from '../../../relay/relayTypes';

const draftPopoverDeleteMutation = graphql`
  mutation DraftPopoverDeleteMutation($id: ID!) {
    draftWorkspaceDelete(id: $id)
  }
`;

interface DraftPopoverProps {
  draftId: string;
  paginationOptions: DraftsLinesPaginationQuery$variables;
}

const DraftPopover: React.FC<DraftPopoverProps> = ({
  draftId,
  paginationOptions,
}) => {
  const { t_i18n } = useFormatter();
  const [anchorEl, setAnchorEl] = useState<PopoverProps['anchorEl']>();
  const [deleting, setDeleting] = useState<boolean>(false);
  const [displayDelete, setDisplayDelete] = useState<boolean>(false);
  const [commitDeletion] = useApiMutation<DraftPopoverDeleteMutation>(draftPopoverDeleteMutation);
  const handleOpenDelete = (event: React.SyntheticEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const submitDelete = () => {
    setDeleting(true);
    commitDeletion({
      variables: {
        id: draftId,
      },
      onCompleted: (response: DraftPopoverDeleteMutation$data) => {
        const elementId = response.draftWorkspaceDelete;
        MESSAGING$.notifySuccess(<span><Link to={`/dashboard/id/${elementId}`}>{t_i18n('Draft successfully deleted')}</Link></span>);
        setDeleting(false);
        handleClose();
      },
      onError: (error) => {
        const { errors } = (error as unknown as RelayError).res;
        MESSAGING$.notifyError(errors.at(0)?.message);
        setDeleting(false);
        handleClose();
      },
      updater: (store) => {
        deleteNode(store, 'Pagination_draftWorkspace', paginationOptions, draftId);
      },
    });
  };

  return (
    <div>
      <IconButton
        onClick={handleOpenDelete}
        aria-haspopup="true"
        size="large"
        color="primary"
        aria-label={t_i18n('Draft popover of actions')}
      >
        <MoreVert fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleClose}
      >
        <Security needs={[KNOWLEDGE]}>
          <MenuItem onClick={handleOpenDelete}>{t_i18n('Delete')}</MenuItem>
        </Security>
      </Menu>
      <Dialog
        open={displayDelete}
        PaperProps={{ elevation: 1 }}
        keepMounted={true}
        TransitionComponent={Transition}
        onClose={() => setDisplayDelete(false)}
        className="noDrag"
      >
        <DialogContent>
          <DialogContentText>
            {t_i18n('Do you want to delete this draft?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisplayDelete(false)}>{t_i18n('Cancel')}</Button>
          <Button onClick={submitDelete} disabled={deleting} color="secondary">
            {t_i18n('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DraftPopover;
