import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import {
  assoc, compose, map, pipe, prop, sortBy, toLower,
} from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Drawer from '@material-ui/core/Drawer';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { FilterOffOutline } from 'mdi-material-ui';
import inject18n from '../../../../components/i18n';
import { QueryRenderer } from '../../../../relay/environment';
import { stixCyberObservablesLinesSubTypesQuery } from '../stix_cyber_observables/StixCyberObservablesLines';

const styles = (theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    width: 250,
    right: 0,
    padding: '0 0 20px 0',
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

class IndicatorsRightBar extends Component {
  render() {
    const {
      classes,
      t,
      indicatorTypes,
      observableTypes,
      handleToggleIndicatorType = [],
      handleToggleObservableType = [],
      handleClearObservableTypes,
      openExports,
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
        <List
          subheader={
            <ListSubheader component="div">{t('Indicator type')}</ListSubheader>
          }
        >
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggleIndicatorType.bind(this, 'stix')}
            classes={{ root: classes.item }}
          >
            <Checkbox
              checked={indicatorTypes.includes('stix')}
              disableRipple={true}
              size="small"
            />
            <ListItemText primary="STIX" />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggleIndicatorType.bind(this, 'pcre')}
            classes={{ root: classes.item }}
          >
            <Checkbox
              checked={indicatorTypes.includes('pcre')}
              disableRipple={true}
              size="small"
            />
            <ListItemText primary="PCRE" />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggleIndicatorType.bind(this, 'sigma')}
            classes={{ root: classes.item }}
          >
            <Checkbox
              checked={indicatorTypes.includes('sigma')}
              disableRipple={true}
              size="small"
            />
            <ListItemText primary="SIGMA" />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggleIndicatorType.bind(this, 'snort')}
            classes={{ root: classes.item }}
          >
            <Checkbox
              checked={indicatorTypes.includes('snort')}
              disableRipple={true}
              size="small"
            />
            <ListItemText primary="SNORT" />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggleIndicatorType.bind(this, 'suricata')}
            classes={{ root: classes.item }}
          >
            <Checkbox
              checked={indicatorTypes.includes('suricata')}
              disableRipple={true}
              size="small"
            />
            <ListItemText primary="Suricata" />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggleIndicatorType.bind(this, 'yara')}
            classes={{ root: classes.item }}
          >
            <Checkbox
              checked={indicatorTypes.includes('yara')}
              disableRipple={true}
              size="small"
            />
            <ListItemText primary="YARA" />
          </ListItem>
          <ListItem
            dense={true}
            button={true}
            onClick={handleToggleIndicatorType.bind(this, 'tanium-signal')}
            classes={{ root: classes.item }}
          >
            <Checkbox
              checked={indicatorTypes.includes('tanium-signal')}
              disableRipple={true}
              size="small"
            />
            <ListItemText primary="Tanium Signal" />
          </ListItem>
        </List>
        <QueryRenderer
          query={stixCyberObservablesLinesSubTypesQuery}
          variables={{ type: 'Stix-Cyber-Observable' }}
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
                      {t('Observable type')}
                      <Tooltip title={t('Clear filters')}>
                        <IconButton
                          onClick={handleClearObservableTypes.bind(this)}
                          disabled={observableTypes.length === 0}
                          color="primary"
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
                      onClick={handleToggleObservableType.bind(
                        this,
                        subType.label,
                      )}
                      classes={{ root: classes.item }}
                    >
                      <Checkbox
                        checked={observableTypes.includes(subType.label)}
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

IndicatorsRightBar.propTypes = {
  indicatorTypes: PropTypes.array,
  observableTypes: PropTypes.array,
  handleToggleIndicatorType: PropTypes.func,
  handleToggleObservableType: PropTypes.func,
  handleClearObservableTypes: PropTypes.func,
  classes: PropTypes.object,
  t: PropTypes.func,
  openExports: PropTypes.bool,
};

export default compose(inject18n, withStyles(styles))(IndicatorsRightBar);
