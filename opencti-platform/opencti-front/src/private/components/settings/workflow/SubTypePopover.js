import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles/index';
import Drawer from '@material-ui/core/Drawer';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import MoreVert from '@material-ui/icons/MoreVert';
import inject18n from '../../../../components/i18n';
import { QueryRenderer } from '../../../../relay/environment';
import SubTypeEdition from './SubTypeEdition';
import Loader from '../../../../components/Loader';

const styles = (theme) => ({
  container: {
    margin: 0,
  },
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    overflow: 'auto',
    backgroundColor: theme.palette.navAlt.background,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: 0,
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const subTypeEditionQuery = graphql`
  query SubTypePopoverEditionQuery($id: String!) {
    subType(id: $id) {
      ...SubTypeEdition_subType
    }
  }
`;

class SubTypePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      displayUpdate: false,
    };
  }

  handleOpen(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenUpdate() {
    this.setState({ displayUpdate: true });
    this.handleClose();
  }

  handleCloseUpdate() {
    this.setState({ displayUpdate: false });
  }

  render() {
    const { classes, t, subTypeId } = this.props;
    return (
      <div className={classes.container}>
        <IconButton
          onClick={this.handleOpen.bind(this)}
          aria-haspopup="true"
          style={{ marginTop: 1 }}
        >
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleClose.bind(this)}
          style={{ marginTop: 50 }}
        >
          <MenuItem onClick={this.handleOpenUpdate.bind(this)}>
            {t('Update')}
          </MenuItem>
        </Menu>
        <Drawer
          open={this.state.displayUpdate}
          anchor="right"
          classes={{ paper: classes.drawerPaper }}
          onClose={this.handleCloseUpdate.bind(this)}
        >
          <QueryRenderer
            query={subTypeEditionQuery}
            variables={{ id: subTypeId }}
            render={({ props }) => {
              if (props) {
                return (
                  <SubTypeEdition
                    subType={props.subType}
                    handleClose={this.handleCloseUpdate.bind(this)}
                  />
                );
              }
              return <Loader variant="inElement" />;
            }}
          />
        </Drawer>
      </div>
    );
  }
}

SubTypePopover.propTypes = {
  subTypeId: PropTypes.string,
  classes: PropTypes.object,
  t: PropTypes.func,
};

export default compose(inject18n, withStyles(styles))(SubTypePopover);
