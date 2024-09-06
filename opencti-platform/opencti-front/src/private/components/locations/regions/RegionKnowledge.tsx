// TODO Remove this when V6
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { graphql, useFragment } from 'react-relay';
import EntityStixCoreRelationships from '../../common/stix_core_relationships/EntityStixCoreRelationships';
import StixDomainObjectKnowledge from '../../common/stix_domain_objects/StixDomainObjectKnowledge';
import StixCoreRelationship from '../../common/stix_core_relationships/StixCoreRelationship';
import StixSightingRelationship from '../../events/stix_sighting_relationships/StixSightingRelationship';
import { RegionKnowledge_region$key } from './__generated__/RegionKnowledge_region.graphql';

const regionKnowledgeFragment = graphql`
  fragment RegionKnowledge_region on Region {
    id
    name
    x_opencti_aliases
  }
`;

const RegionKnowledgeComponent = ({
  regionData,
}: {
  regionData: RegionKnowledge_region$key;
}) => {
  const region = useFragment<RegionKnowledge_region$key>(
    regionKnowledgeFragment,
    regionData,
  );
  const link = `/dashboard/locations/regions/${region.id}/knowledge`;
  return (
    <>
      <Routes>
        <Route
          path="/relations/:relationId"
          element={
            <StixCoreRelationship
              entityId={region.id}
              paddingRight={true}
            />
          }
        />
        <Route
          path="/sightings/:sightingId"
          element={
            <StixSightingRelationship
              entityId={region.id}
              paddingRight={true}
            />
          }
        />
        <Route
          path="/overview"
          element={
            <StixDomainObjectKnowledge
              stixDomainObjectId={region.id}
              stixDomainObjectType="Region"
            />
          }
        />
        <Route
          path="/threats"
          element={
            <EntityStixCoreRelationships
              entityId={region.id}
              relationshipTypes={['targets']}
              isRelationReversed
              entityLink={link}
              stixCoreObjectTypes={[
                'Attack-Pattern',
                'Threat-Actor',
                'Intrusion-Set',
                'Campaign',
                'Incident',
                'Malware',
                'Tool',
              ]}
            />
          }
        />
        <Route
          path="/related"
          element={
            <EntityStixCoreRelationships
              entityId={region.id}
              relationshipTypes={['related-to', 'derived-from']}
              stixCoreObjectTypes={[
                'Threat-Actor',
                'Intrusion-Set',
                'Campaign',
                'Incident',
                'Malware',
                'Tool',
                'Vulnerability',
                'Individual',
                'Organization',
                'Sector',
                'Region',
                'Country',
                'City',
                'Position',
              ]}
              entityLink={link}
              allDirections={true}
            />
          }
        />
        <Route
          path="/regions"
          element={
            <EntityStixCoreRelationships
              entityId={region.id}
              relationshipTypes={['located-at']}
              stixCoreObjectTypes={['Region']}
              entityLink={link}
              allDirections={true}
            />
          }
        />
        <Route
          path="/countries"
          element={
            <EntityStixCoreRelationships
              entityId={region.id}
              relationshipTypes={['located-at']}
              stixCoreObjectTypes={['Country']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/areas"
          element={
            <EntityStixCoreRelationships
              entityId={region.id}
              relationshipTypes={['located-at']}
              stixCoreObjectTypes={['Administrative-Area']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/cities"
          element={
            <EntityStixCoreRelationships
              entityId={region.id}
              relationshipTypes={['located-at']}
              stixCoreObjectTypes={['City']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/organizations"
          element={
            <EntityStixCoreRelationships
              entityId={region.id}
              relationshipTypes={['located-at']}
              stixCoreObjectTypes={['Organization']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/threat_actors"
          element={
            <EntityStixCoreRelationships
              entityId={region.id}
              relationshipTypes={['targets']}
              stixCoreObjectTypes={['Threat-Actor']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/intrusion_sets"
          element={
            <EntityStixCoreRelationships
              entityId={region.id}
              relationshipTypes={['targets']}
              stixCoreObjectTypes={['Intrusion-Set']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/campaigns"
          element={
            <EntityStixCoreRelationships
              entityId={region.id}
              relationshipTypes={['targets']}
              stixCoreObjectTypes={['Campaign']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/incidents"
          element={
            <EntityStixCoreRelationships
              entityId={region.id}
              relationshipTypes={['targets']}
              stixCoreObjectTypes={['Incident']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/malwares"
          element={
            <EntityStixCoreRelationships
              entityId={region.id}
              relationshipTypes={['targets']}
              stixCoreObjectTypes={['Malware']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/attack_patterns"
          element={
            <EntityStixCoreRelationships
              entityId={region.id}
              relationshipTypes={['targets']}
              stixCoreObjectTypes={['Attack-Pattern']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/tools"
          element={
            <EntityStixCoreRelationships
              entityId={region.id}
              relationshipTypes={['targets']}
              stixCoreObjectTypes={['Tool']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/observables"
          element={
            <EntityStixCoreRelationships
              entityId={region.id}
              relationshipTypes={['related-to', 'located-at']}
              stixCoreObjectTypes={['Stix-Cyber-Observable']}
              entityLink={link}
              allDirections={true}
              isRelationReversed={true}
            />
          }
        />
      </Routes>
    </>
  );
};

export default RegionKnowledgeComponent;
