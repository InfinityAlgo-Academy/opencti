import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Redirect, withRouter } from 'react-router-dom';
import graphql from 'babel-plugin-relay/macro';
import {
  QueryRenderer,
  requestSubscription,
} from '../../../../relay/environment';
import TopBar from '../../nav/TopBar';
import IntrusionSet from './IntrusionSet';
import IntrusionSetKnowledge from './IntrusionSetKnowledge';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import FileManager from '../../common/files/FileManager';
import IntrusionSetPopover from './IntrusionSetPopover';
import Loader from '../../../../components/Loader';
import StixCoreObjectHistory from '../../common/stix_core_objects/StixCoreObjectHistory';
import StixCoreObjectOrStixCoreRelationshipContainers from '../../common/containers/StixCoreObjectOrStixCoreRelationshipContainers';
import StixDomainObjectIndicators from '../../observations/indicators/StixDomainObjectIndicators';
import StixCoreRelationship from '../../common/stix_core_relationships/StixCoreRelationship';

const subscription = graphql`
  subscription RootIntrusionSetSubscription($id: ID!) {
    stixDomainObject(id: $id) {
      ... on IntrusionSet {
        ...IntrusionSet_intrusionSet
        ...IntrusionSetEditionContainer_intrusionSet
      }
      ...FileImportViewer_entity
      ...FileExportViewer_entity
    }
  }
`;

const intrusionSetQuery = graphql`
  query RootIntrusionSetQuery($id: String!) {
    intrusionSet(id: $id) {
      id
      standard_id
      name
      aliases
      ...IntrusionSet_intrusionSet
      ...IntrusionSetKnowledge_intrusionSet
      ...FileImportViewer_entity
      ...FileExportViewer_entity
    }
    connectorsForExport {
      ...FileManager_connectorsExport
    }
  }
`;

class RootIntrusionSet extends Component {
  componentDidMount() {
    const {
      match: {
        params: { intrusionSetId },
      },
    } = this.props;
    const sub = requestSubscription({
      subscription,
      variables: { id: intrusionSetId },
    });
    this.setState({ sub });
  }

  componentWillUnmount() {
    this.state.sub.dispose();
  }

  render() {
    const {
      me,
      match: {
        params: { intrusionSetId },
      },
    } = this.props;
    return (
      <div>
        <TopBar me={me || null} />
        <QueryRenderer
          query={intrusionSetQuery}
          variables={{ id: intrusionSetId }}
          render={({ props }) => {
            if (props && props.intrusionSet) {
              return (
                <div>
                  <Route
                    exact
                    path="/dashboard/threats/intrusion_sets/:intrusionSetId"
                    render={(routeProps) => (
                      <IntrusionSet
                        {...routeProps}
                        intrusionSet={props.intrusionSet}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/threats/intrusion_sets/:intrusionSetId/knowledge"
                    render={() => (
                      <Redirect
                        to={`/dashboard/threats/intrusion_sets/${intrusionSetId}/knowledge/overview`}
                      />
                    )}
                  />
                  <Route
                    path="/dashboard/threats/intrusion_sets/:intrusionSetId/knowledge"
                    render={(routeProps) => (
                      <IntrusionSetKnowledge
                        {...routeProps}
                        intrusionSet={props.intrusionSet}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/threats/intrusion_sets/:intrusionSetId/analysis"
                    render={(routeProps) => (
                      <React.Fragment>
                        <StixDomainObjectHeader
                          stixDomainObject={props.intrusionSet}
                          PopoverComponent={<IntrusionSetPopover />}
                        />
                        <StixCoreObjectOrStixCoreRelationshipContainers
                          {...routeProps}
                          stixCoreObjectOrStixCoreRelationshipId={
                            intrusionSetId
                          }
                        />
                      </React.Fragment>
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/threats/intrusion_sets/:intrusionSetId/indicators"
                    render={(routeProps) => (
                      <React.Fragment>
                        <StixDomainObjectHeader
                          stixDomainObject={props.intrusionSet}
                          PopoverComponent={<IntrusionSetPopover />}
                          variant="noaliases"
                        />
                        <StixDomainObjectIndicators
                          {...routeProps}
                          stixDomainObjectId={intrusionSetId}
                          stixDomainObjectLink={`/dashboard/threats/intrusion_sets/${intrusionSetId}/indicators`}
                        />
                      </React.Fragment>
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/threats/intrusion_sets/:intrusionSetId/indicators/relations/:relationId"
                    render={(routeProps) => (
                      <StixCoreRelationship
                        entityId={intrusionSetId}
                        {...routeProps}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/threats/intrusion_sets/:intrusionSetId/files"
                    render={(routeProps) => (
                      <React.Fragment>
                        <StixDomainObjectHeader
                          stixDomainObject={props.intrusionSet}
                          PopoverComponent={<IntrusionSetPopover />}
                        />
                        <FileManager
                          {...routeProps}
                          id={intrusionSetId}
                          connectorsImport={[]}
                          connectorsExport={props.connectorsForExport}
                          entity={props.intrusionSet}
                        />
                      </React.Fragment>
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/threats/intrusion_sets/:intrusionSetId/history"
                    render={(routeProps) => (
                      <React.Fragment>
                        <StixDomainObjectHeader
                          stixDomainObject={props.intrusionSet}
                          PopoverComponent={<IntrusionSetPopover />}
                        />
                        <StixCoreObjectHistory
                          {...routeProps}
                          stixCoreObjectId={intrusionSetId}
                        />
                      </React.Fragment>
                    )}
                  />
                </div>
              );
            }
            return <Loader />;
          }}
        />
      </div>
    );
  }
}

RootIntrusionSet.propTypes = {
  children: PropTypes.node,
  match: PropTypes.object,
  me: PropTypes.object,
};

export default withRouter(RootIntrusionSet);
