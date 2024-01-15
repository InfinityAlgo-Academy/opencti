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

const TopMenuProfile = () => {
  const location = useLocation();
  const { t_i18n } = useFormatter();
  const classes = useStyles();
  return (
    <>
      <Button
        component={Link}
        to="/dashboard/profile/me"
        size="small"
        variant={
          location.pathname === '/dashboard/profile/me' ? 'contained' : 'text'
        }
        classes={{ root: classes.button }}
      >
        {t_i18n('Profile')}
      </Button>
    </>
  );
};

export default TopMenuProfile;
