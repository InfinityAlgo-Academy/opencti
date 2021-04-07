import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {
  ArrowForwardIosOutlined,
  WifiTetheringOutlined,
} from '@material-ui/icons';
import inject18n from '../../../components/i18n';
import Security, {
  KNOWLEDGE_KNGETEXPORT,
  KNOWLEDGE_KNUPLOAD,
} from '../../../utils/Security';

const styles = (theme) => ({
  buttonHome: {
    marginRight: theme.spacing(2),
    padding: '2px 5px 2px 5px',
    minHeight: 20,
    textTransform: 'none',
    color: '#666666',
    backgroundColor: '#ffffff',
  },
  button: {
    marginRight: theme.spacing(2),
    padding: '2px 5px 2px 5px',
    minHeight: 20,
    minWidth: 20,
    textTransform: 'none',
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  arrow: {
    verticalAlign: 'middle',
    marginRight: 10,
  },
});

class TopMenuObservedData extends Component {
  render() {
    const {
      t,
      location,
      match: {
        params: { observedDataId },
      },
      classes,
    } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/dashboard/events/observed_data"
          variant="contained"
          size="small"
          color="inherit"
          classes={{ root: classes.buttonHome }}
        >
          <WifiTetheringOutlined className={classes.icon} fontSize="small" />
          {t('Observed datas')}
        </Button>
        <ArrowForwardIosOutlined
          color="inherit"
          classes={{ root: classes.arrow }}
        />
        <Button
          component={Link}
          to={`/dashboard/events/observed_data/${observedDataId}`}
          variant={
            location.pathname
            === `/dashboard/events/observed_data/${observedDataId}`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/events/observed_data/${observedDataId}`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Overview')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/events/observed_data/${observedDataId}/entities`}
          variant={
            location.pathname
            === `/dashboard/events/observed_data/${observedDataId}/entities`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/events/observed_data/${observedDataId}/entities`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Entities')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/events/observed_data/${observedDataId}/observables`}
          variant={
            location.pathname
            === `/dashboard/events/observed_data/${observedDataId}/observables`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/events/observed_data/${observedDataId}/observables`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Observables')}
        </Button>
        <Security needs={[KNOWLEDGE_KNUPLOAD, KNOWLEDGE_KNGETEXPORT]}>
          <Button
            component={Link}
            to={`/dashboard/events/observed_data/${observedDataId}/files`}
            variant={
              location.pathname
              === `/dashboard/events/observed_data/${observedDataId}/files`
                ? 'contained'
                : 'text'
            }
            size="small"
            color={
              location.pathname
              === `/dashboard/events/observed_data/${observedDataId}/files`
                ? 'primary'
                : 'inherit'
            }
            classes={{ root: classes.button }}
          >
            {t('Files')}
          </Button>
        </Security>
        <Button
          component={Link}
          to={`/dashboard/events/observed_data/${observedDataId}/history`}
          variant={
            location.pathname
            === `/dashboard/events/observed_data/${observedDataId}/history`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/events/observed_data/${observedDataId}/history`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('History')}
        </Button>
      </div>
    );
  }
}

TopMenuObservedData.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(TopMenuObservedData);
