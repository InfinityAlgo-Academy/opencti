import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';
import Drawer from '@material-ui/core/Drawer';
import { QueryRenderer } from '../../../../relay/environment';
import StixCyberObservablesExportsContent, {
  stixCyberObservablesExportsContentQuery,
} from './StixCyberObservablesExportsContent';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = (theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    width: 310,
    padding: '0 0 20px 0',
    overflowX: 'hidden',
    zIndex: 0,
    backgroundColor: theme.palette.navAlt.background,
  },
  toolbar: theme.mixins.toolbar,
});

class StixCyberObservablesExports extends Component {
  render() {
    const {
      classes,
      paginationOptions,
      open,
      handleToggle,
      context,
    } = this.props;
    return (
      <Drawer
        variant="persistent"
        open={open}
        anchor="right"
        classes={{ paper: classes.drawerPaper }}
        onClose={handleToggle.bind(this)}
      >
        <div className={classes.toolbar} />
        <QueryRenderer
          query={stixCyberObservablesExportsContentQuery}
          variables={{ count: 25, context }}
          render={({ props }) => (
            <StixCyberObservablesExportsContent
              handleToggle={handleToggle.bind(this)}
              data={props}
              paginationOptions={paginationOptions}
              isOpen={open}
              context={context}
            />
          )}
        />
      </Drawer>
    );
  }
}

StixCyberObservablesExports.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool,
  handleToggle: PropTypes.func,
  paginationOptions: PropTypes.object,
  handleApplyListArgs: PropTypes.func,
  context: PropTypes.string,
};

export default compose(withStyles(styles))(StixCyberObservablesExports);
