import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import {
  Route, Redirect, withRouter, Switch,
} from 'react-router-dom';
import graphql from 'babel-plugin-relay/macro';
import { QueryRenderer as QR } from 'react-relay';
import QueryRendererDarkLight from '../../../../relay/environmentDarkLight';
import {
  QueryRenderer,
  requestSubscription,
} from '../../../../relay/environment';
import TopBar from '../../nav/TopBar';
import Risk from './Risk';
import RiskKnowledge from './RiskKnowledge';
import Loader from '../../../../components/Loader';
import FileManager from '../../common/files/FileManager';
import CyioDomainObjectHeader from '../../common/stix_domain_objects/CyioDomainObjectHeader';
import RiskPopover from './RiskPopover';
import StixCoreObjectHistory from '../../common/stix_core_objects/StixCoreObjectHistory';
import StixCoreObjectOrStixCoreRelationshipContainers from '../../common/containers/StixCoreObjectOrStixCoreRelationshipContainers';
import StixDomainObjectIndicators from '../../observations/indicators/StixDomainObjectIndicators';
import Remediations from './Remediations';
import StixCoreRelationship from '../../common/stix_core_relationships/StixCoreRelationship';
import ErrorNotFound from '../../../../components/ErrorNotFound';
import StixCoreObjectKnowledgeBar from '../../common/stix_core_objects/StixCoreObjectKnowledgeBar';
import RiskAnalysisContainer from './RiskAnalysisContainer';
import RiskTracking from './RiskTracking';
import RemediationRoot from './remediations/Root';

// const subscription = graphql`
//   subscription RootRiskSubscription($id: ID!) {
//     stixDomainObject(id: $id) {
//       # ... on ThreatActor {
//       #   ...Risk_risk
//       #   ...RiskEditionContainer_risk
//       # }
//       ...FileImportViewer_entity
//       ...FileExportViewer_entity
//       ...FileExternalReferencesViewer_entity
//     }
//   }
// `;

const riskQuery = graphql`
  query RootRiskQuery($id: ID!) {
    poamItem(id: $id) {
      id
      name
      standard_id
      ...Risk_risk
    }
  }
`;

