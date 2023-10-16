import React, { FunctionComponent, useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import Menu from '@mui/material/Menu';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Slide, { SlideProps } from '@mui/material/Slide';
import { MoreVertOutlined } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import { useNavigate } from 'react-router-dom-v5-compat';
import { useFormatter } from '../../../../components/i18n';
import { QueryRenderer } from '../../../../relay/environment';
import Loader, { LoaderVariant } from '../../../../components/Loader';
import ExternalReferenceEditionContainer from './ExternalReferenceEditionContainer';
import { ExternalReferencePopoverEditionQuery$data } from './__generated__/ExternalReferencePopoverEditionQuery.graphql';
import { deleteNodeFromId } from '../../../../utils/store';

const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
  },
}));

const Transition = React.forwardRef((props: SlideProps, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

export const externalReferencePopoverDeletionMutation = graphql`
  mutation ExternalReferencePopoverDeletionMutation($id: ID!) {
    externalReferenceEdit(id: $id) {
      delete
    }
  }
`;

const externalReferenceEditionQuery = graphql`
  query ExternalReferencePopoverEditionQuery($id: String!) {
    externalReference(id: $id) {
      ...ExternalReferenceEditionContainer_externalReference
    }
  }
`;

interface ExternalReferencePopoverProps {
  id: string;
  objectId?: string;
  handleRemove: (() => void) | undefined;
  isExternalReferenceAttachment?: boolean;
}

const ExternalReferencePopover: FunctionComponent<ExternalReferencePopoverProps> = ({ id, objectId, handleRemove, isExternalReferenceAttachment }) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [displayEdit, setDisplayEdit] = useState(false);
  const [displayDelete, setDisplayDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [commit] = useMutation(externalReferencePopoverDeletionMutation);
  const handleOpen = (event: React.SyntheticEvent) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleOpenUpdate = () => {
    setDisplayEdit(true);
    handleClose();
  };
  const handleCloseUpdate = () => {
    setDisplayEdit(false);
  };
  const handleOpenDelete = () => {
    setDisplayDelete(true);
    handleClose();
  };
  const handleCloseDelete = () => {
    setDisplayDelete(false);
  };
  const submitDelete = () => {
    setDeleting(true);
    commit({
      variables: {
        id,
      },
      updater: (store) => {
        if (handleRemove && objectId) {
          deleteNodeFromId(
            store,
            objectId,
            'Pagination_externalReferences',
            undefined,
            id,
          );
        }
      },
      onCompleted: () => {
        setDeleting(false);
        handleClose();
        if (handleRemove) {
          handleCloseDelete();
        } else {
          navigate('/dashboard/analyses/external_references');
        }
      },
    });
  };
  return (
    <span className={classes.container}>
      <IconButton
        onClick={handleOpen}
        aria-haspopup="true"
        style={{ marginTop: 3 }}
        size="large"
      >
        <MoreVertOutlined />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleOpenUpdate}>{t('Update')}</MenuItem>
        {handleRemove && !isExternalReferenceAttachment && (
          <MenuItem
            onClick={() => {
              handleRemove();
              handleClose();
            }}
          >
            {t('Remove from this object')}
          </MenuItem>
        )}
        <MenuItem onClick={handleOpenDelete}>{t('Delete')}</MenuItem>
      </Menu>
      <QueryRenderer
        query={externalReferenceEditionQuery}
        variables={{ id }}
        render={({
          props,
        }: {
          props: ExternalReferencePopoverEditionQuery$data;
        }) => {
          if (props && props.externalReference) {
            return (
              <ExternalReferenceEditionContainer
                externalReference={props.externalReference}
                handleClose={handleCloseUpdate}
                open={displayEdit}
              />
            );
          }
          return <Loader variant={LoaderVariant.inElement} />;
        }}
      />
      <Dialog
        PaperProps={{ elevation: 1 }}
        open={displayDelete}
        keepMounted={true}
        TransitionComponent={Transition}
        onClose={handleCloseDelete}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this external reference?')}
            {isExternalReferenceAttachment && (
              <Alert
                severity="warning"
                variant="outlined"
                style={{ position: 'relative', marginTop: 20 }}
              >
                {t(
                  'This external reference is linked to a file. If you delete it, the file will be deleted as well.',
                )}
              </Alert>
            )}
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
    </span>
  );
};

export default ExternalReferencePopover;
