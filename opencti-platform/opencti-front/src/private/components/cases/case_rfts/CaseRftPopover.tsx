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
import { useNavigate } from 'react-router-dom-v5-compat';
import { PopoverProps } from '@mui/material/Popover';
import { useFormatter } from '../../../../components/i18n';
import Loader, { LoaderVariant } from '../../../../components/Loader';
import Security from '../../../../utils/Security';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import Transition from '../../../../components/Transition';
import { KNOWLEDGE_KNUPDATE_KNDELETE } from '../../../../utils/hooks/useGranted';
import useDeletion from '../../../../utils/hooks/useDeletion';
import CaseRftEditionContainer, { caseRftEditionQuery } from './CaseRftEditionContainer';
import { CaseRftEditionContainerCaseQuery } from './__generated__/CaseRftEditionContainerCaseQuery.graphql';

const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
  },
}));

const caseRftPopoverDeletionMutation = graphql`
  mutation CaseRftPopoverCaseDeletionMutation($id: ID!) {
    caseRftDelete(id: $id)
  }
`;

const CaseRftPopover = ({ id }: { id: string }) => {
  const classes = useStyles();
  const { t } = useFormatter();

  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<PopoverProps['anchorEl']>();
  const [displayEdit, setDisplayEdit] = useState<boolean>(false);

  const [commit] = useMutation(caseRftPopoverDeletionMutation);
  const queryRef = useQueryLoading<CaseRftEditionContainerCaseQuery>(
    caseRftEditionQuery,
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
        navigate('/dashboard/cases/rfts');
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
            {t('Do you want to delete this request for takedown?')}
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
          <CaseRftEditionContainer
            queryRef={queryRef}
            handleClose={handleCloseEdit}
            open={displayEdit}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default CaseRftPopover;
