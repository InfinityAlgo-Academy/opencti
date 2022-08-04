import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import graphql from 'babel-plugin-relay/macro';
import { QueryRenderer as QR } from 'react-relay';
import environmentDarkLight from '../../../../relay/environmentDarkLight';
import { commitMutation } from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import RiskAnalysisEditionContainer from './RiskAnalysisEditionContainer';
import { riskEditionOverviewFocus } from './RiskEditionOverview';
import Loader from '../../../../components/Loader';

const styles = (theme) => ({
  editButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
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

export const riskAnalysisEditionQuery = graphql`
  query RiskAnalysisEditionContainerQuery($id: ID!) {
    poamItem(id: $id) {
      id
      ...RiskAnalysisEditionContainer_risk
    }
  }
`;

class RiskAnalysisEdition extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    commitMutation({
      mutation: riskEditionOverviewFocus,
      variables: {
        id: this.props.riskId,
        input: { focusOn: '' },
      },
    });
    this.setState({ open: false });
  }

  render() {
    const {
      riskId,
      history,
    } = this.props;
    return (
      <div>
        {/* <Fab
          onClick={this.handleOpen.bind(this)}
          color="secondary"
          aria-label="Edit"
          className={classes.editButton}
        >
          <Edit />
        </Fab> */}
        {/* <Drawer
          open={this.state.open}
          anchor="right"
          classes={{ paper: classes.drawerPaper }}
          onClose={this.handleClose.bind(this)}
        > */}
        <div>
        <QR
          environment={environmentDarkLight}
          query={riskAnalysisEditionQuery}
          variables={{ id: riskId }}
          render={({ props }) => {
            console.log('RiskEditionPropsContainer', props);
            if (props) {
              return (
                <RiskAnalysisEditionContainer
                  risk={props.poamItem}
                  riskId={riskId}
                  // enableReferences={props.settings.platform_enable_reference?.includes(
                    //   'Risk',
                    // )}
                  history={history}
                  handleClose={this.handleClose.bind(this)}
                />
              );
            }
            return <Loader variant="inElement" />;
          }}
        />
          {/* <QueryRenderer
            query={riskAnalysisEditionQuery}
            variables={{ id: riskId }}
            render={({ props }) => {
              if (props) {
                return (
                  <RiskAnalysisEditionContainer
                    risk={props.threatActor}
                    // enableReferences={props.settings.platform_enable_reference?.includes(
                    //   'Risk',
                    // )}
                    handleClose={this.handleClose.bind(this)}
                  />
                );
              }
              return <Loader variant="inElement" />;
            }}
          /> */}
        {/* </Drawer> */}
        </div>
      </div>
    );
  }
}

RiskAnalysisEdition.propTypes = {
  riskId: PropTypes.string,
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

export default compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(RiskAnalysisEdition);
