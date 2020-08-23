import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {
  LanguageOutlined,
  WorkOutline,
  DescriptionOutlined,
  FeedbackOutlined,
} from '@material-ui/icons';
import inject18n from '../../../components/i18n';

const styles = (theme) => ({
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
});

class TopMenuAnalysis extends Component {
  render() {
    const { t, location, classes } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/dashboard/analysis/reports"
          variant={
            location.pathname === '/dashboard/analysis/reports'
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === '/dashboard/analysis/reports'
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          <DescriptionOutlined className={classes.icon} fontSize="small" />
          {t('Reports')}
        </Button>
        <Button
          component={Link}
          to="/dashboard/analysis/notes"
          variant={
            location.pathname === '/dashboard/analysis/notes'
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === '/dashboard/analysis/notes'
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          <WorkOutline className={classes.icon} fontSize="small" />
          {t('Notes')}
        </Button>
        <Button
          component={Link}
          to="/dashboard/analysis/opinions"
          variant={
            location.pathname === '/dashboard/analysis/opinions'
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === '/dashboard/analysis/opinions'
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          <FeedbackOutlined className={classes.icon} fontSize="small" />
          {t('Opinions')}
        </Button>
        <Button
          component={Link}
          to="/dashboard/analysis/external_references"
          variant={
            location.pathname === '/dashboard/analysis/external_references'
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === '/dashboard/analysis/external_references'
              ? 'primary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          <LanguageOutlined className={classes.icon} fontSize="small" />
          {t('External references')}
        </Button>
      </div>
    );
  }
}

TopMenuAnalysis.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(TopMenuAnalysis);
