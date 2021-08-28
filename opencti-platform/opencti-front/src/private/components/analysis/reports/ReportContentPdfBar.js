import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withTheme, withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  CloudDownloadOutlined,
} from '@material-ui/icons';
import Drawer from '@material-ui/core/Drawer';
import Slide from '@material-ui/core/Slide';
import { Link } from 'react-router-dom';
import inject18n from '../../../../components/i18n';

const styles = (theme) => ({
  bottomNav: {
    zIndex: 1000,
    backgroundColor: theme.palette.navBottom.background,
    display: 'flex',
    overflow: 'hidden',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class ReportContentPdfBar extends Component {
  render() {
    const {
      classes,
      handleZoomIn,
      handleZoomOut,
      currentZoom,
      handleDownload,
      directDownload,
    } = this.props;
    return (
      <Drawer
        anchor="bottom"
        variant="permanent"
        classes={{ paper: classes.bottomNav }}
      >
        <div
          style={{
            verticalAlign: 'top',
            width: '100%',
            height: 54,
            paddingTop: 3,
          }}
        >
          <div
            style={{
              float: 'left',
              marginLeft: 190,
              height: '100%',
              display: 'flex',
            }}
          >
            <IconButton
              color="primary"
              onClick={handleZoomOut.bind(this)}
              disabled={currentZoom <= 0.6}
            >
              <ZoomOutOutlined />
            </IconButton>
            <IconButton
              color="primary"
              onClick={handleZoomIn.bind(this)}
              disabled={currentZoom >= 2}
            >
              <ZoomInOutlined />
            </IconButton>
          </div>
          <div
            style={{
              float: 'right',
              display: 'flex',
              height: '100%',
              marginRight: 260,
            }}
          >
            {directDownload ? (
              <IconButton
                color="primary"
                component={Link}
                to={directDownload}
                target="_blank"
                rel="noopener noreferrer"
              >
                <CloudDownloadOutlined />
              </IconButton>
            ) : (
              <IconButton color="primary" onClick={handleDownload.bind(this)}>
                <CloudDownloadOutlined />
              </IconButton>
            )}
          </div>
        </div>
      </Drawer>
    );
  }
}

ReportContentPdfBar.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  handleZoomIn: PropTypes.func,
  handleZoomOut: PropTypes.func,
  handleDownload: PropTypes.func,
  directDownload: PropTypes.string,
  currentZoom: PropTypes.number,
  theme: PropTypes.object,
};

export default R.compose(
  inject18n,
  withTheme,
  withStyles(styles),
)(ReportContentPdfBar);
