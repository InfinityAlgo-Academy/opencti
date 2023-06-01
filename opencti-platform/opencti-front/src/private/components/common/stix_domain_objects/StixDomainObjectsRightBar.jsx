import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, pipe, sortBy, prop, toLower, map, assoc } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { FilterOffOutline } from 'mdi-material-ui';
import inject18n from '../../../../components/i18n';
import { QueryRenderer } from '../../../../relay/environment';
import { stixDomainObjectsLinesSubTypesQuery } from './StixDomainObjectsLines';

const styles = (theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    width: 250,
    padding: '0 0 20px 0',
    position: 'fixed',
    zIndex: 1100,
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
    const { classes, t, types = [], handleToggle, handleClear } = this.props;
    return (
      <Drawer
        variant="permanent"
        anchor="right"
        elevation={1}
        sx={{ zIndex: 1202 }}
        classes={{ paper: classes.drawerPaper }}
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
                      <Tooltip title={t('Clear filters')}>
                        <IconButton
                          onClick={handleClear.bind(this)}
                          disabled={types.length === 0}
                          color="primary"
                          size="large"
                        >
                          <FilterOffOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
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
  handleClear: PropTypes.func,
  classes: PropTypes.object,
  t: PropTypes.func,
  openExports: PropTypes.bool,
};

export default compose(
  inject18n,
  withStyles(styles),
)(StixDomainObjectsRightBar);
