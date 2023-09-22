import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Redirect, Route, withRouter } from 'react-router-dom';
import { graphql } from 'react-relay';
import { QueryRenderer, requestSubscription } from '../../../../relay/environment';
import Report from './Report';
import ReportPopover from './ReportPopover';
import ReportKnowledge from './ReportKnowledge';
import ContainerHeader from '../../common/containers/ContainerHeader';
import Loader from '../../../../components/Loader';
import ContainerStixDomainObjects from '../../common/containers/ContainerStixDomainObjects';
import ContainerStixCyberObservables from '../../common/containers/ContainerStixCyberObservables';
import ErrorNotFound from '../../../../components/ErrorNotFound';
import StixCoreObjectFilesAndHistory from '../../common/stix_core_objects/StixCoreObjectFilesAndHistory';
import StixDomainObjectContent from '../../common/stix_domain_objects/StixDomainObjectContent';

const subscription = graphql`
  subscription RootReportSubscription($id: ID!) {
    stixDomainObject(id: $id) {
      ... on Report {
        ...Report_report
        ...ReportKnowledgeGraph_report
        ...ReportEditionContainer_report
      }
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
    }
  }
`;

const reportQuery = graphql`
  query RootReportQuery($id: String!) {
    report(id: $id) {
      standard_id
      ...Report_report
      ...ReportDetails_report
      ...ReportKnowledge_report
      ...ContainerHeader_container
      ...ContainerStixDomainObjects_container
      ...ContainerStixCyberObservables_container
      ...StixDomainObjectContent_stixDomainObject
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
    }
    connectorsForExport {
      ...StixCoreObjectFilesAndHistory_connectorsExport
    }
    connectorsForImport {
      ...StixCoreObjectFilesAndHistory_connectorsImport
    }
  }
`;

class RootReport extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { reportId },
      },
    } = props;
    this.sub = requestSubscription({
      subscription,
      variables: { id: reportId },
    });
  }

  componentWillUnmount() {
    this.sub.dispose();
  }

  render() {
    const {
      match: {
        params: { reportId },
      },
    } = this.props;
    return (
      <div>
        <QueryRenderer
          query={reportQuery}
          variables={{ id: reportId }}
          render={({ props }) => {
            if (props) {
              if (props.report) {
                return (
                  <div>
                    <Route
                      exact
                      path="/dashboard/analyses/reports/:reportId"
                      render={(routeProps) => (
                        <Report {...routeProps} report={props.report} />
                      )}
                    />
                    <Route
                      exact
                      path="/dashboard/analyses/reports/:reportId/entities"
                      render={(routeProps) => (
                        <React.Fragment>
                          <ContainerHeader
                            container={props.report}
                            PopoverComponent={<ReportPopover />}
                            disableSharing={true}
                          />
                          <ContainerStixDomainObjects
                            {...routeProps}
                            container={props.report}
                          />
                        </React.Fragment>
                      )}
                    />
                    <Route
                      exact
                      path="/dashboard/analyses/reports/:reportId/observables"
                      render={(routeProps) => (
                        <React.Fragment>
                          <ContainerHeader
                            container={props.report}
                            PopoverComponent={<ReportPopover />}
                            disableSharing={true}
                          />
                          <ContainerStixCyberObservables
                            {...routeProps}
                            container={props.report}
                          />
                        </React.Fragment>
                      )}
                    />
                    <Route
                      exact
                      path="/dashboard/analyses/reports/:reportId/knowledge"
                      render={() => (
                        <Redirect
                          to={`/dashboard/analyses/reports/${reportId}/knowledge/graph`}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/dashboard/analyses/reports/:reportId/content"
                      render={(routeProps) => (
                        <React.Fragment>
                          <ContainerHeader
                            container={props.report}
                            PopoverComponent={<ReportPopover />}
                            disableSharing={true}
                          />
                          <StixDomainObjectContent
                            {...routeProps}
                            stixDomainObject={props.report}
                          />
                        </React.Fragment>
                      )}
                    />
                    <Route
                      exact
                      path="/dashboard/analyses/reports/:reportId/knowledge/:mode"
                      render={(routeProps) => (
                        <ReportKnowledge
                          {...routeProps}
                          report={props.report}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/dashboard/analyses/reports/:reportId/files"
                      render={(routeProps) => (
                        <React.Fragment>
                          <ContainerHeader
                            container={props.report}
                            PopoverComponent={<ReportPopover />}
                            enableSuggestions={true}
                          />
                          <StixCoreObjectFilesAndHistory
                            {...routeProps}
                            id={reportId}
                            connectorsExport={props.connectorsForExport}
                            connectorsImport={props.connectorsForImport}
                            entity={props.report}
                            withoutRelations={true}
                            bypassEntityId={true}
                          />
                        </React.Fragment>
                      )}
                    />
                  </div>
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

RootReport.propTypes = {
  children: PropTypes.node,
  match: PropTypes.object,
};

export default withRouter(RootReport);
