import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { ArrowForwardIos, Public } from '@material-ui/icons';
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

class TopMenuThreatActor extends Component {
  render() {
    const {
      t,
      location,
      match: {
        params: { threatActorId },
      },
      classes,
    } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/dashboard/threats/threat_actors"
          variant="contained"
          size="small"
          color="inherit"
          classes={{ root: classes.buttonHome }}
        >
          <Public className={classes.icon} fontSize="small" />
          {t('Threat actors')}
        </Button>
        <ArrowForwardIos color="inherit" classes={{ root: classes.arrow }} />
        <Button
          component={Link}
          to={`/dashboard/threats/threat_actors/${threatActorId}`}
          variant={
            location.pathname
            === `/dashboard/threats/threat_actors/${threatActorId}`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/threats/threat_actors/${threatActorId}`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Overview')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/threats/threat_actors/${threatActorId}/reports`}
          variant={
            location.pathname
            === `/dashboard/threats/threat_actors/${threatActorId}/reports`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/threats/threat_actors/${threatActorId}/reports`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Reports')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/threats/threat_actors/${threatActorId}/knowledge`}
          variant={
            location.pathname.includes(
              `/dashboard/threats/threat_actors/${threatActorId}/knowledge`,
            )
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname.includes(
              `/dashboard/threats/threat_actors/${threatActorId}/knowledge`,
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
          to={`/dashboard/threats/threat_actors/${threatActorId}/indicators`}
          variant={
            location.pathname.includes(
              `/dashboard/threats/threat_actors/${threatActorId}/indicators`,
            )
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname.includes(
              `/dashboard/threats/threat_actors/${threatActorId}/indicators`,
            )
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Indicators')}
        </Button>
        <Button
            component={Link}
            to={`/dashboard/threats/threat_actors/${threatActorId}/files`}
            variant={
                location.pathname === `/dashboard/threats/threat_actors/${threatActorId}/files`
                  ? 'contained'
                  : 'text'
            }
            size="small"
            color={
                location.pathname === `/dashboard/threats/threat_actors/${threatActorId}/files`
                  ? 'primary'
                  : 'inherit'
            }
            classes={{ root: classes.button }}>
            {t('Files')}
        </Button>
      </div>
    );
  }
}

TopMenuThreatActor.propTypes = {
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
)(TopMenuThreatActor);
