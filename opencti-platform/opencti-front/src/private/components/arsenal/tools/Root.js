import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Redirect, withRouter } from 'react-router-dom';
import graphql from 'babel-plugin-relay/macro';
import {
  QueryRenderer,
  requestSubscription,
} from '../../../../relay/environment';
import TopBar from '../../nav/TopBar';
import Tool from './Tool';
import ToolKnowledge from './ToolKnowledge';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import FileManager from '../../common/files/FileManager';
import ToolPopover from './ToolPopover';
import Loader from '../../../../components/Loader';
import StixCoreObjectHistory from '../../common/stix_core_objects/StixCoreObjectHistory';
import StixDomainObjectIndicators from '../../observations/indicators/StixDomainObjectIndicators';
import StixCoreObjectOrStixCoreRelationshipContainers from '../../common/containers/StixCoreObjectOrStixCoreRelationshipContainers';

const subscription = graphql`
  subscription RootToolSubscription($id: ID!) {
    stixDomainObject(id: $id) {
      ... on Tool {
        ...Tool_tool
        ...ToolEditionContainer_tool
      }
      ...FileImportViewer_entity
      ...FileExportViewer_entity
    }
  }
`;

const toolQuery = graphql`
  query RootToolQuery($id: String!) {
    tool(id: $id) {
      id
      standard_id
      name
      aliases
      ...Tool_tool
      ...ToolKnowledge_tool
      ...FileImportViewer_entity
      ...FileExportViewer_entity
    }
    connectorsForExport {
      ...FileManager_connectorsExport
    }
  }
`;

class RootTool extends Component {
  componentDidMount() {
    const {
      match: {
        params: { toolId },
      },
    } = this.props;
    const sub = requestSubscription({
      subscription,
      variables: { id: toolId },
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
        params: { toolId },
      },
    } = this.props;
    return (
      <div>
        <TopBar me={me || null} />
        <QueryRenderer
          query={toolQuery}
          variables={{ id: toolId }}
          render={({ props }) => {
            if (props && props.tool) {
              return (
                <div>
                  <Route
                    exact
                    path="/dashboard/arsenal/tools/:toolId"
                    render={(routeProps) => (
                      <Tool {...routeProps} tool={props.tool} />
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/arsenal/tools/:toolId/knowledge"
                    render={() => (
                      <Redirect
                        to={`/dashboard/arsenal/tools/${toolId}/knowledge/overview`}
                      />
                    )}
                  />
                  <Route
                    path="/dashboard/arsenal/tools/:toolId/knowledge"
                    render={(routeProps) => (
                      <ToolKnowledge {...routeProps} tool={props.tool} />
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/arsenal/tools/:toolId/analysis"
                    render={(routeProps) => (
                      <React.Fragment>
                        <StixDomainObjectHeader
                          stixDomainObject={props.tool}
                          PopoverComponent={<ToolPopover />}
                        />
                        <StixCoreObjectOrStixCoreRelationshipContainers
                          {...routeProps}
                          stixCoreObjectOrStixCoreRelationshipId={toolId}
                        />
                      </React.Fragment>
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/arsenal/tools/:toolId/indicators"
                    render={(routeProps) => (
                      <React.Fragment>
                        <StixDomainObjectHeader
                          stixDomainObject={props.tool}
                          PopoverComponent={<ToolPopover />}
                          variant="noaliases"
                        />
                        <StixDomainObjectIndicators
                          {...routeProps}
                          stixDomainObjectId={toolId}
                          stixDomainObjectLink={`/dashboard/arsenal/tools/${toolId}/indicators`}
                        />
                      </React.Fragment>
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/arsenal/tools/:toolId/files"
                    render={(routeProps) => (
                      <React.Fragment>
                        <StixDomainObjectHeader
                          stixDomainObject={props.tool}
                          PopoverComponent={<ToolPopover />}
                        />
                        <FileManager
                          {...routeProps}
                          id={toolId}
                          connectorsImport={[]}
                          connectorsExport={props.connectorsForExport}
                          entity={props.tool}
                        />
                      </React.Fragment>
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/arsenal/tools/:toolId/history"
                    render={(routeProps) => (
                      <React.Fragment>
                        <StixDomainObjectHeader
                          stixDomainObject={props.tool}
                          PopoverComponent={<ToolPopover />}
                        />
                        <StixCoreObjectHistory
                          {...routeProps}
                          stixCoreObjectId={toolId}
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

RootTool.propTypes = {
  children: PropTypes.node,
  match: PropTypes.object,
  me: PropTypes.object,
};

export default withRouter(RootTool);
