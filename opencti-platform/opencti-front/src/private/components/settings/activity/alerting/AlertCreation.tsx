/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FunctionComponent, useState } from 'react';
import { BackupTableOutlined, CampaignOutlined } from '@mui/icons-material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDial from '@mui/material/SpeedDial';
import makeStyles from '@mui/styles/makeStyles';
import { useFormatter } from '../../../../../components/i18n';
import type { Theme } from '../../../../../components/Theme';
import AlertLiveCreation from './AlertLiveCreation';
import { AlertingPaginationQuery$variables } from './__generated__/AlertingPaginationQuery.graphql';
import { AlertLiveCreationActivityMutation$data } from './__generated__/AlertLiveCreationActivityMutation.graphql';
import AlertDigestCreation from './AlertDigestCreation';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles<Theme>((theme) => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 230,
    zIndex: 1100,
  },
  speedDialButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

interface TriggerCreationProps {
  contextual?: boolean;
  hideSpeedDial?: boolean;
  open?: boolean;
  handleClose?: () => void;
  inputValue?: string;
  paginationOptions?: AlertingPaginationQuery$variables;
  creationCallback?: (data: AlertLiveCreationActivityMutation$data) => void;
}

const AlertCreation: FunctionComponent<TriggerCreationProps> = ({
  contextual,
  hideSpeedDial,
  inputValue,
  paginationOptions,
  creationCallback,
  handleClose,
  open,
}) => {
  const { t_i18n } = useFormatter();
  const classes = useStyles();
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  // Live
  const [openLive, setOpenLive] = useState(false);
  const handleOpenCreateLive = () => {
    setOpenSpeedDial(false);
    setOpenLive(true);
  };
  // Digest
  const [openDigest, setOpenDigest] = useState(false);
  const handleOpenCreateDigest = () => {
    setOpenSpeedDial(false);
    setOpenDigest(true);
  };
  return (
    <>
      {hideSpeedDial !== true && (
        <SpeedDial
          className={classes.createButton}
          ariaLabel="Create"
          icon={<SpeedDialIcon />}
          onClose={() => setOpenSpeedDial(false)}
          onOpen={() => setOpenSpeedDial(true)}
          open={openSpeedDial}
          FabProps={{ color: 'secondary' }}
        >
          <SpeedDialAction
            title={t_i18n('Live trigger')}
            icon={<CampaignOutlined />}
            tooltipTitle={t_i18n('Create a live trigger')}
            onClick={handleOpenCreateLive}
            FabProps={{ classes: { root: classes.speedDialButton } }}
          />
          <SpeedDialAction
            title={t_i18n('Regular digest')}
            icon={<BackupTableOutlined />}
            tooltipTitle={t_i18n('Create a regular digest')}
            onClick={handleOpenCreateDigest}
            FabProps={{ classes: { root: classes.speedDialButton } }}
          />
        </SpeedDial>
      )}
      <AlertLiveCreation
        contextual={contextual}
        inputValue={inputValue}
        paginationOptions={paginationOptions}
        open={open !== undefined ? open : openLive}
        handleClose={() => {
          if (handleClose) {
            handleClose();
          } else {
            setOpenLive(false);
          }
        }}
        creationCallback={creationCallback}
      />
      <AlertDigestCreation
        contextual={contextual}
        inputValue={inputValue}
        paginationOptions={paginationOptions}
        open={openDigest}
        handleClose={() => setOpenDigest(false)}
      />
    </>
  );
};

export default AlertCreation;
