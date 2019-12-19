import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Flag, ArrowForwardIos } from '@material-ui/icons';
import inject18n from '../../../components/i18n';

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

class TopMenuRegion extends Component {
  render() {
    const {
      t,
      location,
      match: {
        params: { regionId },
      },
      classes,
    } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/dashboard/entities/regions"
          variant="contained"
          size="small"
          color="inherit"
          classes={{ root: classes.buttonHome }}
        >
          <Flag className={classes.icon} fontSize="small" />
          {t('Regions')}
        </Button>
        <ArrowForwardIos color="inherit" classes={{ root: classes.arrow }} />
        <Button
          component={Link}
          to={`/dashboard/entities/regions/${regionId}`}
          variant={
            location.pathname === `/dashboard/entities/regions/${regionId}`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === `/dashboard/entities/regions/${regionId}`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Overview')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/entities/regions/${regionId}/reports`}
          variant={
            location.pathname
            === `/dashboard/entities/regions/${regionId}/reports`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/entities/regions/${regionId}/reports`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Reports')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/entities/regions/${regionId}/knowledge`}
          variant={
            location.pathname.includes(
              `/dashboard/entities/regions/${regionId}/knowledge`,
            )
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname.includes(
              `/dashboard/entities/regions/${regionId}/knowledge`,
            )
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Knowledge')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/entities/regions/${regionId}/observables`}
          variant={
            location.pathname.includes(
              `/dashboard/entities/regions/${regionId}/observables`,
            )
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname.includes(
              `/dashboard/entities/regions/${regionId}/observables`,
            )
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Observables')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/entities/regions/${regionId}/files`}
          variant={
            location.pathname
            === `/dashboard/entities/regions/${regionId}/files`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/entities/regions/${regionId}/files`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Files')}
        </Button>
      </div>
    );
  }
}

TopMenuRegion.propTypes = {
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
)(TopMenuRegion);
