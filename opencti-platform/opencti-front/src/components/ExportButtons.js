import React, { Component } from 'react';
import IconButton from '@material-ui/core/IconButton';
import { ImageOutlined } from '@material-ui/icons';
import { FilePdfOutline } from 'mdi-material-ui';
import { withTheme, withStyles } from '@material-ui/core/styles';
import * as R from 'ramda';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import themeLight from './ThemeLight';
import themeDark from './ThemeDark';
import { commitLocalUpdate } from '../relay/environment';
import { exportImage, exportPdf } from '../utils/Image';
import inject18n from './i18n';
import Loader from './Loader';

const styles = () => ({
  exportButtons: {
    display: 'flex',
  },
  loader: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
});

class ExportButtons extends Component {
  constructor(props) {
    super(props);
    commitLocalUpdate((store) => {
      const me = store.getRoot().getLinkedRecord('me');
      const exporting = me.getValue('exporting') || false;
      this.state = {
        anchorElImage: null,
        anchorElPdf: null,
        exporting,
      };
    });
  }

  handleOpenImage(event) {
    this.setState({ anchorElImage: event.currentTarget });
  }

  handleCloseImage() {
    this.setState({ anchorElImage: null });
  }

  exportImage(domElementId, name, theme, background) {
    this.setState({ exporting: true });
    this.handleCloseImage();
    const { theme: currentTheme, pixelRatio = 2 } = this.props;
    let timeout = 4000;
    if (theme !== currentTheme.palette.type) {
      timeout = 6000;
      commitLocalUpdate((store) => {
        const me = store.getRoot().getLinkedRecord('me');
        me.setValue(theme, 'theme');
        me.setValue(true, 'exporting');
      });
    }
    setTimeout(() => {
      exportImage(
        domElementId,
        name,
        // eslint-disable-next-line no-nested-ternary
        background
          ? theme === 'light'
            ? themeLight().palette.background.default
            : themeDark().palette.background.default
          : null,
        pixelRatio,
      ).then(() => {
        if (theme !== currentTheme.palette.type) {
          commitLocalUpdate((store) => {
            const me = store.getRoot().getLinkedRecord('me');
            me.setValue(false, 'exporting');
            me.setValue(currentTheme.palette.type, 'theme');
          });
        } else {
          this.setState({ exporting: false });
        }
      });
    }, timeout);
  }

  handleOpenPdf(event) {
    this.setState({ anchorElPdf: event.currentTarget });
  }

  handleClosePdf() {
    this.setState({ anchorElPdf: null });
  }

  exportPdf(domElementId, name, theme, background) {
    this.setState({ exporting: true });
    this.handleClosePdf();
    const { theme: currentTheme, pixelRatio = 2 } = this.props;
    let timeout = 4000;
    if (theme !== currentTheme.palette.type) {
      timeout = 6000;
      commitLocalUpdate((store) => {
        const me = store.getRoot().getLinkedRecord('me');
        me.setValue(true, 'exporting');
        me.setValue(theme, 'theme');
      });
    }
    setTimeout(() => {
      exportPdf(
        domElementId,
        name,
        // eslint-disable-next-line no-nested-ternary
        background
          ? theme === 'light'
            ? themeLight().palette.background.default
            : themeDark().palette.background.default
          : null,
        pixelRatio,
      ).then(() => {
        if (theme !== currentTheme.palette.type) {
          commitLocalUpdate((store) => {
            const me = store.getRoot().getLinkedRecord('me');
            me.setValue(false, 'exporting');
            me.setValue(currentTheme.palette.type, 'theme');
          });
        } else {
          this.setState({ exporting: false });
        }
      });
    }, timeout);
  }

  render() {
    const { anchorElImage, anchorElPdf, exporting } = this.state;
    const {
      classes, t, domElementId, name,
    } = this.props;
    return (
      <div className={classes.exportButtons}>
        <IconButton
          onClick={this.handleOpenImage.bind(this)}
          aria-haspopup="true"
          color="primary"
        >
          <ImageOutlined />
        </IconButton>
        <Menu
          anchorEl={anchorElImage}
          open={Boolean(anchorElImage)}
          onClose={this.handleCloseImage.bind(this)}
          style={{ marginTop: 50 }}
        >
          <MenuItem
            onClick={this.exportImage.bind(
              this,
              domElementId,
              name,
              'dark',
              true,
            )}
          >
            {t('Dark (with background)')}
          </MenuItem>
          <MenuItem
            onClick={this.exportImage.bind(
              this,
              domElementId,
              name,
              'dark',
              false,
            )}
          >
            {t('Dark (without background)')}
          </MenuItem>
          <MenuItem
            onClick={this.exportImage.bind(
              this,
              domElementId,
              name,
              'light',
              true,
            )}
          >
            {t('Light (with background)')}
          </MenuItem>
          <MenuItem
            onClick={this.exportImage.bind(
              this,
              domElementId,
              name,
              'light',
              false,
            )}
          >
            {t('Light (without background)')}
          </MenuItem>
        </Menu>
        <IconButton
          onClick={this.handleOpenPdf.bind(this)}
          aria-haspopup="true"
          color="primary"
        >
          <FilePdfOutline />
        </IconButton>
        <Menu
          anchorEl={anchorElPdf}
          open={Boolean(anchorElPdf)}
          onClose={this.handleClosePdf.bind(this)}
          style={{ marginTop: 50 }}
        >
          <MenuItem
            onClick={this.exportPdf.bind(
              this,
              domElementId,
              name,
              'dark',
              true,
            )}
          >
            {t('Dark')}
          </MenuItem>
          <MenuItem
            onClick={this.exportPdf.bind(
              this,
              domElementId,
              name,
              'light',
              true,
            )}
          >
            {t('Light')}
          </MenuItem>
        </Menu>
        <Dialog
          open={exporting}
          keepMounted={true}
          fullScreen={true}
          classes={{ paper: classes.loader }}
        >
          <Loader />
        </Dialog>
      </div>
    );
  }
}

export default R.compose(
  inject18n,
  withTheme,
  withStyles(styles),
)(ExportButtons);
