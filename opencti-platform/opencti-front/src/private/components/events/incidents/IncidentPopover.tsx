import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MoreVert from '@mui/icons-material/MoreVert';
import { graphql, useMutation } from 'react-relay';
import makeStyles from '@mui/styles/makeStyles';
import { useNavigate } from 'react-router-dom-v5-compat';
import { PopoverProps } from '@mui/material/Popover';
import DialogContentText from '@mui/material/DialogContentText';
import { useFormatter } from '../../../../components/i18n';
import IncidentEditionContainer, { IncidentEditionQuery } from './IncidentEditionContainer';
import Loader, { LoaderVariant } from '../../../../components/Loader';
import Security from '../../../../utils/Security';
import Transition from '../../../../components/Transition';
import { KNOWLEDGE_KNUPDATE_KNDELETE } from '../../../../utils/hooks/useGranted';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import useDeletion from '../../../../utils/hooks/useDeletion';
import { IncidentEditionContainerQuery } from './__generated__/IncidentEditionContainerQuery.graphql';

const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
  },
}));

const IncidentPopoverDeletionMutation = graphql`
  mutation IncidentPopoverDeletionMutation($id: ID!) {
    incidentEdit(id: $id) {
      delete
    }
  }
`;

const IncidentPopover = ({ id }: { id: string }) => {
  const classes = useStyles();
  const { t } = useFormatter();

  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<PopoverProps['anchorEl']>();
  const [displayEdit, setDisplayEdit] = useState<boolean>(false);

  const [commit] = useMutation(IncidentPopoverDeletionMutation);
  const queryRef = useQueryLoading<IncidentEditionContainerQuery>(
    IncidentEditionQuery,
    { id },
  );
  const handleOpen = (event: React.SyntheticEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const handleOpenEdit = () => {
    setDisplayEdit(true);
    handleClose();
  };

  const handleCloseEdit = () => {
    setDisplayEdit(false);
  };

  const {
    deleting,
    handleOpenDelete,
    displayDelete,
    handleCloseDelete,
    setDeleting,
  } = useDeletion({ handleClose });

  const submitDelete = () => {
    setDeleting(true);
    commit({
      variables: {
        id,
      },
      onCompleted: () => {
        setDeleting(false);
        handleClose();
        navigate('/dashboard/events/incidents');
      },
    });
  };

  return (
    <div className={classes.container}>
      <IconButton
        onClick={handleOpen}
        aria-haspopup="true"
        style={{ marginTop: 3 }}
        size="large"
      >
        <MoreVert />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleOpenEdit}>{t('Update')}</MenuItem>
        <Security needs={[KNOWLEDGE_KNUPDATE_KNDELETE]}>
          <MenuItem onClick={handleOpenDelete}>{t('Delete')}</MenuItem>
        </Security>
      </Menu>
      <Dialog
        PaperProps={{ elevation: 1 }}
        open={displayDelete}
        keepMounted={true}
        TransitionComponent={Transition}
        onClose={handleCloseDelete}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this incident?')}
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
      {queryRef && (
        <React.Suspense
          fallback={<Loader variant={LoaderVariant.inElement} />}
        >
          <IncidentEditionContainer
            queryRef={queryRef}
            handleClose={handleCloseEdit}
            open={displayEdit}
          />
        </React.Suspense>
      )}
    </div>
  );
};
//
export default IncidentPopover;
