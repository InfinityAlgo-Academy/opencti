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
import makeStyles from '@mui/styles/makeStyles';
import handleWidgetExportJson from './widgetExportHandler';
import { useFormatter } from '../../../../components/i18n';
import Security from '../../../../utils/Security';
import { EXPLORE_EXUPDATE } from '../../../../utils/hooks/useGranted';
import WidgetConfig from './WidgetConfig';
import Transition from '../../../../components/Transition';

const useStyles = makeStyles({
  container: {
    margin: 0,
    position: 'absolute',
    top: 0,
    right: 0,
  },
});

const WidgetPopover = ({
  onUpdate,
  onDuplicate,
  widget,
  onDelete,
  workspace,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const [anchorEl, setAnchorEl] = useState(null);
  const [displayDelete, setDisplayDelete] = useState(false);
  const [displayDuplicate, setDisplayDuplicate] = useState(false);
  const handleOpenDelete = () => {
    setDisplayDelete(true);
    setAnchorEl(null);
  };
  const handleOpenDuplicate = () => {
    setDisplayDuplicate(true);
    setAnchorEl(null);
  };

  const handleExportWidget = () => {
    handleWidgetExportJson(workspace.id, widget);
  };
  return (
    <div className={classes.container}>
      <IconButton
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          setAnchorEl(event.currentTarget);
        }}
        aria-haspopup="true"
        size="small"
      >
        <MoreVert fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        keepMounted={true}
        onClose={() => setAnchorEl(null)}
        className="noDrag"
      >
        <Security needs={[EXPLORE_EXUPDATE]}>
          <WidgetConfig
            closeMenu={() => setAnchorEl(null)}
            onComplete={onUpdate}
            widget={widget}
            workspace={workspace}
          />
          <MenuItem onClick={handleExportWidget}>{t('Export')}</MenuItem>
          <MenuItem onClick={handleOpenDuplicate}>{t('Duplicate')}</MenuItem>
          <MenuItem onClick={handleOpenDelete}>{t('Delete')}</MenuItem>
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
            {t('Do you want to delete this widget?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisplayDelete(false)}>{t('Cancel')}</Button>
          <Button onClick={onDelete} color="secondary">
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={displayDuplicate}
        PaperProps={{ elevation: 1 }}
        keepMounted={true}
        TransitionComponent={Transition}
        onClose={() => setDisplayDuplicate(false)}
        className="noDrag"
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to duplicate this widget?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisplayDuplicate(false)}>
            {t('Cancel')}
          </Button>
          <Button
            onClick={() => {
              setDisplayDuplicate(false);
              onDuplicate(widget);
            }}
            color="secondary"
          >
            {t('Duplicate')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default WidgetPopover;
