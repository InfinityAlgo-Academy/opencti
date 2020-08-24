import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  compose, pipe, sortBy, prop, toLower, map, assoc,
} from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Drawer from '@material-ui/core/Drawer';
import inject18n from '../../../../components/i18n';
import { QueryRenderer } from '../../../../relay/environment';
import { stixDomainObjectsLinesSubTypesQuery } from './StixDomainObjectsLines';

const styles = (theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    width: 250,
    padding: '0 0 20px 0',
    position: 'fixed',
    backgroundColor: theme.palette.navAlt.background,
    transition: theme.transitions.create('right', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperExports: {
    minHeight: '100vh',
    width: 250,
    right: 310,
    padding: '0 0 20px 0',
    backgroundColor: theme.palette.navAlt.background,
    transition: theme.transitions.create('right', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  listIcon: {
    marginRight: 0,
  },
  item: {
    padding: '0 0 0 6px',
  },
  itemField: {
    padding: '0 15px 0 15px',
  },
  toolbar: theme.mixins.toolbar,
});

class StixDomainObjectsRightBar extends Component {
  render() {
    const {
      classes, t, types = [], handleToggle, openExports,
    } = this.props;
    return (
      <Drawer
        variant="permanent"
        anchor="right"
        classes={{
          paper: openExports ? classes.drawerPaperExports : classes.drawerPaper,
        }}
      >
        <div className={classes.toolbar} />
        <QueryRenderer
          query={stixDomainObjectsLinesSubTypesQuery}
          variables={{ type: 'Stix-Domain-Object' }}
          render={({ props }) => {
            if (props && props.subTypes) {
              const subTypesEdges = props.subTypes.edges;
              const sortByLabel = sortBy(compose(toLower, prop('tlabel')));
              const translatedOrderedList = pipe(
                map((n) => n.node),
                map((n) => assoc('tlabel', t(`entity_${n.label}`), n)),
                sortByLabel,
              )(subTypesEdges);
              return (
                <List
                  subheader={
                    <ListSubheader component="div">
                      {t('Entity types')}
                    </ListSubheader>
                  }
                >
                  {translatedOrderedList.map((subType) => (
                    <ListItem
                      key={subType.id}
                      dense={true}
                      button={true}
                      onClick={handleToggle.bind(this, subType.label)}
                      classes={{ root: classes.item }}
                    >
                      <Checkbox
                        checked={types.includes(subType.label)}
                        disableRipple={true}
                        size="small"
                      />
                      <ListItemText primary={subType.tlabel} />
                    </ListItem>
                  ))}
                </List>
              );
            }
            return <div />;
          }}
        />
      </Drawer>
    );
  }
}

StixDomainObjectsRightBar.propTypes = {
  types: PropTypes.array,
  handleToggle: PropTypes.func,
  classes: PropTypes.object,
  t: PropTypes.func,
  openExports: PropTypes.bool,
};

export default compose(
  inject18n,
  withStyles(styles),
)(StixDomainObjectsRightBar);
