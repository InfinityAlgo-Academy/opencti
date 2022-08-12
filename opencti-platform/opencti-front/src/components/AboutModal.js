import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import {
  compose,
} from 'ramda';
import {
  Info,
} from '@material-ui/icons';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import inject18n from './i18n';

const styles = (theme) => ({
  dialogRoot: {
    overflowY: 'scroll',
    overflowX: 'hidden',
  },
  dialogContent: {
    overflowY: 'hidden',
  },
  popoverDialog: {
    fontSize: '18px',
    lineHeight: '24px',
    color: theme.palette.header.text,
  },
  dialogActions: {
    justifyContent: 'flex-start',
    padding: '0px 0 20px 22px',
  },
  iframe: {
    width: '100%',
    border: 'none',
    height: '700px',
    overflowX: 'hidden',
    overflowY: 'scroll',
  },
});

class AboutModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      htmlFormatData: '',
      open: false,
    };
  }

  handleCloseAbout() {
    this.setState({ open: false });
  }

  handleAboutButton() {
    const { location } = this.props;
    let AboutLocationPath = '';
    if (location.pathname === '/dashboard') {
      AboutLocationPath = '/static/docs/pages/dashboard/index.md.html';
    }
    if (location.pathname.includes('/defender HQ/assets/devices')) {
      AboutLocationPath = '/static/docs/pages/defender_hq/assets/devices/index.md.html';
    }
    if (location.pathname.includes('/defender HQ/assets/network')) {
      AboutLocationPath = '/static/docs/pages/defender_hq/assets/network/index.md.html';
    }
    if (location.pathname.includes('/defender HQ/assets/software')) {
      AboutLocationPath = '/static/docs/pages/defender_hq/assets/software/index.md.html';
    }
    if (location.pathname.includes('/activities/vulnerability assessment')) {
      AboutLocationPath = '/static/docs/pages/activities/index.md.html';
    }
    if (location.pathname === '/activities/risk assessment/risks') {
      AboutLocationPath = '/static/docs/pages/activities/risk_assessment/index.md.html';
    }
    if (location.pathname.includes('/activities/risk assessment/risks/')) {
      AboutLocationPath = '/static/docs/pages/activities/risk_assessment/overview/index.md.html';
    }
    if (location.pathname.includes('/activities/risk assessment/risks/')
      && location.pathname.includes('/analysis')) {
      AboutLocationPath = '/static/docs/pages/activities/risk_assessment/analysis/index.md.html';
    }
    if (location.pathname.includes('/activities/risk assessment/risks/')
      && location.pathname.includes('/remediation')) {
      AboutLocationPath = '/static/docs/pages/activities/risk_assessment/remediation/index.md.html';
    }
    if (location.pathname.includes('/activities/risk assessment/risks/')
      && location.pathname.includes('/tracking')) {
      AboutLocationPath = '/static/docs/pages/activities/risk_assessment/tracking/index.md.html';
    }
    if (location.pathname === '/data/entities') {
      AboutLocationPath = '/static/docs/pages/data/entities/index.md.html';
    }
    if (location.pathname === '/data/data source') {
      AboutLocationPath = '/static/docs/pages/data/data_sources/index.md.html';
    }
    if (location.pathname === '/settings') {
      AboutLocationPath = '/static/docs/pages/settings/index.md.html';
    }
    if (AboutLocationPath) {
      this.setState({ htmlFormatData: AboutLocationPath, open: true });
    }
  }

  render() {
    const {
      t, classes,
    } = this.props;
    return (
      <>
        <Tooltip title={t('About')}>
          <IconButton
            classes={{ root: classes.button }}
            onClick={this.handleAboutButton.bind(this)}
            aria-haspopup='true'
          >
            <Info fontSize="default" />
          </IconButton>
        </Tooltip>
        <Dialog
          maxWidth='md'
          fullWidth={true}
          open={this.state.open}
          classes={{ paper: classes.dialogRoot }}
        >
          <DialogContent classes={{ root: classes.dialogContent }}>
            <iframe
              scrolling='no'
              className={classes.iframe}
              src={this.state.htmlFormatData}
              height='700px'
              width='100%'
            />
          </DialogContent>
          <DialogActions className={classes.dialogActions}>
            <Button
              onClick={this.handleCloseAbout.bind(this)}
              disabled={this.state.deleting}
              classes={{ root: classes.buttonPopover }}
              variant="outlined"
              size="small"
            >
              {t('Cancel')}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

AboutModal.propTypes = {
  keyword: PropTypes.string,
  theme: PropTypes.object,
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(
  inject18n,
  withStyles(styles),
)(AboutModal);
