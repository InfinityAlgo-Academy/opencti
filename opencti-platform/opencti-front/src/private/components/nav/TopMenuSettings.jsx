import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import makeStyles from '@mui/styles/makeStyles';
import { useFormatter } from '../../../components/i18n';
import Security from '../../../utils/Security';
import {
  VIRTUAL_ORGANIZATION_ADMIN, SETTINGS,
  SETTINGS_SETACCESSES,
  SETTINGS_SETLABELS,
  SETTINGS_SETMARKINGS,
} from '../../../utils/hooks/useGranted';

const useStyles = makeStyles((theme) => ({
  button: {
    marginRight: theme.spacing(2),
    padding: '0 5px 0 5px',
    minHeight: 20,
    minWidth: 20,
    textTransform: 'none',
  },
}));

const TopMenuSettings = () => {
  const { t } = useFormatter();
  const location = useLocation();
  const classes = useStyles();

  return (
    <div>
      <Security needs={[SETTINGS]}>
        <Button
          component={Link}
          size="small"
          to="/dashboard/settings"
          variant={
            location.pathname === '/dashboard/settings'
            || location.pathname === '/dashboard/settings/about'
              ? 'contained'
              : 'text'
          }
          color={
            location.pathname === '/dashboard/settings'
            || location.pathname === '/dashboard/settings/about'
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
        >
          {t('Parameters')}
        </Button>
      </Security>
      <Security needs={[SETTINGS_SETMARKINGS, SETTINGS_SETACCESSES, VIRTUAL_ORGANIZATION_ADMIN]}>
        <Button
          component={Link}
          size="small"
          to="/dashboard/settings/accesses"
          variant={
            location.pathname.includes('/dashboard/settings/accesses')
              ? 'contained'
              : 'text'
          }
          color={
            location.pathname.includes('/dashboard/settings/accesses')
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
        >
          {t('Security')}
        </Button>
      </Security>
      <Security needs={[SETTINGS]}>
        <Button
          component={Link}
          size="small"
          to="/dashboard/settings/customization"
          variant={
            location.pathname.includes('/dashboard/settings/customization')
              ? 'contained'
              : 'text'
          }
          color={
            location.pathname.includes('/dashboard/settings/customization')
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
        >
          {t('Customization')}
        </Button>
      </Security>
      <Security needs={[SETTINGS_SETLABELS]}>
        <Button
          component={Link}
          size="small"
          to="/dashboard/settings/vocabularies"
          variant={
            location.pathname.includes('/dashboard/settings/vocabularies')
              ? 'contained'
              : 'text'
          }
          color={
            location.pathname.includes('/dashboard/settings/vocabularies')
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
        >
          {t('Taxonomies')}
        </Button>
      </Security>
      <Security needs={[SETTINGS]}>
        <Button
          component={Link}
          size="small"
          to="/dashboard/settings/activity"
          variant={
            location.pathname.includes('/dashboard/settings/activity')
              ? 'contained'
              : 'text'
          }
          color={
            location.pathname.includes('/dashboard/settings/activity')
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
        >
          {t('Activity')}
        </Button>
      </Security>
      <Security needs={[SETTINGS]}>
        <Button
          component={Link}
          size="small"
          to="/dashboard/settings/file_indexing"
          variant={
            location.pathname.includes('/dashboard/settings/file_indexing')
              ? 'contained'
              : 'text'
          }
          color={
            location.pathname.includes('/dashboard/settings/file_indexing')
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
        >
          {t('File indexing')}
        </Button>
      </Security>
    </div>
  );
};

export default TopMenuSettings;
