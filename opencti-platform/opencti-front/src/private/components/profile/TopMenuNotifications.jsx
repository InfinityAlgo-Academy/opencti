import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import makeStyles from '@mui/styles/makeStyles';
import { useFormatter } from '../../../components/i18n';

const useStyles = makeStyles((theme) => ({
  button: {
    marginRight: theme.spacing(2),
    padding: '0 5px 0 5px',
    minHeight: 20,
    minWidth: 20,
    textTransform: 'none',
  },
}));

const TopMenuNotifications = () => {
  const location = useLocation();
  const { t_i18n } = useFormatter();
  const classes = useStyles();
  return (
    <>
      <Button
        component={Link}
        to="/dashboard/profile/notifications"
        size="small"
        variant={
          location.pathname === '/dashboard/profile/notifications'
            ? 'contained'
            : 'text'
        }
        classes={{ root: classes.button }}
      >
        {t_i18n('Notifications')}
      </Button>
      <Button
        component={Link}
        to="/dashboard/profile/triggers"
        size="small"
        variant={
          location.pathname === '/dashboard/profile/triggers'
            ? 'contained'
            : 'text'
        }
        classes={{ root: classes.button }}
      >
        {t_i18n('Triggers and digests')}
      </Button>
    </>
  );
};

export default TopMenuNotifications;
