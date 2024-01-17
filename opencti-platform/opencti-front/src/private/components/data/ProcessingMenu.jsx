import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import makeStyles from '@mui/styles/makeStyles';
import EEMenu from '../common/entreprise_edition/EEMenu';
import { useFormatter } from '../../../components/i18n';
import useAuth from '../../../utils/hooks/useAuth';
import { useSettingsMessagesBannerHeight } from '../settings/settings_messages/SettingsMessagesBanner';
import useGranted, { KNOWLEDGE_KNUPDATE, SETTINGS_SETACCESSES, TAXIIAPI_SETCSVMAPPERS } from '../../../utils/hooks/useGranted';
import BreadcrumbHeader from '../../../components/BreadcrumbHeader';

const useStyles = makeStyles((theme) => ({
  drawer: {
    minHeight: '100vh',
    width: 200,
    position: 'fixed',
    overflow: 'auto',
    padding: 0,
  },
  toolbar: theme.mixins.toolbar,
  header: {
    paddingBottom: 25,
    color: theme.palette.mode === 'light'
      ? theme.palette.common.black
      : theme.palette.primary.main,
    fontSize: '24px',
    fontWeight: 'bold',
  },
}));

const ProcessingMenu = () => {
  const location = useLocation();
  const classes = useStyles();
  const { t_i18n } = useFormatter();
  const {
    bannerSettings: { bannerHeightNumber },
  } = useAuth();
  const settingsMessagesBannerHeight = useSettingsMessagesBannerHeight();
  const isAdministrator = useGranted([SETTINGS_SETACCESSES]);
  const isKnowledgeUpdater = useGranted([KNOWLEDGE_KNUPDATE]);
  const isCsvMapperUpdater = useGranted([TAXIIAPI_SETCSVMAPPERS]);
  const path = [
    { text: t_i18n('Data') },
    { text: t_i18n('Processing') },
  ];
  const lastPath = location.pathname.split('/').slice(-1)[0];
  let currentPath;
  switch (lastPath) {
    case 'tasks': currentPath = 'Tasks';
      break;
    case 'csv_mapper': currentPath = 'CSV Mappers';
      break;
    default: currentPath = 'Playbooks';
  }
  return (
    <>
      <BreadcrumbHeader path={path}>
        <div className={ classes.header }>
          {t_i18n(currentPath)}
        </div>
      </BreadcrumbHeader>
      <Drawer
        variant="permanent"
        anchor="right"
        classes={{ paper: classes.drawer }}
      >
        <div className={classes.toolbar} />
        <MenuList
          component="nav"
          style={{ marginTop: bannerHeightNumber + settingsMessagesBannerHeight }}
          sx={{ marginBottom: bannerHeightNumber }}
        >
          {isAdministrator && (
            <MenuItem
              component={Link}
              to={'/dashboard/data/processing/automation'}
              selected={location.pathname.includes(
                '/dashboard/data/processing/automation',
              )}
              dense={false}
            >
              <ListItemText primary={<EEMenu>{t_i18n('Automation')}</EEMenu>} />
            </MenuItem>
          )}
          {isKnowledgeUpdater && (
            <MenuItem
              component={Link}
              to={'/dashboard/data/processing/tasks'}
              selected={location.pathname === '/dashboard/data/processing/tasks'}
              dense={false}
            >
              <ListItemText primary={t_i18n('Tasks')} />
            </MenuItem>
          )}
          {isCsvMapperUpdater && (
            <MenuItem
              component={Link}
              to={'/dashboard/data/processing/csv_mapper'}
              selected={location.pathname.includes(
                '/dashboard/data/processing/csv_mapper',
              )}
              dense={false}
            >
              <ListItemText primary={t_i18n('CSV Mappers')} />
            </MenuItem>
          )}
        </MenuList>
      </Drawer>
    </>
  );
};

export default ProcessingMenu;
