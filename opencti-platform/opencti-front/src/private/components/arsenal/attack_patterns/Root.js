import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Redirect, withRouter } from 'react-router-dom';
import graphql from 'babel-plugin-relay/macro';
import {
  QueryRenderer,
  requestSubscription,
} from '../../../../relay/environment';
import TopBar from '../../nav/TopBar';
import AttackPattern from './AttackPattern';
import AttackPatternKnowledge from './AttackPatternKnowledge';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import FileManager from '../../common/files/FileManager';
import AttackPatternPopover from './AttackPatternPopover';
import Loader from '../../../../components/Loader';
import StixCoreObjectHistory from '../../common/stix_core_objects/StixCoreObjectHistory';
import StixCoreObjectOrStixCoreRelationshipContainers from '../../common/containers/StixCoreObjectOrStixCoreRelationshipContainers';
import StixDomainObjectIndicators from '../../observations/indicators/StixDomainObjectIndicators';
import StixCoreRelationship from '../../common/stix_core_relationships/StixCoreRelationship';

const subscription = graphql`
  subscription RootAttackPatternSubscription($id: ID!) {
    stixDomainObject(id: $id) {
      ... on AttackPattern {
        ...AttackPattern_attackPattern
        ...AttackPatternEditionContainer_attackPattern
      }
      ...FileImportViewer_entity
      ...FileExportViewer_entity
    }
  }
`;

const attackPatternQuery = graphql`
  query RootAttackPatternQuery($id: String!) {
    attackPattern(id: $id) {
      id
      standard_id
      name
      aliases
      ...AttackPattern_attackPattern
      ...AttackPatternKnowledge_attackPattern
      ...FileImportViewer_entity
      ...FileExportViewer_entity
    }
    connectorsForExport {
      ...FileManager_connectorsExport
    }
  }
`;

class RootAttackPattern extends Component {
  componentDidMount() {
    const {
      match: {
        params: { attackPatternId },
      },
    } = this.props;
    const sub = requestSubscription({
      subscription,
      variables: { id: attackPatternId },
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
        params: { attackPatternId },
      },
    } = this.props;
    return (
      <div>
        <TopBar me={me || null} />
        <QueryRenderer
          query={attackPatternQuery}
          variables={{ id: attackPatternId }}
          render={({ props }) => {
            if (props && props.attackPattern) {
              return (
                <div>
                  <Route
                    exact
                    path="/dashboard/arsenal/attack_patterns/:attackPatternId"
                    render={(routeProps) => (
                      <AttackPattern
                        {...routeProps}
                        attackPattern={props.attackPattern}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/arsenal/attack_patterns/:attackPatternId/knowledge"
                    render={() => (
                      <Redirect
                        to={`/dashboard/arsenal/attack_patterns/${attackPatternId}/knowledge/overview`}
                      />
                    )}
                  />
                  <Route
                    path="/dashboard/arsenal/attack_patterns/:attackPatternId/knowledge"
                    render={(routeProps) => (
                      <AttackPatternKnowledge
                        {...routeProps}
                        attackPattern={props.attackPattern}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/arsenal/attack_patterns/:attackPatternId/analysis"
                    render={(routeProps) => (
                      <React.Fragment>
                        <StixDomainObjectHeader
                          stixDomainObject={props.attackPattern}
                          PopoverComponent={<AttackPatternPopover />}
                        />
                        <StixCoreObjectOrStixCoreRelationshipContainers
                          {...routeProps}
                          stixCoreObjectOrStixCoreRelationshipId={
                            attackPatternId
                          }
                        />
                      </React.Fragment>
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/arsenal/attack_patterns/:attackPatternId/indicators"
                    render={(routeProps) => (
                      <React.Fragment>
                        <StixDomainObjectHeader
                          stixDomainObject={props.attackPattern}
                          PopoverComponent={<AttackPatternPopover />}
                          variant="noaliases"
                        />
                        <StixDomainObjectIndicators
                          {...routeProps}
                          stixDomainObjectId={attackPatternId}
                          stixDomainObjectLink={`/dashboard/arsenal/attack_patterns/${attackPatternId}/indicators`}
                        />
                      </React.Fragment>
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/arsenal/attack_patterns/:attackPatternId/indicators/relations/:relationId"
                    render={(routeProps) => (
                      <StixCoreRelationship
                        entityId={attackPatternId}
                        {...routeProps}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/arsenal/attack_patterns/:attackPatternId/files"
                    render={(routeProps) => (
                      <React.Fragment>
                        <StixDomainObjectHeader
                          stixDomainObject={props.attackPattern}
                          PopoverComponent={<AttackPatternPopover />}
                        />
                        <FileManager
                          {...routeProps}
                          id={attackPatternId}
                          connectorsExport={props.connectorsForExport}
                          connectorsImport={[]}
                          entity={props.attackPattern}
                        />
                      </React.Fragment>
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/arsenal/attack_patterns/:attackPatternId/history"
                    render={(routeProps) => (
                      <React.Fragment>
                        <StixDomainObjectHeader
                          stixDomainObject={props.attackPattern}
                          PopoverComponent={<AttackPatternPopover />}
                        />
                        <StixCoreObjectHistory
                          {...routeProps}
                          stixCoreObjectId={attackPatternId}
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

RootAttackPattern.propTypes = {
  children: PropTypes.node,
  match: PropTypes.object,
  me: PropTypes.object,
};

export default withRouter(RootAttackPattern);
