import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Button from '@mui/material/Button';
import {
  ArrowForwardIosOutlined,
  SurroundSoundOutlined,
} from '@mui/icons-material';
import inject18n from '../../../components/i18n';
import Security from '../../../utils/Security';
import {
  KNOWLEDGE_KNGETEXPORT,
  KNOWLEDGE_KNUPLOAD,
} from '../../../utils/hooks/useGranted';

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

class TopMenuChannel extends Component {
  render() {
    const {
      t,
      location,
      id: channelId,
      classes,
    } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/dashboard/arsenal/channels"
          variant="contained"
          size="small"
          color="primary"
          classes={{ root: classes.buttonHome }}
        >
          <SurroundSoundOutlined className={classes.icon} fontSize="small" />
          {t('Channels')}
        </Button>
        <ArrowForwardIosOutlined
          color="primary"
          classes={{ root: classes.arrow }}
        />
        <Button
          component={Link}
          to={`/dashboard/arsenal/channels/${channelId}`}
          variant={
            location.pathname === `/dashboard/arsenal/channels/${channelId}`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === `/dashboard/arsenal/channels/${channelId}`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!channelId}
        >
          {t('Overview')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/arsenal/channels/${channelId}/knowledge`}
          variant={
            location.pathname.includes(
              `/dashboard/arsenal/channels/${channelId}/knowledge`,
            )
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname.includes(
              `/dashboard/arsenal/channels/${channelId}/knowledge`,
            )
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!channelId}
        >
          {t('Knowledge')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/arsenal/channels/${channelId}/analyses`}
          variant={
            location.pathname
            === `/dashboard/arsenal/channels/${channelId}/analyses`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/arsenal/channels/${channelId}/analyses`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!channelId}
        >
          {t('Analyses')}
        </Button>
        <Security needs={[KNOWLEDGE_KNUPLOAD, KNOWLEDGE_KNGETEXPORT]}>
          <Button
            component={Link}
            to={`/dashboard/arsenal/channels/${channelId}/files`}
            variant={
              location.pathname
              === `/dashboard/arsenal/channels/${channelId}/files`
                ? 'contained'
                : 'text'
            }
            size="small"
            color={
              location.pathname
              === `/dashboard/arsenal/channels/${channelId}/files`
                ? 'secondary'
                : 'primary'
            }
            classes={{ root: classes.button }}
            disabled={!channelId}
          >
            {t('Data')}
          </Button>
        </Security>
        <Button
          component={Link}
          to={`/dashboard/arsenal/channels/${channelId}/history`}
          variant={
            location.pathname
            === `/dashboard/arsenal/channels/${channelId}/history`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/arsenal/channels/${channelId}/history`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!channelId}
        >
          {t('History')}
        </Button>
      </div>
    );
  }
}

TopMenuChannel.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  id: PropTypes.string,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(TopMenuChannel);
