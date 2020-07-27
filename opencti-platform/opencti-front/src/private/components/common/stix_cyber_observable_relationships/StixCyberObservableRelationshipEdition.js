import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import inject18n from '../../../../components/i18n';
import { QueryRenderer } from '../../../../relay/environment';
import StixCyberObservableRelationshipEditionOverview from './StixCyberObservableRelationshipEditionOverview';
import Loader from '../../../../components/Loader';

const styles = (theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    width: '30%',
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

const stixCyberObservableRelationshipEditionQuery = graphql`
  query StixCyberObservableRelationshipEditionQuery($id: String!) {
    stixCyberObservableRelationship(id: $id) {
      ...StixCyberObservableRelationshipEditionOverview_stixCyberObservableRelationship
    }
  }
`;

export const stixCyberObservableRelationshipEditionDeleteMutation = graphql`
  mutation StixCyberObservableRelationshipEditionDeleteMutation($id: ID!) {
    stixCyberObservableRelationshipEdit(id: $id) {
      delete
    }
  }
`;

class StixCyberObservableRelationshipEdition extends Component {
  render() {
    const {
      classes,
      stixCyberObservableRelationshipId,
      stixDomainObject,
      open,
      handleClose,
      handleDelete,
    } = this.props;
    return (
      <Drawer
        open={open}
        anchor="right"
        classes={{ paper: classes.drawerPaper }}
        onClose={handleClose.bind(this)}
      >
        {stixCyberObservableRelationshipId ? (
          <QueryRenderer
            query={stixCyberObservableRelationshipEditionQuery}
            variables={{ id: stixCyberObservableRelationshipId }}
            render={({ props }) => {
              if (props) {
                return (
                  <StixCyberObservableRelationshipEditionOverview
                    stixDomainObject={stixDomainObject}
                    stixCyberObservableRelationship={
                      props.stixCyberObservableRelationship
                    }
                    handleClose={handleClose.bind(this)}
                    handleDelete={
                      typeof handleDelete === 'function'
                        ? handleDelete.bind(this)
                        : null
                    }
                  />
                );
              }
              return <Loader variant="inElement" />;
            }}
          />
        ) : (
          <div> &nbsp; </div>
        )}
      </Drawer>
    );
  }
}

StixCyberObservableRelationshipEdition.propTypes = {
  stixCyberObservableRelationId: PropTypes.string,
  stixDomainObject: PropTypes.object,
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  handleDelete: PropTypes.func,
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

export default compose(
  inject18n,
  withStyles(styles),
)(StixCyberObservableRelationshipEdition);
