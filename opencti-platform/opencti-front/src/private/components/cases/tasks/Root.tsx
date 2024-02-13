/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO Remove this when V6
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useMemo } from 'react';
import { Link, Route, Switch, useParams } from 'react-router-dom';
import { graphql, usePreloadedQuery, useSubscription } from 'react-relay';
import { GraphQLSubscriptionConfig } from 'relay-runtime';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useLocation } from 'react-router-dom-v5-compat';
import ErrorNotFound from '../../../../components/ErrorNotFound';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import Loader, { LoaderVariant } from '../../../../components/Loader';
import ContainerHeader from '../../common/containers/ContainerHeader';
import StixDomainObjectContent from '../../common/stix_domain_objects/StixDomainObjectContent';
import StixCoreObjectFilesAndHistory from '../../common/stix_core_objects/StixCoreObjectFilesAndHistory';
import StixCoreObjectHistory from '../../common/stix_core_objects/StixCoreObjectHistory';
import CaseTask from './Task';
import TasksPopover from './TaskPopover';
import { RootTaskQuery } from './__generated__/RootTaskQuery.graphql';
import { RootTaskSubscription } from './__generated__/RootTaskSubscription.graphql';
import { useFormatter } from '../../../../components/i18n';
import Breadcrumbs from '../../../../components/Breadcrumbs';

const subscription = graphql`
  subscription RootTaskSubscription($id: ID!) {
    stixDomainObject(id: $id) {
      ... on Task {
        ...Tasks_tasks
      }
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
    }
  }
`;

const TaskQuery = graphql`
  query RootTaskQuery($id: String!) {
    task(id: $id) {
      id
      standard_id
      name
      x_opencti_graph_data
      ...Tasks_tasks
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
      ...StixDomainObjectContent_stixDomainObject
    }
    connectorsForExport {
      ...StixCoreObjectFilesAndHistory_connectorsExport
    }
    connectorsForImport {
      ...StixCoreObjectFilesAndHistory_connectorsImport
    }
  }
`;

const RootTaskComponent = ({ queryRef, taskId }) => {
  const subConfig = useMemo<GraphQLSubscriptionConfig<RootTaskSubscription>>(
    () => ({
      subscription,
      variables: { id: taskId },
    }),
    [taskId],
  );
  const location = useLocation();
  const { t_i18n } = useFormatter();
  useSubscription(subConfig);
  const {
    task: data,
    connectorsForExport,
    connectorsForImport,
  } = usePreloadedQuery<RootTaskQuery>(TaskQuery, queryRef);
  let paddingRight = 0;
  if (data) {
    if (
      location.pathname.includes(`/dashboard/cases/tasks/${data.id}/content`)
    ) {
      paddingRight = 350;
    }
  }
  return (
    <>
      {data ? (
        <div style={{ paddingRight }}>
          <Breadcrumbs variant="object" elements={[
            { label: t_i18n('Cases') },
            { label: t_i18n('Tasks'), link: '/dashboard/cases/tasks' },
            { label: data.name, current: true },
          ]}
          />
          <ContainerHeader
            container={data}
            PopoverComponent={<TasksPopover id={data.id} />}
            enableSuggestions={false}
          />
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              marginBottom: 4,
            }}
          >
            <Tabs
              value={
                location.pathname.includes(
                  `/dashboard/cases/tasks/${data.id}/knowledge`,
                )
                  ? `/dashboard/cases/tasks/${data.id}/knowledge`
                  : location.pathname
              }
            >
              <Tab
                component={Link}
                to={`/dashboard/cases/tasks/${data.id}`}
                value={`/dashboard/cases/tasks/${data.id}`}
                label={t_i18n('Overview')}
              />
              <Tab
                component={Link}
                to={`/dashboard/cases/tasks/${data.id}/content`}
                value={`/dashboard/cases/tasks/${data.id}/content`}
                label={t_i18n('Content')}
              />
              <Tab
                component={Link}
                to={`/dashboard/cases/tasks/${data.id}/files`}
                value={`/dashboard/cases/tasks/${data.id}/files`}
                label={t_i18n('Data')}
              />
              <Tab
                component={Link}
                to={`/dashboard/cases/tasks/${data.id}/history`}
                value={`/dashboard/cases/tasks/${data.id}/history`}
                label={t_i18n('History')}
              />
            </Tabs>
          </Box>
          <Switch>
            <Route
              exact
              path="/dashboard/cases/tasks/:taskId"
              render={() => <CaseTask data={data} />}
            />
            <Route
              exact
              path="/dashboard/cases/tasks/:taskId/content"
              render={(routeProps) => (
                <StixDomainObjectContent
                  {...routeProps}
                  stixDomainObject={data}
                />
              )}
            />
            <Route
              exact
              path="/dashboard/cases/tasks/:taskId/files"
              render={(routeProps) => (
                <StixCoreObjectFilesAndHistory
                  {...routeProps}
                  id={taskId}
                  connectorsExport={connectorsForExport}
                  connectorsImport={connectorsForImport}
                  entity={data}
                  withoutRelations={true}
                  bypassEntityId={true}
                />
              )}
            />
            <Route
              exact
              path="/dashboard/cases/tasks/:taskId/history"
              render={(routeProps: any) => (
                <StixCoreObjectHistory
                  {...routeProps}
                  stixCoreObjectId={taskId}
                />
              )}
            />
          </Switch>
        </div>
      ) : (
        <ErrorNotFound />
      )}
    </>
  );
};

const Root = () => {
  const { taskId } = useParams() as { taskId: string };
  const queryRef = useQueryLoading<RootTaskQuery>(TaskQuery, {
    id: taskId,
  });
  return (
    <>
      {queryRef && (
        <React.Suspense fallback={<Loader variant={LoaderVariant.container} />}>
          <RootTaskComponent queryRef={queryRef} taskId={taskId} />
        </React.Suspense>
      )}
    </>
  );
};

export default Root;
