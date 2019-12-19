import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Drawer from '@material-ui/core/Drawer';
import inject18n from '../../../../components/i18n';

const styles = (theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    width: 250,
    padding: '0 0 20px 0',
    position: 'fixed',
    backgroundColor: theme.palette.navAlt.background,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  listIcon: {
    marginRight: 0,
  },
  item: {
    padding: '0 0 0 10px',
  },
  itemField: {
    padding: '0 15px 0 15px',
  },
  toolbar: theme.mixins.toolbar,
});

class IndicatorsRightBar extends Component {
  render() {
    const {
      classes,
      t,
      types,
      handleToggle,
    } = this.props;
    return (
      <Drawer
        variant="permanent"
        anchor="right"
        classes={{ paper: classes.drawerPaper }}
      >
        <div className={classes.toolbar} />
        <List
          subheader={
            <ListSubheader component="div">
              {t('Indicator types')}
            </ListSubheader>
          }
        >
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggle.bind(this, 'Autonomous-System')}
            classes={{ root: classes.item }}
          >
            <Checkbox checked={types.includes('Autonomous-System')} disableRipple={true} />
            <ListItemText primary={t('Autonomous systems')} />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggle.bind(this, 'Domain')}
            classes={{ root: classes.item }}
          >
            <Checkbox checked={types.includes('Domain')} disableRipple={true} />
            <ListItemText primary={t('Domain names')} />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggle.bind(this, 'IPv4-Addr')}
            classes={{ root: classes.item }}
          >
            <Checkbox
              checked={types.includes('IPv4-Addr')}
              disableRipple={true}
            />
            <ListItemText primary={t('IPv4 addresses')} />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggle.bind(this, 'IPv6-Addr')}
            classes={{ root: classes.item }}
          >
            <Checkbox
              checked={types.includes('IPv6-Addr')}
              disableRipple={true}
            />
            <ListItemText primary={t('IPv6 addresses')} />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggle.bind(this, 'URL')}
            classes={{ root: classes.item }}
          >
            <Checkbox checked={types.includes('URL')} disableRipple={true} />
            <ListItemText primary={t('URL')} />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggle.bind(this, 'Email*')}
            classes={{ root: classes.item }}
          >
            <Checkbox checked={types.includes('Email*')} disableRipple={true} />
            <ListItemText primary={t('Emails')} />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggle.bind(this, 'Mutex')}
            classes={{ root: classes.item }}
          >
            <Checkbox checked={types.includes('Mutex')} disableRipple={true} />
            <ListItemText primary={t('Mutex')} />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggle.bind(this, 'File*')}
            classes={{ root: classes.item }}
          >
            <Checkbox checked={types.includes('File*')} disableRipple={true} />
            <ListItemText primary={t('Files')} />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggle.bind(this, 'Registry-Key*')}
            classes={{ root: classes.item }}
          >
            <Checkbox checked={types.includes('Registry-Key*')} disableRipple={true} />
            <ListItemText primary={t('Registry')} />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggle.bind(this, 'PDB-Path')}
            classes={{ root: classes.item }}
          >
            <Checkbox checked={types.includes('PDB-Path')} disableRipple={true} />
            <ListItemText primary={t('PDB Path')} />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggle.bind(this, 'Windows-Service')}
            classes={{ root: classes.item }}
          >
            <Checkbox checked={types.includes('Windows-Service')} disableRipple={true} />
            <ListItemText primary={t('Windows services')} />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggle.bind(this, 'Windows-Scheduled-Task')}
            classes={{ root: classes.item }}
          >
            <Checkbox checked={types.includes('Windows-Scheduled-Task')} disableRipple={true} />
            <ListItemText primary={t('Windows scheduled tasks')} />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggle.bind(this, 'X509-Certificate')}
            classes={{ root: classes.item }}
          >
            <Checkbox checked={types.includes('X509-Certificate')} disableRipple={true} />
            <ListItemText primary={t('X509 Certificates')} />
          </ListItem>
        </List>
      </Drawer>
    );
  }
}

IndicatorsRightBar.propTypes = {
  types: PropTypes.array,
  handleToggle: PropTypes.func,
  classes: PropTypes.object,
  t: PropTypes.func,
};

export default compose(
  inject18n,
  withStyles(styles),
)(IndicatorsRightBar);