class RootRisk extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { riskId },
      },
    } = props;
    // this.sub = requestSubscription({
    //   subscription,
    //   variables: { id: riskId },
    // });
  }

  // componentWillUnmount() {
  //   this.sub.dispose();
  // }

  render() {
    const {
      me,
      match: {
        params: { riskId },
      },
    } = this.props;
    const link = `/activities/risk assessment/risks/${riskId}/knowledge`;
    return (
      <div>
        <TopBar me={me || null} />
        <Route path="/activities/risk assessment/risks/:riskId/knowledge">
          <StixCoreObjectKnowledgeBar
            stixCoreObjectLink={link}
            availableSections={[
              'victimology',
              'risks',
              'network',
              'software',
              'incidents',
              'malwares',
              'attack_patterns',
              'tools',
              'vulnerabilities',
              'observables',
              'infrastructures',
              'sightings',
            ]}
          />
        </Route>
        <QR
          environment={QueryRendererDarkLight}
          query={riskQuery}
          variables={{ id: riskId }}
          render={({ error, props, retry }) => {
            console.log('riskError', error);
            if (props) {
              console.log('RiskData', props);
              if (props.poamItem) {
                return (
                  <Switch>
                    <Route
                      exact
                      path="/activities/risk assessment/risks/:riskId"
                      render={(routeProps) => (
                        <Risk
                          {...routeProps}
                          refreshQuery={retry}
                          risk={props.poamItem}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/activities/risk assessment/risks/:riskId/analysis"
                      render={(routeProps) => (
                          <RiskAnalysisContainer
                            {...routeProps}
                            refreshQuery={retry}
                            risk={props.poamItem}
                            riskId={riskId}
                          />
                      )}
                    />
                    {/* <Route
                      exact
                      path="/activities/risk assessment/risks/:riskId/remediation"
                      render={(routeProps) => (
                          <Remediations
                            {...routeProps}
                            risk={props.risk}
                          />
                      )}
                    /> */}
                     <Route
                      exact
                      path="/activities/risk assessment/risks/:riskId/remediation"
                      render={(routeProps) => (
                        <Remediations
                            {...routeProps}
                            refreshQuery={retry}
                            remediation={props.poamItem}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/activities/risk assessment/risks/:riskId/remediation/:remediationId"
                      render={(routeProps) => (
                        <RemediationRoot
                            {...routeProps}
                            risk={props.poamItem}
                        />
                      )}
                    />
                     <Route
                      exact
                      path="/activities/risk assessment/risks/:riskId/tracking"
                      render={(routeProps) => (
                          <RiskTracking
                            {...routeProps}
                            risk={props.poamItem}
                            riskId={riskId}
                          />
                      )}
                    />
                    {/* <Route
                      path="/activities/risk assessment/risks/:riskId/remediation"
                      render={(routeProps) => (
                        <RiskKnowledge
                          {...routeProps}
                          risk={props.threatActor}
                        />
                      )}
                    /> */}
                </Switch>
                );
              }
              return <ErrorNotFound />;
            }
            return <Loader />;
          }}
        />
        {/* <QueryRenderer
          query={riskQuery}
          variables={{ id: riskId }}
          render={({ props }) => {
            if (props) {
              if (props.threatActor) {
                return (
                  <Switch>
                    <Route
                      exact
                      path="/activities/risk assessment/risks/:riskId"
                      render={(routeProps) => (
                        <Risk
                          {...routeProps}
                          risk={props.threatActor}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/activities/risk assessment/risks/:riskId/knowledge"
                      render={() => (
                        <Redirect
                          to={`/activities/risk assessment/risks/${riskId}/knowledge/overview`}
                        />
                      )}
                    />
                    <Route
                      path="/activities/risk assessment/risks/:riskId/knowledge"
                      render={(routeProps) => (
                        <RiskKnowledge
                          {...routeProps}
                          risk={props.threatActor}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/activities/risk assessment/risks/:riskId/analysis"
                      render={(routeProps) => (
                        <React.Fragment>
                          <CyioDomainObjectHeader
                            stixDomainObject={props.threatActor}
                            PopoverComponent={<RiskPopover />}
                          />
                          <StixCoreObjectOrStixCoreRelationshipContainers
                            {...routeProps}
                            stixDomainObjectOrStixCoreRelationship={
                              props.threatActor
                            }
                          />
                        </React.Fragment>
                      )}
                    />
                    <Route
                      exact
                      path="/activities/risk assessment/risks/:riskId/indicators"
                      render={(routeProps) => (
                        <React.Fragment>
                          <CyioDomainObjectHeader
                            stixDomainObject={props.threatActor}
                            PopoverComponent={<RiskPopover />}
                            variant="noaliases"
                          />
                          <StixDomainObjectIndicators
                            {...routeProps}
                            stixDomainObjectId={riskId}
    stixDomainObjectLink={`/activities/risk assessment/risks/${riskId}/indicators`}
                          />
                        </React.Fragment>
                      )}
                    />
                    <Route
                      exact
                    path="/activities/risk assessment/risks/:riskId/indicators
                    /relations/:relationId"
                      render={(routeProps) => (
                        <StixCoreRelationship
                          entityId={riskId}
                          {...routeProps}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/activities/risk assessment/risks/:riskId/files"
                      render={(routeProps) => (
                        <React.Fragment>
                          <CyioDomainObjectHeader
                            stixDomainObject={props.threatActor}
                            PopoverComponent={<RiskPopover />}
                          />
                          <FileManager
                            {...routeProps}
                            id={riskId}
                            connectorsImport={[]}
                            connectorsExport={props.connectorsForExport}
                            entity={props.threatActor}
                          />
                        </React.Fragment>
                      )}
                    />
                    <Route
                      exact
                      path="/activities/risk assessment/risks/:riskId/history"
                      render={(routeProps) => (
                        <React.Fragment>
                          <CyioDomainObjectHeader
                            stixDomainObject={props.threatActor}
                            PopoverComponent={<RiskPopover />}
                          />
                          <StixCoreObjectHistory
                            {...routeProps}
                            cyioCoreObjectId={riskId}
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
        /> */}
      </div>
    );
  }
}

RootRisk.propTypes = {
  children: PropTypes.node,
  match: PropTypes.object,
  me: PropTypes.object,
};

export default withRouter(RootRisk);
