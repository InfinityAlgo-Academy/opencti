/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO Remove this when V6
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useMemo } from 'react';
import { graphql, useLazyLoadQuery, usePreloadedQuery, useQueryLoader, useSubscription } from 'react-relay';
import { Link, Route, Routes, useParams, useLocation, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Report from './Report';
import ReportPopover from './ReportPopover';
import ReportKnowledge from './ReportKnowledge';
import ContainerHeader from '../../common/containers/ContainerHeader';
import Loader from '../../../../components/Loader';
import ContainerStixDomainObjects from '../../common/containers/ContainerStixDomainObjects';
import ContainerStixCyberObservables from '../../common/containers/ContainerStixCyberObservables';
import StixCoreObjectFilesAndHistory from '../../common/stix_core_objects/StixCoreObjectFilesAndHistory';
import StixDomainObjectContent from '../../common/stix_domain_objects/StixDomainObjectContent';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { useFormatter } from '../../../../components/i18n';
import { useIsEnforceReference } from '../../../../utils/hooks/useEntitySettings';
import useGranted, { BYPASSREFERENCE } from '../../../../utils/hooks/useGranted';

const subscription = graphql`
  subscription RootReportSubscription($id: ID!) {
    stixDomainObject(id: $id) {
      ... on Report {
        ...Report_report
        ...ReportKnowledgeGraph_report
        ...ReportEditionContainer_report
        ...StixDomainObjectContent_stixDomainObject
      }
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
    }
  }
`;

function useRootReportSubscription(
  id: string,
) {
  const config = useMemo(() => ({
    subscription,
    variables: { id },
  }), [id]);
  return useSubscription(config);
}

const reportQuery = graphql`
  query RootReportQuery($id: String!) {
    report(id: $id) {
      id
      standard_id
      entity_type
      name
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

const RenderRootReport: FunctionComponent<{ queryRef: PreloadedQuery<RootStixCyberObservableQuery> }> = ({ queryRef }) => {
  const enableReferences = useIsEnforceReference('Report') && !useGranted([BYPASSREFERENCE]);
  const { report, connectorsForExport, connectorsForImport } = usePreloadedQuery(
    reportQuery,
    queryRef,
  );
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Report report={report} />
        }
      />
      <Route
        path="/entities"
        element={
          <ContainerStixDomainObjects
            container={report}
            enableReferences={enableReferences}
          />
        }
      />
      <Route
        path="/observables"
        element={
          <ContainerStixCyberObservables
            container={report}
            enableReferences={enableReferences}
          />
        }
      />
      <Route
        path="/knowledge"
        element={<Navigate to={`/dashboard/analyses/reports/${report.id}/knowledge/graph`} />}
      />
      <Route
        path="/content"
        element={
          <StixDomainObjectContent
            stixDomainObject={report}
          />
        }
      />
      <Route
        path="/knowledge/*"
        element={
          <ReportKnowledge
            report={report}
            enableReferences={enableReferences}
          />
        }
      />
      <Route
        path="/files"
        element={
          <StixCoreObjectFilesAndHistory
            id={report.id}
            connectorsExport={connectorsForExport}
            connectorsImport={connectorsForImport}
            entity={report}
            withoutRelations={true}
            bypassEntityId={true}
          />
        }
      />
    </Routes>
  );
};

const ReportHeader = () => {
  const { t_i18n } = useFormatter();
  const { pathname } = useLocation();
  const { reportId } = useParams();
  const { report } = useLazyLoadQuery(
    reportQuery,
    { id: reportId },
  );
  const isOverview = pathname === `/dashboard/analyses/reports/${report.id}`;
  return (
    <>
      <Breadcrumbs variant="object" elements={[
        { label: t_i18n('Analyses') },
        { label: t_i18n('Reports'), link: '/dashboard/analyses/reports' },
        { label: report.name, current: true },
      ]}
      />
      <ContainerHeader
        container={report}
        PopoverComponent={
          <ReportPopover id={report.id} />
        }
        enableQuickSubscription={true}
        enableQuickExport={true}
        enableAskAi={true}
        overview={isOverview}
      />
    </>
  );
};

const ReportTabs = () => {
  const { t_i18n } = useFormatter();
  const location = useLocation();
  const { reportId } = useParams();
  const baseUrl = `/dashboard/analyses/reports/${reportId}`;
  const linkKnowledge = `${baseUrl}/knowledge`;
  return (
    <Tabs
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        marginBottom: 4,
      }}
      value={
        location.pathname.includes(linkKnowledge)
          ? linkKnowledge
          : location.pathname
      }
    >
      <Tab
        component={Link}
        to={`${baseUrl}`}
        value={`${baseUrl}`}
        label={t_i18n('Overview')}
      />
      <Tab
        component={Link}
        to={`${linkKnowledge}/graph`}
        value={`${linkKnowledge}`}
        label={t_i18n('Knowledge')}
      />
      <Tab
        component={Link}
        to={`${baseUrl}/content`}
        value={`${baseUrl}/content`}
        label={t_i18n('Content')}
      />
      <Tab
        component={Link}
        to={`${baseUrl}/entities`}
        value={`${baseUrl}/entities`}
        label={t_i18n('Entities')}
      />
      <Tab
        component={Link}
        to={`${baseUrl}/observables`}
        value={`${baseUrl}/observables`}
        label={t_i18n('Observables')}
      />
      <Tab
        component={Link}
        to={`${baseUrl}/files`}
        value={`${baseUrl}/files`}
        label={t_i18n('Data')}
      />
    </Tabs>
  );
};

const ReportContent = () => {
  const { reportId } = useParams();
  const variables: reportQuery$variables = { id: reportId };
  useRootReportSubscription(reportId);
  const [queryRef, fetchLoadQuery] = useQueryLoader<RootreportQuery>(
    reportQuery,
  );
  useEffect(
    () => {
      fetchLoadQuery(variables);
    },
    [],
  );
  return queryRef ? (
    <React.Suspense fallback={<Loader />}>
      <RenderRootReport queryRef={queryRef} />
    </React.Suspense>
  ) : (<Loader />);
};

const RootReport = () => {
  const paddingRight = () => {
    const { pathname } = useLocation();
    if (pathname.includes('/entities')) return '250px';
    if (pathname.includes('/observables')) return '250px';
    if (pathname.includes('/content')) return '350px';
    return '0px';
  };
  return (
    <Box sx={{ paddingRight }} data-testid="report-details-page">
      <ReportHeader />
      <ReportTabs />
      <ReportContent />
    </Box>
  );
};

export default RootReport;
