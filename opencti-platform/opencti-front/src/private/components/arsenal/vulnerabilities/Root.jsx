import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Redirect, withRouter, Switch } from 'react-router-dom';
import { graphql } from 'react-relay';
import {
  QueryRenderer,
  requestSubscription,
} from '../../../../relay/environment';
import Vulnerability from './Vulnerability';
import VulnerabilityKnowledge from './VulnerabilityKnowledge';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import FileManager from '../../common/files/FileManager';
import VulnerabilityPopover from './VulnerabilityPopover';
import Loader from '../../../../components/Loader';
import StixCoreObjectHistory from '../../common/stix_core_objects/StixCoreObjectHistory';
import StixCoreObjectOrStixCoreRelationshipContainers from '../../common/containers/StixCoreObjectOrStixCoreRelationshipContainers';
import StixCoreObjectKnowledgeBar from '../../common/stix_core_objects/StixCoreObjectKnowledgeBar';
import ErrorNotFound from '../../../../components/ErrorNotFound';

const subscription = graphql`
  subscription RootVulnerabilitySubscription($id: ID!) {
    stixDomainObject(id: $id) {
      ... on Vulnerability {
        ...Vulnerability_vulnerability
        ...VulnerabilityEditionContainer_vulnerability
      }
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
    }
  }
`;

const vulnerabilityQuery = graphql`
  query RootVulnerabilityQuery($id: String!) {
    vulnerability(id: $id) {
      id
      standard_id
      entity_type
      name
      x_opencti_graph_data
      ...Vulnerability_vulnerability
      ...VulnerabilityReports_vulnerability
      ...VulnerabilityKnowledge_vulnerability
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
    }
    connectorsForImport {
      ...FileManager_connectorsImport
    }
    connectorsForExport {
      ...FileManager_connectorsExport
    }
  }
`;

class RootVulnerability extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { vulnerabilityId },
      },
    } = props;
    this.sub = requestSubscription({
      subscription,
      variables: { id: vulnerabilityId },
    });
  }

  componentWillUnmount() {
    this.sub.dispose();
  }

  render() {
    const {
      match: {
        params: { vulnerabilityId },
      },
    } = this.props;
    const link = `/dashboard/arsenal/vulnerabilities/${vulnerabilityId}/knowledge`;
    return (
      <div>
        <Route path="/dashboard/arsenal/vulnerabilities/:vulnerabilityId/knowledge">
          <StixCoreObjectKnowledgeBar
            stixCoreObjectLink={link}
            availableSections={[
              'threats',
              'threat_actors',
              'intrusion_sets',
              'campaigns',
              'incidents',
              'malwares',
              'tools',
              'attack_patterns',
              'indicators',
              'observables',
              'sightings',
              'infrastructures',
            ]}
          />
        </Route>
        <QueryRenderer
          query={vulnerabilityQuery}
          variables={{ id: vulnerabilityId }}
          render={({ props }) => {
            if (props) {
              if (props.vulnerability) {
                return (
                  <Switch>
                    <Route
                      exact
                      path="/dashboard/arsenal/vulnerabilities/:vulnerabilityId"
                      render={(routeProps) => (
                        <Vulnerability
                          {...routeProps}
                          vulnerability={props.vulnerability}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/dashboard/arsenal/vulnerabilities/:vulnerabilityId/knowledge"
                      render={() => (
                        <Redirect
                          to={`/dashboard/arsenal/vulnerabilities/${vulnerabilityId}/knowledge/overview`}
                        />
                      )}
                    />
                    <Route
                      path="/dashboard/arsenal/vulnerabilities/:vulnerabilityId/knowledge"
                      render={(routeProps) => (
                        <VulnerabilityKnowledge
                          {...routeProps}
                          vulnerability={props.vulnerability}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/dashboard/arsenal/vulnerabilities/:vulnerabilityId/analyses"
                      render={(routeProps) => (
                        <React.Fragment>
                          <StixDomainObjectHeader
                            entityType={'Vulnerability'}
                            stixDomainObject={props.vulnerability}
                            PopoverComponent={<VulnerabilityPopover />}
                          />
                          <StixCoreObjectOrStixCoreRelationshipContainers
                            {...routeProps}
                            stixDomainObjectOrStixCoreRelationship={
                              props.vulnerability
                            }
                          />
                        </React.Fragment>
                      )}
                    />
                    <Route
                      exact
                      path="/dashboard/arsenal/vulnerabilities/:vulnerabilityId/files"
                      render={(routeProps) => (
                        <React.Fragment>
                          <StixDomainObjectHeader
                            entityType={'Vulnerability'}
                            stixDomainObject={props.vulnerability}
                            PopoverComponent={<VulnerabilityPopover />}
                          />
                          <FileManager
                            {...routeProps}
                            id={vulnerabilityId}
                            connectorsImport={props.connectorsForImport}
                            connectorsExport={props.connectorsForExport}
                            entity={props.vulnerability}
                          />
                        </React.Fragment>
                      )}
                    />
                    <Route
                      exact
                      path="/dashboard/arsenal/vulnerabilities/:vulnerabilityId/history"
                      render={(routeProps) => (
                        <React.Fragment>
                          <StixDomainObjectHeader
                            entityType={'Vulnerability'}
                            stixDomainObject={props.vulnerability}
                            PopoverComponent={<VulnerabilityPopover />}
                          />
                          <StixCoreObjectHistory
                            {...routeProps}
                            stixCoreObjectId={vulnerabilityId}
                          />
                        </React.Fragment>
                      )}
                    />
                  </Switch>
                );
              }
              return <ErrorNotFound />;
            }
            return <Loader />;
          }}
        />
      </div>
    );
  }
}

RootVulnerability.propTypes = {
  children: PropTypes.node,
  match: PropTypes.object,
};

export default withRouter(RootVulnerability);
