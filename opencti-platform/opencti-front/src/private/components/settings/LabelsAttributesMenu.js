import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import inject18n from '../../../components/i18n';

const styles = (theme) => ({
  drawer: {
    minHeight: '100vh',
    width: 200,
    position: 'fixed',
    overflow: 'auto',
    padding: 0,
    backgroundColor: theme.palette.background.navLight,
  },
  toolbar: theme.mixins.toolbar,
});

class LabelsAttributesMenu extends Component {
  render() {
    const { t, location, classes } = this.props;
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
            to={'/dashboard/settings/attributes/labels'}
            selected={
              location.pathname === '/dashboard/settings/attributes/labels'
            }
            dense={false}
          >
            <ListItemText primary={t('Labels')} />
          </MenuItem>
          <MenuItem
            component={Link}
            to={'/dashboard/settings/attributes/report_types'}
            selected={
              location.pathname
              === '/dashboard/settings/attributes/report_types'
            }
            dense={false}
          >
            <ListItemText primary={t('Report types')} />
          </MenuItem>
        </MenuList>
      </Drawer>
    );
  }
}

LabelsAttributesMenu.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(LabelsAttributesMenu);
