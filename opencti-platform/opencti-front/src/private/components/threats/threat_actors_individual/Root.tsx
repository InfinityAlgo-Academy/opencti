/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO Remove this when V6
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useMemo } from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';
import { graphql, usePreloadedQuery, useSubscription } from 'react-relay';
import { GraphQLSubscriptionConfig } from 'relay-runtime';
import ErrorNotFound from '../../../../components/ErrorNotFound';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import Loader, { LoaderVariant } from '../../../../components/Loader';
import StixCoreObjectHistory from '../../common/stix_core_objects/StixCoreObjectHistory';
import { RootThreatActorIndividualQuery } from './__generated__/RootThreatActorIndividualQuery.graphql';
import { RootThreatActorIndividualSubscription } from './__generated__/RootThreatActorIndividualSubscription.graphql';
import ThreatActorIndividualPopover from './ThreatActorIndividualPopover';
import ThreatActorIndividual from './ThreatActorIndividual';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import FileManager from '../../common/files/FileManager';
import StixCoreObjectOrStixCoreRelationshipContainers from '../../common/containers/StixCoreObjectOrStixCoreRelationshipContainers';
import ThreatActorIndividualKnowledge from './ThreatActorIndividualKnowledge';
import StixCoreObjectKnowledgeBar from '../../common/stix_core_objects/StixCoreObjectKnowledgeBar';

const subscription = graphql`
  subscription RootThreatActorIndividualSubscription($id: ID!) {
    stixDomainObject(id: $id) {
      ... on ThreatActorIndividual {
        ...ThreatActorIndividual_ThreatActorIndividual
        ...ThreatActorIndividualEditionOverview_ThreatActorIndividual
      }
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
      ...PictureManagementViewer_entity
    }
  }
`;

const ThreatActorIndividualQuery = graphql`
  query RootThreatActorIndividualQuery($id: String!) {
    threatActorIndividual(id: $id) {
      id
      standard_id
      entity_type
      name
      x_opencti_graph_data
      ...ThreatActorIndividual_ThreatActorIndividual
      ...ThreatActorIndividualKnowledge_ThreatActorIndividual
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
      ...PictureManagementViewer_entity
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

const RootThreatActorIndividualComponent = ({
  queryRef,
  threatActorIndividualId,
}) => {
  const subConfig = useMemo<GraphQLSubscriptionConfig<RootThreatActorIndividualSubscription>>(
    () => ({
      subscription,
      variables: { id: threatActorIndividualId },
    }),
    [threatActorIndividualId],
  );
  useSubscription(subConfig);
  const {
    threatActorIndividual: data,
    connectorsForExport,
    connectorsForImport,
  } = usePreloadedQuery<RootThreatActorIndividualQuery>(
    ThreatActorIndividualQuery,
    queryRef,
  );
  const link = `/dashboard/threats/threat_actors_individual/${threatActorIndividualId}/knowledge`;
  return (
    <>
      <Route path="/dashboard/threats/threat_actors_individual/:threatActorIndividualId/knowledge">
        <StixCoreObjectKnowledgeBar
          stixCoreObjectLink={link}
          availableSections={[
            'victimology',
            'threat_actors',
            'intrusion_sets',
            'campaigns',
            'incidents',
            'malwares',
            'attack_patterns',
            'channels',
            'narratives',
            'tools',
            'vulnerabilities',
            'indicators',
            'observables',
            'infrastructures',
            'sightings',
          ]}
        />
      </Route>
      <>
        {data ? (
          <Switch>
            <Route
              exact
              path="/dashboard/threats/threat_actors_individual/:threatActorIndividualId"
              render={(routeProps: any) => (
                <ThreatActorIndividual {...routeProps} data={data} />
              )}
            />
            <Route
              exact
              path="/dashboard/threats/threat_actors_individual/:threatActorIndividualId/knowledge"
              render={() => (
                <Redirect
                  to={`/dashboard/threats/threat_actors_individual/${data.id}/knowledge/overview`}
                />
              )}
            />
            <Route
              path="/dashboard/threats/threat_actors_individual/:threatActorIndividualId/knowledge"
              render={(routeProps: any) => (
                <ThreatActorIndividualKnowledge
                  {...routeProps}
                  threatActorIndividualData={data}
                />
              )}
            />
            <Route
              exact
              path="/dashboard/threats/threat_actors_individual/:threatActorIndividualId/analyses"
              render={(routeProps: any) => (
                <React.Fragment>
                  <StixDomainObjectHeader
                    entityType={'Threat-Actor-Individual'}
                    stixDomainObject={data}
                    PopoverComponent={
                      <ThreatActorIndividualPopover id={data.id} />
                    }
                  />
                  <StixCoreObjectOrStixCoreRelationshipContainers
                    {...routeProps}
                    stixDomainObjectOrStixCoreRelationship={data}
                  />
                </React.Fragment>
              )}
            />
            <Route
              exact
              path="/dashboard/threats/threat_actors_individual/:threatActorIndividualId/files"
              render={(routeProps: any) => (
                <React.Fragment>
                  <StixDomainObjectHeader
                    entityType={'Threat-Actor-Individual'}
                    stixDomainObject={data}
                    PopoverComponent={
                      <ThreatActorIndividualPopover id={data.id} />
                    }
                  />
                  <FileManager
                    {...routeProps}
                    id={threatActorIndividualId}
                    connectorsImport={connectorsForImport}
                    connectorsExport={connectorsForExport}
                    entity={data}
                  />
                </React.Fragment>
              )}
            />
            <Route
              exact
              path="/dashboard/threats/threat_actors_individual/:threatActorIndividualId/history"
              render={(routeProps: any) => (
                <React.Fragment>
                  <StixDomainObjectHeader
                    entityType={'Threat-Actor-Individual'}
                    stixDomainObject={data}
                    PopoverComponent={
                      <ThreatActorIndividualPopover id={data.id} />
                    }
                  />
                  <StixCoreObjectHistory
                    {...routeProps}
                    stixCoreObjectId={threatActorIndividualId}
                  />
                </React.Fragment>
              )}
            />
          </Switch>
        ) : (
          <ErrorNotFound />
        )}
      </>
    </>
  );
};

const Root = () => {
  const { threatActorIndividualId } = useParams() as {
    threatActorIndividualId: string;
  };
  const queryRef = useQueryLoading<RootThreatActorIndividualQuery>(
    ThreatActorIndividualQuery,
    {
      id: threatActorIndividualId,
    },
  );
  return (
    <>
      {queryRef && (
        <React.Suspense fallback={<Loader variant={LoaderVariant.inElement} />}>
          <RootThreatActorIndividualComponent
            queryRef={queryRef}
            threatActorIndividualId={threatActorIndividualId}
          />
        </React.Suspense>
      )}
    </>
  );
};

export default Root;
