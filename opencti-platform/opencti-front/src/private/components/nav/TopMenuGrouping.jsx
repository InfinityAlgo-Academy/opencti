import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Button from '@mui/material/Button';
import {
  ArrowForwardIosOutlined,
  WorkspacesOutlined,
} from '@mui/icons-material';
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

class TopMenuGrouping extends Component {
  render() {
    const {
      t,
      location,
      id: groupingId,
      classes,
    } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/dashboard/analyses/groupings"
          variant="contained"
          size="small"
          color="primary"
          classes={{ root: classes.buttonHome }}
        >
          <WorkspacesOutlined className={classes.icon} fontSize="small" />
          {t('Groupings')}
        </Button>
        <ArrowForwardIosOutlined
          color="primary"
          classes={{ root: classes.arrow }}
        />
        <Button
          component={Link}
          to={`/dashboard/analyses/groupings/${groupingId}`}
          variant={
            location.pathname === `/dashboard/analyses/groupings/${groupingId}`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === `/dashboard/analyses/groupings/${groupingId}`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!groupingId}
        >
          {t('Overview')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/analyses/groupings/${groupingId}/knowledge`}
          variant={
            location.pathname.includes(
              `/dashboard/analyses/groupings/${groupingId}/knowledge`,
            )
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname.includes(
              `/dashboard/analyses/groupings/${groupingId}/knowledge`,
            )
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!groupingId}
        >
          {t('Knowledge')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/analyses/groupings/${groupingId}/entities`}
          variant={
            location.pathname
            === `/dashboard/analyses/groupings/${groupingId}/entities`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/analyses/groupings/${groupingId}/entities`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!groupingId}
        >
          {t('Entities')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/analyses/groupings/${groupingId}/observables`}
          variant={
            location.pathname
            === `/dashboard/analyses/groupings/${groupingId}/observables`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/analyses/groupings/${groupingId}/observables`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!groupingId}
        >
          {t('Observables')}
        </Button>
        <Security needs={[KNOWLEDGE_KNUPLOAD, KNOWLEDGE_KNGETEXPORT]}>
          <Button
            component={Link}
            to={`/dashboard/analyses/groupings/${groupingId}/files`}
            variant={
              location.pathname
              === `/dashboard/analyses/groupings/${groupingId}/files`
                ? 'contained'
                : 'text'
            }
            size="small"
            color={
              location.pathname
              === `/dashboard/analyses/groupings/${groupingId}/files`
                ? 'secondary'
                : 'primary'
            }
            classes={{ root: classes.button }}
            disabled={!groupingId}
          >
            {t('Data')}
          </Button>
        </Security>
      </div>
    );
  }
}

TopMenuGrouping.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  id: PropTypes.string,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(TopMenuGrouping);
