import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Button from '@mui/material/Button';
import { ArrowForwardIosOutlined } from '@mui/icons-material';
import { ChessKnight } from 'mdi-material-ui';
import inject18n from '../../../components/i18n';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNGETEXPORT, KNOWLEDGE_KNUPLOAD } from '../../../utils/hooks/useGranted';

const styles = (theme) => ({
  buttonHome: {
    marginRight: theme.spacing(2),
    padding: '0 5px 0 5px',
    minHeight: 20,
    textTransform: 'none',
  },
  button: {
    marginRight: theme.spacing(2),
    padding: '0 5px 0 5px',
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
      id: campaignId,
      classes,
    } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/dashboard/threats/campaigns"
          variant="contained"
          size="small"
          color="primary"
          classes={{ root: classes.buttonHome }}
        >
          <ChessKnight className={classes.icon} fontSize="small" />
          {t('Campaigns')}
        </Button>
        <ArrowForwardIosOutlined
          color="primary"
          classes={{ root: classes.arrow }}
        />
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
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!campaignId}
        >
          {t('Overview')}
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
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!campaignId}
        >
          {t('Knowledge')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/threats/campaigns/${campaignId}/analyses`}
          variant={
            location.pathname
            === `/dashboard/threats/campaigns/${campaignId}/analyses`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/threats/campaigns/${campaignId}/analyses`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!campaignId}
        >
          {t('Analyses')}
        </Button>
        <Security needs={[KNOWLEDGE_KNUPLOAD, KNOWLEDGE_KNGETEXPORT]}>
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
                ? 'secondary'
                : 'primary'
            }
            classes={{ root: classes.button }}
            disabled={!campaignId}
          >
            {t('Data')}
          </Button>
        </Security>
        <Button
          component={Link}
          to={`/dashboard/threats/campaigns/${campaignId}/history`}
          variant={
            location.pathname
            === `/dashboard/threats/campaigns/${campaignId}/history`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/threats/campaigns/${campaignId}/history`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!campaignId}
        >
          {t('History')}
        </Button>
      </div>
    );
  }
}

TopMenuCampaign.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  id: PropTypes.string,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(TopMenuCampaign);
