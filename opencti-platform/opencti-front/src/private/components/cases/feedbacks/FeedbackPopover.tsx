import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import MoreVert from '@mui/icons-material/MoreVert';
import { graphql, useMutation } from 'react-relay';
import makeStyles from '@mui/styles/makeStyles';
import { useNavigate } from 'react-router-dom';
import { PopoverProps } from '@mui/material/Popover';
import { useFormatter } from '../../../../components/i18n';
import Loader, { LoaderVariant } from '../../../../components/Loader';
import { KnowledgeSecurity } from '../../../../utils/Security';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import Transition from '../../../../components/Transition';
import { KNOWLEDGE_KNUPDATE, KNOWLEDGE_KNUPDATE_KNDELETE } from '../../../../utils/hooks/useGranted';
import useDeletion from '../../../../utils/hooks/useDeletion';
import FeedbackEditionContainer, { feedbackEditionQuery } from './FeedbackEditionContainer';
import { FeedbackEditionContainerQuery } from './__generated__/FeedbackEditionContainerQuery.graphql';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
  },
}));

const feedbackPopoverDeletionMutation = graphql`
  mutation FeedbackPopoverDeletionMutation($id: ID!) {
    feedbackDelete(id: $id)
  }
`;

const FeedbackPopover = ({ id }: { id: string }) => {
  const classes = useStyles();
  const { t_i18n } = useFormatter();

  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<PopoverProps['anchorEl']>();
  const [displayEdit, setDisplayEdit] = useState<boolean>(false);

  const [commit] = useMutation(feedbackPopoverDeletionMutation);
  const queryRef = useQueryLoading<FeedbackEditionContainerQuery>(
    feedbackEditionQuery,
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
        navigate('/dashboard/cases/feedbacks');
      },
    });
  };

  return (
    <KnowledgeSecurity
      needs={[KNOWLEDGE_KNUPDATE, KNOWLEDGE_KNUPDATE_KNDELETE]}
      entity='Feedback'
    >
      <div className={classes.container}>
        <ToggleButton
          value="popover"
          size="small"
          onClick={handleOpen}
        >
          <MoreVert fontSize="small" color="primary" />
        </ToggleButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <KnowledgeSecurity needs={[KNOWLEDGE_KNUPDATE]} entity='Feedback'>
            <MenuItem onClick={handleOpenEdit}>{t_i18n('Update')}</MenuItem>
          </KnowledgeSecurity>
          <KnowledgeSecurity needs={[KNOWLEDGE_KNUPDATE_KNDELETE]} entity='Feedback'>
            <MenuItem onClick={handleOpenDelete}>{t_i18n('Delete')}</MenuItem>
          </KnowledgeSecurity>
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
              {t_i18n('Do you want to delete this feedback ?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDelete} disabled={deleting}>
              {t_i18n('Cancel')}
            </Button>
            <Button color="secondary" onClick={submitDelete} disabled={deleting}>
              {t_i18n('Delete')}
            </Button>
          </DialogActions>
        </Dialog>
        {queryRef && (
          <React.Suspense
            fallback={<Loader variant={LoaderVariant.inElement} />}
          >
            <FeedbackEditionContainer
              queryRef={queryRef}
              handleClose={handleClose}
              open={displayEdit}
            />
          </React.Suspense>
        )}
      </div>
    </KnowledgeSecurity>
  );
};

export default FeedbackPopover;
