// TODO Remove this when V6
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useMemo } from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';
import { graphql, usePreloadedQuery, useSubscription } from 'react-relay';
import { GraphQLSubscriptionConfig } from 'relay-runtime';
import City from './City';
import CityKnowledge from './CityKnowledge';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import FileManager from '../../common/files/FileManager';
import CityPopover from './CityPopover';
import StixCoreObjectHistory from '../../common/stix_core_objects/StixCoreObjectHistory';
import StixCoreObjectOrStixCoreRelationshipContainers from '../../common/containers/StixCoreObjectOrStixCoreRelationshipContainers';
import StixCoreObjectKnowledgeBar from '../../common/stix_core_objects/StixCoreObjectKnowledgeBar';
import ErrorNotFound from '../../../../components/ErrorNotFound';
import EntityStixSightingRelationships from '../../events/stix_sighting_relationships/EntityStixSightingRelationships';
import { RootCityQuery } from './__generated__/RootCityQuery.graphql';
import { RootCitiesSubscription } from './__generated__/RootCitiesSubscription.graphql';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import Loader, { LoaderVariant } from '../../../../components/Loader';

const subscription = graphql`
  subscription RootCitiesSubscription($id: ID!) {
    stixDomainObject(id: $id) {
      ... on City {
        ...City_city
        ...CityEditionOverview_city
      }
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
    }
  }
`;

const cityQuery = graphql`
  query RootCityQuery($id: String!) {
    city(id: $id) {
      id
      name
      x_opencti_aliases
      x_opencti_graph_data
      ...City_city
      ...CityKnowledge_city
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
    }
    connectorsForImport {
      ...FileManager_connectorsImport
    }
    connectorsForExport {
      ...FileManager_connectorsExport
    }
  }
`;

const RootCityComponent = ({ queryRef, cityId, link }) => {
  const subConfig = useMemo<GraphQLSubscriptionConfig<RootCitiesSubscription>>(
    () => ({
      subscription,
      variables: { id: cityId },
    }),
    [cityId],
  );
  useSubscription(subConfig);
  const data = usePreloadedQuery(cityQuery, queryRef);
  const { city, connectorsForImport, connectorsForExport } = data;
  return (
    <>
      {city ? (
        <Switch>
          <Route
            exact
            path="/dashboard/locations/cities/:cityId"
            render={() => <City cityData={city} />}
          />
          <Route
            exact
            path="/dashboard/locations/cities/:cityId/knowledge"
            render={() => (
              <Redirect
                to={`/dashboard/locations/cities/${cityId}/knowledge/overview`}
              />
            )}
          />
          <Route
            path="/dashboard/locations/cities/:cityId/knowledge"
            render={() => <CityKnowledge cityData={city} />}
          />
          <Route
            exact
            path="/dashboard/locations/cities/:cityId/analyses"
            render={(routeProps) => (
              <React.Fragment>
                <StixDomainObjectHeader
                  entityType={'City'}
                  disableSharing={true}
                  stixDomainObject={city}
                  PopoverComponent={CityPopover}
                />
                <StixCoreObjectOrStixCoreRelationshipContainers
                  {...routeProps}
                  stixDomainObjectOrStixCoreRelationship={city}
                />
              </React.Fragment>
            )}
          />
          <Route
            exact
            path="/dashboard/locations/cities/:cityId/sightings"
            render={(routeProps) => (
              <React.Fragment>
                <StixDomainObjectHeader
                  entityType={'City'}
                  disableSharing={true}
                  stixDomainObject={city}
                  PopoverComponent={CityPopover}
                />
                <EntityStixSightingRelationships
                  entityId={city.id}
                  entityLink={link}
                  noPadding={true}
                  isTo={true}
                  {...routeProps}
                />
              </React.Fragment>
            )}
          />
          <Route
            exact
            path="/dashboard/locations/cities/:cityId/files"
            render={(routeProps) => (
              <React.Fragment>
                <StixDomainObjectHeader
                  entityType={'City'}
                  disableSharing={true}
                  stixDomainObject={city}
                  PopoverComponent={CityPopover}
                />
                <FileManager
                  {...routeProps}
                  id={cityId}
                  connectorsImport={connectorsForImport}
                  connectorsExport={connectorsForExport}
                  entity={city}
                />
              </React.Fragment>
            )}
          />
          <Route
            exact
            path="/dashboard/locations/cities/:cityId/history"
            render={(routeProps) => (
              <React.Fragment>
                <StixDomainObjectHeader
                  entityType={'City'}
                  disableSharing={true}
                  stixDomainObject={city}
                  PopoverComponent={CityPopover}
                />
                <StixCoreObjectHistory
                  {...routeProps}
                  stixCoreObjectId={cityId}
                />
              </React.Fragment>
            )}
          />
        </Switch>
      ) : (
        <ErrorNotFound />
      )}
    </>
  );
};

const RootCity = () => {
  const { cityId } = useParams() as { cityId: string };
  const queryRef = useQueryLoading<RootCityQuery>(cityQuery, { id: cityId });
  const link = `/dashboard/locations/cities/${cityId}/knowledge`;
  return (
    <>
            <Route path="/dashboard/locations/cities/:cityId/knowledge">
        <StixCoreObjectKnowledgeBar
          stixCoreObjectLink={link}
          availableSections={[
            'organizations',
            'regions',
            'countries',
            'areas',
            'threats',
            'threat_actors',
            'intrusion_sets',
            'campaigns',
            'incidents',
            'malwares',
            'attack_patterns',
            'tools',
            'observables',
          ]}
        />
      </Route>
      {queryRef && (
        <React.Suspense fallback={<Loader variant={LoaderVariant.container} />}>
          <RootCityComponent queryRef={queryRef} cityId={cityId} link={link} />
        </React.Suspense>
      )}
    </>
  );
};

export default RootCity;
