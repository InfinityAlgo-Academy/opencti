import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, withRouter } from 'react-router-dom';
import graphql from 'babel-plugin-relay/macro';
import {
  QueryRenderer,
  requestSubscription,
} from '../../../../relay/environment';
import TopBar from '../../nav/TopBar';
import Opinion from './Opinion';
import FileManager from '../../common/files/FileManager';
import StixCoreObjectHistory from '../../common/stix_core_objects/StixCoreObjectHistory';
import ContainerHeader from '../../common/containers/ContainerHeader';
import Loader from '../../../../components/Loader';
import ReportPopover from '../reports/ReportPopover';

const subscription = graphql`
  subscription RootOpinionSubscription($id: ID!) {
    stixDomainObject(id: $id) {
      ... on Opinion {
        ...Opinion_opinion
        ...OpinionEditionContainer_opinion
      }
      ...FileImportViewer_entity
      ...FileExportViewer_entity
    }
  }
`;

const opinionQuery = graphql`
  query RootOpinionQuery($id: String!) {
    opinion(id: $id) {
      standard_id
      ...Opinion_opinion
      ...OpinionDetails_opinion
      ...ContainerHeader_container
      ...ContainerStixDomainObjects_container
      ...ContainerStixObjectsOrStixRelationships_container
      ...FileImportViewer_entity
      ...FileExportViewer_entity
    }
    connectorsForExport {
      ...FileManager_connectorsExport
    }
    connectorsForImport {
      ...FileManager_connectorsImport
    }
  }
`;

class RootOpinion extends Component {
  componentDidMount() {
    const {
      match: {
        params: { opinionId },
      },
    } = this.props;
    const sub = requestSubscription({
      subscription,
      variables: { id: opinionId },
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
        params: { opinionId },
      },
    } = this.props;
    return (
      <div>
        <TopBar me={me || null} />
        <QueryRenderer
          query={opinionQuery}
          variables={{ id: opinionId }}
          render={({ props }) => {
            if (props && props.opinion) {
              return (
                <div>
                  <Route
                    exact
                    path="/dashboard/analysis/opinions/:opinionId"
                    render={(routeProps) => (
                      <Opinion {...routeProps} opinion={props.opinion} />
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/analysis/opinions/:opinionId/files"
                    render={(routeProps) => (
                      <React.Fragment>
                        <ContainerHeader
                          container={props.opinion}
                          PopoverComponent={<ReportPopover />}
                        />
                        <FileManager
                          {...routeProps}
                          id={opinionId}
                          connectorsExport={props.connectorsForExport}
                          connectorsImport={props.connectorsForImport}
                          entity={props.opinion}
                        />
                      </React.Fragment>
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/analysis/opinions/:opinionId/history"
                    render={(routeProps) => (
                      <React.Fragment>
                        <ContainerHeader
                          container={props.opinion}
                          PopoverComponent={<ReportPopover />}
                        />
                        <StixCoreObjectHistory
                          {...routeProps}
                          stixCoreObjectId={opinionId}
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

RootOpinion.propTypes = {
  children: PropTypes.node,
  match: PropTypes.object,
  me: PropTypes.object,
};

export default withRouter(RootOpinion);
