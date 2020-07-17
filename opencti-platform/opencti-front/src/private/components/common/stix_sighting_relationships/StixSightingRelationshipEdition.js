import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import inject18n from '../../../../components/i18n';
import { QueryRenderer } from '../../../../relay/environment';
import StixSightingRelationshipEditionOverview from './StixSightingRelationshipEditionOverview';
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

const stixSightingRelationshipEditionQuery = graphql`
  query StixSightingRelationshipEditionQuery($id: String!) {
    stixSightingRelationship(id: $id) {
      ...StixSightingRelationshipEditionOverview_stixSightingRelationship
    }
  }
`;

export const stixSightingRelationshipEditionDeleteMutation = graphql`
  mutation StixSightingRelationshipEditionDeleteMutation($id: ID!) {
    stixSightingRelationshipEdit(id: $id) {
      delete
    }
  }
`;

class StixSightingRelationshipEdition extends Component {
  render() {
    const {
      classes,
      stixSightingRelationshipId,
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
        {stixSightingRelationshipId ? (
          <QueryRenderer
            query={stixSightingRelationshipEditionQuery}
            variables={{ id: stixSightingRelationshipId }}
            render={({ props }) => {
              if (props) {
                return (
                  <StixSightingRelationshipEditionOverview
                    stixDomainObject={stixDomainObject}
                    stixSightingRelationship={props.stixSightingRelationship}
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

StixSightingRelationshipEdition.propTypes = {
  stixSightingRelationshipId: PropTypes.string,
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
)(StixSightingRelationshipEdition);
