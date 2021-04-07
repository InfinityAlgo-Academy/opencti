import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import inject18n from '../../../../components/i18n';
import { QueryRenderer } from '../../../../relay/environment';
import StixDomainObjectEditionOverview from './StixDomainObjectEditionOverview';
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

const stixDomainObjectEditionQuery = graphql`
  query StixDomainObjectEditionQuery($id: String!) {
    stixDomainObject(id: $id) {
      ...StixDomainObjectEditionOverview_stixDomainObject
    }
  }
`;

class StixDomainObjectEdition extends Component {
  render() {
    const {
      classes,
      stixDomainObjectId,
      open,
      handleClose,
      handleDelete,
      variant,
    } = this.props;
    return (
      <Drawer
        open={open}
        anchor="right"
        classes={{ paper: classes.drawerPaper }}
        onClose={handleClose.bind(this)}
      >
        {stixDomainObjectId ? (
          <QueryRenderer
            query={stixDomainObjectEditionQuery}
            variables={{ id: stixDomainObjectId }}
            render={({ props }) => {
              if (props) {
                return (
                  <StixDomainObjectEditionOverview
                    variant={variant}
                    stixDomainObject={props.stixDomainObject}
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

StixDomainObjectEdition.propTypes = {
  variant: PropTypes.string,
  stixDomainObjectId: PropTypes.string,
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  handleDelete: PropTypes.func,
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

export default compose(inject18n, withStyles(styles))(StixDomainObjectEdition);
