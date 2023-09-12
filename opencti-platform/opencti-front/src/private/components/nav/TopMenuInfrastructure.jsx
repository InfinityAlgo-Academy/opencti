import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Button from '@mui/material/Button';
import { ArrowForwardIos } from '@mui/icons-material';
import { ServerNetwork } from 'mdi-material-ui';
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

class TopMenuInfrastructure extends Component {
  render() {
    const {
      t,
      location,
      id: infrastructureId,
      classes,
    } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/dashboard/observations/infrastructures"
          variant="contained"
          size="small"
          color="primary"
          classes={{ root: classes.buttonHome }}
        >
          <ServerNetwork className={classes.icon} fontSize="small" />
          {t('Infrastructures')}
        </Button>
        <ArrowForwardIos color="primary" classes={{ root: classes.arrow }} />
        <Button
          component={Link}
          to={`/dashboard/observations/infrastructures/${infrastructureId}`}
          variant={
            location.pathname
            === `/dashboard/observations/infrastructures/${infrastructureId}`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/observations/infrastructures/${infrastructureId}`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!infrastructureId}
        >
          {t('Overview')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/observations/infrastructures/${infrastructureId}/knowledge`}
          variant={
            location.pathname.includes(
              `/dashboard/observations/infrastructures/${infrastructureId}/knowledge`,
            )
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname.includes(
              `/dashboard/observations/infrastructures/${infrastructureId}/knowledge`,
            )
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!infrastructureId}
        >
          {t('Knowledge')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/observations/infrastructures/${infrastructureId}/analyses`}
          variant={
            location.pathname
            === `/dashboard/observations/infrastructures/${infrastructureId}/analyses`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/observations/infrastructures/${infrastructureId}/analyses`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!infrastructureId}
        >
          {t('Analyses')}
        </Button>
        <Security needs={[KNOWLEDGE_KNUPLOAD, KNOWLEDGE_KNGETEXPORT]}>
          <Button
            component={Link}
            to={`/dashboard/observations/infrastructures/${infrastructureId}/files`}
            variant={
              location.pathname
              === `/dashboard/observations/infrastructures/${infrastructureId}/files`
                ? 'contained'
                : 'text'
            }
            size="small"
            color={
              location.pathname
              === `/dashboard/observations/infrastructures/${infrastructureId}/files`
                ? 'secondary'
                : 'primary'
            }
            classes={{ root: classes.button }}
            disabled={!infrastructureId}
          >
            {t('Data')}
          </Button>
        </Security>
        <Button
          component={Link}
          to={`/dashboard/observations/infrastructures/${infrastructureId}/history`}
          variant={
            location.pathname
            === `/dashboard/observations/infrastructures/${infrastructureId}/history`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/observations/infrastructures/${infrastructureId}/history`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!infrastructureId}
        >
          {t('History')}
        </Button>
      </div>
    );
  }
}

TopMenuInfrastructure.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  id: PropTypes.string,
  t: PropTypes.func,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(TopMenuInfrastructure);
