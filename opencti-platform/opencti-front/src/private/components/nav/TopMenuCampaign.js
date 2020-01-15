import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { ArrowForwardIos } from '@material-ui/icons';
import { ChessKnight } from 'mdi-material-ui';
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

class TopMenuCampaign extends Component {
  render() {
    const {
      t,
      location,
      match: {
        params: { campaignId },
      },
      classes,
    } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/dashboard/threats/campaigns"
          variant="contained"
          size="small"
          color="inherit"
          classes={{ root: classes.buttonHome }}
        >
          <ChessKnight className={classes.icon} fontSize="small" />
          {t('Campaigns')}
        </Button>
        <ArrowForwardIos color="inherit" classes={{ root: classes.arrow }} />
        <Button
          component={Link}
          to={`/dashboard/threats/campaigns/${campaignId}`}
          variant={
            location.pathname === `/dashboard/threats/campaigns/${campaignId}`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === `/dashboard/threats/campaigns/${campaignId}`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Overview')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/threats/campaigns/${campaignId}/reports`}
          variant={
            location.pathname
            === `/dashboard/threats/campaigns/${campaignId}/reports`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/threats/campaigns/${campaignId}/reports`
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Reports')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/threats/campaigns/${campaignId}/knowledge`}
          variant={
            location.pathname.includes(
              `/dashboard/threats/campaigns/${campaignId}/knowledge`,
            )
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname.includes(
              `/dashboard/threats/campaigns/${campaignId}/knowledge`,
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
          to={`/dashboard/threats/campaigns/${campaignId}/indicators`}
          variant={
            location.pathname.includes(
              `/dashboard/threats/campaigns/${campaignId}/indicators`,
            )
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname.includes(
              `/dashboard/threats/campaigns/${campaignId}/indicators`,
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
          to={`/dashboard/threats/campaigns/${campaignId}/files`}
          variant={
            location.pathname
            === `/dashboard/threats/campaigns/${campaignId}/files`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/threats/campaigns/${campaignId}/files`
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

TopMenuCampaign.propTypes = {
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
)(TopMenuCampaign);
