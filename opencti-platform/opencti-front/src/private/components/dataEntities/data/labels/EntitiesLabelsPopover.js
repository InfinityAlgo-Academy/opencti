/* eslint-disable */
/* refactor */
import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles/index';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import { MoreVertOutlined } from '@material-ui/icons';
import inject18n from '../../../../../components/i18n';
import { toastGenericError } from '../../../../../utils/bakedToast';
import CyioAddNotes from '../../../analysis/notes/CyioAddNotes';
import CyioAddExternalReferences from '../../../analysis/external_references/CyioAddExternalReferences';
import CyioCoreObjectLabelsView from '../../../common/stix_core_objects/CyioCoreObjectLabelsView';

const styles = (theme) => ({
  container: {
    margin: 0,
  },
  menuItem: {
    width: '170px',
    margin: '0px 20px',
    justifyContent: 'center',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction='up' ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class EntitiesLabelsPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      isOpen: false,
      openExternalRef: false,
    };
  }

  handleOpen(event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.setState({ anchorEl: event.currentTarget, isOpen: true });
    if (this.props.handleOpenMenu) {
      this.props.handleOpenMenu(this.state.isOpen);
    }
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  render() {
    const {
      classes,
      t,
      history,
      node,
    } = this.props;
    return (
      <div className={classes.container}>
        <IconButton onClick={this.handleOpen.bind(this)} aria-haspopup='true'>
          <MoreVertOutlined />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleClose.bind(this)}
          style={{ marginTop: 50 }}
        >
          <MenuItem
            className={classes.menuItem}
            divider={true}
          >
            <CyioAddNotes
              menuItemName='Add Notes'
              cyioCoreObjectOrStixCoreRelationshipId={node.id}
              typename={node.__typename}
              fieldName='remarks'
              cyioCoreObjectOrStixCoreRelationshipNotes={node.remarks}
            />
          </MenuItem>
          <MenuItem
            divider={true}
            className={classes.menuItem}
          >
            <CyioAddExternalReferences
              menuItemName='Add External Reference'
              cyioCoreObjectOrCyioCoreRelationshipId={node.id}
              cyioCoreObjectOrCyioCoreRelationshipReferences={node.links}
              fieldName='links'
              typename={node.__typename}
            />
          </MenuItem>
          <MenuItem
            className={classes.menuItem}
          >
            <CyioCoreObjectLabelsView
              menuItemName='Add Labels'
              labels={node.labels}
              marginTop={0}
              id={node.id}
              typename={node.__typename}
            />
          </MenuItem>
        </Menu>
      </div>
    );
  }
}

EntitiesLabelsPopover.propTypes = {
  node: PropTypes.object,
  handleOpenMenu: PropTypes.func,
  classes: PropTypes.object,
  t: PropTypes.func,
};

export default compose(inject18n, withStyles(styles))(EntitiesLabelsPopover);
