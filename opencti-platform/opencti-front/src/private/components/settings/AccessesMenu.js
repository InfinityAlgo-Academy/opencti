import React from 'react';
import * as PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Drawer from '@mui/material/Drawer';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import {
  CenterFocusStrongOutlined,
  GroupOutlined,
  PermIdentityOutlined,
  ReceiptOutlined,
  Security,
} from '@mui/icons-material';
import ListItemIcon from '@mui/material/ListItemIcon';
import inject18n from '../../../components/i18n';

const styles = (theme) => ({
  drawer: {
    minHeight: '100vh',
    width: 200,
    position: 'fixed',
    overflow: 'auto',
    padding: 0,
  },
  toolbar: theme.mixins.toolbar,
});

const SettingsMenu = (props) => {
  const { t, location, classes } = props;
  return (
    <Drawer
      variant="permanent"
      anchor="right"
      classes={{ paper: classes.drawer }}
    >
      <div className={classes.toolbar} />
      <MenuList component="nav">
        <MenuItem
          component={Link}
          to={'/dashboard/settings/accesses/roles'}
          selected={location.pathname === '/dashboard/settings/accesses/roles'}
          dense={false}
        >
          <ListItemIcon classes={{ root: classes.itemIcon }}>
            <Security fontSize="medium" />
          </ListItemIcon>
          <ListItemText primary={t('Roles')} />
        </MenuItem>
        <MenuItem
          component={Link}
          to={'/dashboard/settings/accesses/users'}
          selected={location.pathname.includes(
            '/dashboard/settings/management/users',
          )}
          dense={false}
        >
          <ListItemIcon classes={{ root: classes.itemIcon }}>
            <PermIdentityOutlined fontSize="medium" />
          </ListItemIcon>
          <ListItemText primary={t('Users')} />
        </MenuItem>
        <MenuItem
          component={Link}
          to={'/dashboard/settings/accesses/groups'}
          selected={location.pathname === '/dashboard/settings/accesses/groups'}
          dense={false}
        >
          <ListItemIcon classes={{ root: classes.itemIcon }}>
            <GroupOutlined fontSize="medium" />
          </ListItemIcon>
          <ListItemText primary={t('Groups')} />
        </MenuItem>
        <MenuItem
          component={Link}
          to={'/dashboard/settings/accesses/marking'}
          selected={
            location.pathname === '/dashboard/settings/accesses/marking'
          }
          dense={false}
        >
          <ListItemIcon classes={{ root: classes.itemIcon }}>
            <CenterFocusStrongOutlined fontSize="medium" />
          </ListItemIcon>
          <ListItemText primary={t('Marking definitions')} />
        </MenuItem>
        <MenuItem
          component={Link}
          to={'/dashboard/settings/accesses/sessions'}
          selected={
            location.pathname === '/dashboard/settings/accesses/sessions'
          }
          dense={false}
        >
          <ListItemIcon classes={{ root: classes.itemIcon }}>
            <ReceiptOutlined fontSize="medium" />
          </ListItemIcon>
          <ListItemText primary={t('Sessions')} />
        </MenuItem>
      </MenuList>
    </Drawer>
  );
};

SettingsMenu.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
};

export default compose(inject18n, withRouter, withStyles(styles))(SettingsMenu);
