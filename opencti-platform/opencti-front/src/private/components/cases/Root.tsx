/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO Remove this when V6
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { Suspense, lazy } from 'react';
import { Redirect, Switch } from 'react-router-dom';
import { useIsHiddenEntity } from '../../../utils/hooks/useEntitySettings';
import { BoundaryRoute } from '../Error';
import Loader from '../../../components/Loader';

const CaseIncidents = lazy(() => import('./CaseIncidents'));
const RootIncident = lazy(() => import('./case_incidents/Root'));
const CaseRfis = lazy(() => import('./CaseRfis'));
const RootCaseRfi = lazy(() => import('./case_rfis/Root'));
const CaseRfts = lazy(() => import('./CaseRfts'));
const RootCaseRft = lazy(() => import('./case_rfts/Root'));
const Tasks = lazy(() => import('./Tasks'));
const RootTask = lazy(() => import('./tasks/Root'));
const Feedbacks = lazy(() => import('./Feedbacks'));
const RootFeedback = lazy(() => import('./feedbacks/Root'));

const Root = () => {
  let redirect: string | null = null;
  if (!useIsHiddenEntity('Case-Incident')) {
    redirect = 'incidents';
  } else if (!useIsHiddenEntity('Case-Rfi')) {
    redirect = 'rfis';
  } else if (!useIsHiddenEntity('Case-Rft')) {
    redirect = 'rfts';
  } else if (!useIsHiddenEntity('Feedback')) {
    redirect = 'feedbacks';
  } else if (!useIsHiddenEntity('Task')) {
    redirect = 'tasks';
  }

  return (
    <Suspense fallback={<Loader />}>
      <Switch>
        <BoundaryRoute
          exact
          path="/dashboard/cases"
          render={() => <Redirect to={`/dashboard/cases/${redirect}`} />}
        />
        <BoundaryRoute
          exact
          path="/dashboard/cases/incidents"
          component={CaseIncidents}
        />
        <BoundaryRoute
          path="/dashboard/cases/incidents/:caseId"
          component={RootIncident}
        />
        <BoundaryRoute
          exact
          path="/dashboard/cases/rfis"
          component={CaseRfis}
        />
        <BoundaryRoute
          path="/dashboard/cases/rfis/:caseId"
          component={RootCaseRfi}
        />
        <BoundaryRoute
          exact
          path="/dashboard/cases/rfts"
          component={CaseRfts}
        />
        <BoundaryRoute
          path="/dashboard/cases/rfts/:caseId"
          component={RootCaseRft}
        />
        <BoundaryRoute
          exact
          path="/dashboard/cases/tasks"
          component={Tasks}
        />
        <BoundaryRoute
          path="/dashboard/cases/tasks/:taskId"
          component={RootTask}
        />
        <BoundaryRoute
          exact
          path="/dashboard/cases/feedbacks"
          component={Feedbacks}
        />
        <BoundaryRoute
          path="/dashboard/cases/feedbacks/:caseId"
          component={RootFeedback}
        />
      </Switch>
    </Suspense>
  );
};

export default Root;
