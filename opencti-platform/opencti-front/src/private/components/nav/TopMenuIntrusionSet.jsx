import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Button from '@mui/material/Button';
import { ArrowForwardIos } from '@mui/icons-material';
import { DiamondOutline } from 'mdi-material-ui';
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

class TopMenuIntrusionSet extends Component {
  render() {
    const {
      t,
      location,
      id: intrusionSetId,
      classes,
    } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/dashboard/threats/intrusion_sets"
          variant="contained"
          size="small"
          color="primary"
          classes={{ root: classes.buttonHome }}
        >
          <DiamondOutline className={classes.icon} fontSize="small" />
          {t('Intrusion sets')}
        </Button>
        <ArrowForwardIos color="primary" classes={{ root: classes.arrow }} />
        <Button
          component={Link}
          to={`/dashboard/threats/intrusion_sets/${intrusionSetId}`}
          variant={
            location.pathname
            === `/dashboard/threats/intrusion_sets/${intrusionSetId}`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/threats/intrusion_sets/${intrusionSetId}`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!intrusionSetId}
        >
          {t('Overview')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/threats/intrusion_sets/${intrusionSetId}/knowledge`}
          variant={
            location.pathname.includes(
              `/dashboard/threats/intrusion_sets/${intrusionSetId}/knowledge`,
            )
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname.includes(
              `/dashboard/threats/intrusion_sets/${intrusionSetId}/knowledge`,
            )
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!intrusionSetId}
        >
          {t('Knowledge')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/threats/intrusion_sets/${intrusionSetId}/analyses`}
          variant={
            location.pathname
            === `/dashboard/threats/intrusion_sets/${intrusionSetId}/analyses`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/threats/intrusion_sets/${intrusionSetId}/analyses`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!intrusionSetId}
        >
          {t('Analyses')}
        </Button>
        <Security needs={[KNOWLEDGE_KNUPLOAD, KNOWLEDGE_KNGETEXPORT]}>
          <Button
            component={Link}
            to={`/dashboard/threats/intrusion_sets/${intrusionSetId}/files`}
            variant={
              location.pathname
              === `/dashboard/threats/intrusion_sets/${intrusionSetId}/files`
                ? 'contained'
                : 'text'
            }
            size="small"
            color={
              location.pathname
              === `/dashboard/threats/intrusion_sets/${intrusionSetId}/files`
                ? 'secondary'
                : 'primary'
            }
            classes={{ root: classes.button }}
            disabled={!intrusionSetId}
          >
            {t('Data')}
          </Button>
        </Security>
        <Button
          component={Link}
          to={`/dashboard/threats/intrusion_sets/${intrusionSetId}/history`}
          variant={
            location.pathname
            === `/dashboard/threats/intrusion_sets/${intrusionSetId}/history`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/threats/intrusion_sets/${intrusionSetId}/history`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!intrusionSetId}
        >
          {t('History')}
        </Button>
      </div>
    );
  }
}

TopMenuIntrusionSet.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  id: PropTypes.string,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(TopMenuIntrusionSet);
