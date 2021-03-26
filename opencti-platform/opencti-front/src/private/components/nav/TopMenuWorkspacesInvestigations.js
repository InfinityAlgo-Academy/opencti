import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
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

class TopMenuInvestigations extends Component {
  render() {
    const { t, classes } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/dashboard/workspaces/investigations"
          variant="contained"
          size="small"
          color="primary"
          classes={{ root: classes.button }}
        >
          {t('Investigations')}
        </Button>
      </div>
    );
  }
}

TopMenuInvestigations.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
};

export default compose(inject18n, withStyles(styles))(TopMenuInvestigations);
