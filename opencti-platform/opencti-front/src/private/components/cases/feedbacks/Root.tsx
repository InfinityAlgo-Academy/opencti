/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO Remove this when V6
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useMemo } from 'react';
import { Route, Redirect, Switch, useParams } from 'react-router-dom';
import { graphql, usePreloadedQuery, useSubscription } from 'react-relay';
import { GraphQLSubscriptionConfig } from 'relay-runtime';
import TopBar from '../../nav/TopBar';
import ErrorNotFound from '../../../../components/ErrorNotFound';
import useAuth from '../../../../utils/hooks/useAuth';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import Loader, { LoaderVariant } from '../../../../components/Loader';
import Case from './Feedback';
import { RootFeedbackSubscription } from './__generated__/RootFeedbackSubscription.graphql';
import { RootFeedbackQuery } from './__generated__/RootFeedbackQuery.graphql';
import ContainerHeader from '../../common/containers/ContainerHeader';
import FileManager from '../../common/files/FileManager';
import FeedbackPopover from './FeedbackPopover';
import StixCoreObjectHistory from '../../common/stix_core_objects/StixCoreObjectHistory';
import StixDomainObjectContent from '../../common/stix_domain_objects/StixDomainObjectContent';

const subscription = graphql`
  subscription RootFeedbackSubscription($id: ID!) {
    stixDomainObject(id: $id) {
      ... on Case {
        ...Feedback_case
      }
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
    }
  }
`;

const feedbackQuery = graphql`
  query RootFeedbackQuery($id: String!) {
    case(id: $id) {
      id
      name
      ...Feedback_case
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
      ...StixDomainObjectContent_stixDomainObject
    }
    connectorsForExport {
      ...FileManager_connectorsExport
    }
    connectorsForImport {
      ...FileManager_connectorsImport
    }
  }
`;

const RootCaseComponent = ({ queryRef }) => {
  const { me } = useAuth();
  const { caseId } = useParams() as { caseId: string };
  const subConfig = useMemo<GraphQLSubscriptionConfig<RootFeedbackSubscription>>(
    () => ({
      subscription,
      variables: { id: caseId },
    }),
    [caseId],
  );
  useSubscription(subConfig);
  const {
    case: caseData,
    connectorsForExport,
    connectorsForImport,
  } = usePreloadedQuery<RootCaseQuery>(feedbackQuery, queryRef);
  return (
    <div>
      <TopBar me={me} />
      <>
        {caseData ? (
          <Switch>
            <Route
              exact
              path="/dashboard/cases/feedbacks/:caseId"
              render={() => <Case data={caseData} />}
            />
            <Route
              exact
              path="/dashboard/cases/feedbacks/:caseId/knowledge"
              render={() => (
                <Redirect
                  to={`/dashboard/cases/feedbacks/${caseId}/knowledge/overview`}
                />
              )}
            />
            <Route
              exact
              path="/dashboard/cases/feedbacks/:caseId/content"
              render={(routeProps) => (
                <React.Fragment>
                  <ContainerHeader
                    container={caseData}
                    PopoverComponent={<FeedbackPopover id={caseData.id} />}
                    disableSharing={true}
                  />
                  <StixDomainObjectContent
                    {...routeProps}
                    stixDomainObject={caseData}
                  />
                </React.Fragment>
              )}
            />
            <Route
              exact
              path="/dashboard/cases/feedbacks/:caseId/files"
              render={(routeProps: any) => (
                <React.Fragment>
                  <ContainerHeader
                    container={caseData}
                    PopoverComponent={<FeedbackPopover id={caseData.id} />}
                    enableSuggestions={false}
                    disableSharing={true}
                  />
                  <FileManager
                    {...routeProps}
                    id={caseId}
                    connectorsExport={connectorsForExport}
                    connectorsImport={connectorsForImport}
                    entity={caseData}
                  />
                </React.Fragment>
              )}
            />
            <Route
              exact
              path="/dashboard/cases/feedbacks/:caseId/history"
              render={(routeProps: any) => (
                <React.Fragment>
                  <ContainerHeader
                    container={caseData}
                    PopoverComponent={<FeedbackPopover id={caseData.id} />}
                    enableSuggestions={false}
                    disableSharing={true}
                  />
                  <StixCoreObjectHistory
                    {...routeProps}
                    stixCoreObjectId={caseId}
                  />
                </React.Fragment>
              )}
            />
          </Switch>
        ) : (
          <ErrorNotFound />
        )}
      </>
    </div>
  );
};

const Root = () => {
  const { caseId } = useParams() as { caseId: string };
  const queryRef = useQueryLoading<RootFeedbackQuery>(feedbackQuery, { id: caseId });
  return queryRef ? (
    <React.Suspense fallback={<Loader variant={LoaderVariant.inElement} />}>
      <RootCaseComponent queryRef={queryRef} />
    </React.Suspense>
  ) : (
    <Loader variant={LoaderVariant.inElement} />
  );
};

export default Root;
