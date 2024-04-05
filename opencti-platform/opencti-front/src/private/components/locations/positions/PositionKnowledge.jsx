import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Routes } from 'react-router-dom';
import { compose } from 'ramda';
import { graphql, createFragmentContainer } from 'react-relay';
import withRouter from '../../../../utils/compat-router/withRouter';
import inject18n from '../../../../components/i18n';
import EntityStixCoreRelationships from '../../common/stix_core_relationships/EntityStixCoreRelationships';
import StixDomainObjectKnowledge from '../../common/stix_domain_objects/StixDomainObjectKnowledge';
import StixCoreRelationship from '../../common/stix_core_relationships/StixCoreRelationship';
import StixSightingRelationship from '../../events/stix_sighting_relationships/StixSightingRelationship';
import EntityStixSightingRelationships from '../../events/stix_sighting_relationships/EntityStixSightingRelationships';

class PositionKnowledgeComponent extends Component {
  render() {
    const { position } = this.props;
    const link = `/dashboard/locations/positions/${position.id}/knowledge`;
    return (
      <>
        <Routes>
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/relations/:relationId"
            render={(routeProps) => (
              <StixCoreRelationship
                entityId={position.id}
                paddingRight={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/sightings/:sightingId"
            render={(routeProps) => (
              <StixSightingRelationship
                entityId={position.id}
                paddingRight={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/overview"
            render={(routeProps) => (
              <StixDomainObjectKnowledge
                stixDomainObjectId={position.id}
                stixDomainObjectType="Position"
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/threats"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={position.id}
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
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/related"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={position.id}
                relationshipTypes={['related-to']}
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
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/regions"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={position.id}
                relationshipTypes={['located-at']}
                stixCoreObjectTypes={['Region']}
                entityLink={link}
                isRelationReversed={false}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/countries"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={position.id}
                relationshipTypes={['located-at']}
                stixCoreObjectTypes={['Country']}
                entityLink={link}
                isRelationReversed={false}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/areas"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={position.id}
                relationshipTypes={['located-at']}
                stixCoreObjectTypes={['Administrative-Area']}
                entityLink={link}
                isRelationReversed={false}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/cities"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={position.id}
                relationshipTypes={['located-at']}
                stixCoreObjectTypes={['City']}
                entityLink={link}
                isRelationReversed={false}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/organizations"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={position.id}
                relationshipTypes={['located-at']}
                stixCoreObjectTypes={['Organization']}
                entityLink={link}
                isRelationReversed={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/threat_actors"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={position.id}
                relationshipTypes={['targets']}
                stixCoreObjectTypes={['Threat-Actor']}
                entityLink={link}
                isRelationReversed={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/intrusion_sets"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={position.id}
                relationshipTypes={['targets']}
                stixCoreObjectTypes={['Intrusion-Set']}
                entityLink={link}
                isRelationReversed={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/campaigns"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={position.id}
                relationshipTypes={['targets']}
                stixCoreObjectTypes={['Campaign']}
                entityLink={link}
                isRelationReversed={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/incidents"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={position.id}
                relationshipTypes={['targets']}
                stixCoreObjectTypes={['Incident']}
                entityLink={link}
                isRelationReversed={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/malwares"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={position.id}
                relationshipTypes={['targets']}
                stixCoreObjectTypes={['Malware']}
                entityLink={link}
                isRelationReversed={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/attack_patterns"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={position.id}
                relationshipTypes={['targets']}
                stixCoreObjectTypes={['Attack-Pattern']}
                entityLink={link}
                isRelationReversed={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/tools"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={position.id}
                relationshipTypes={['targets']}
                stixCoreObjectTypes={['Tool']}
                entityLink={link}
                isRelationReversed={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/observables"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={position.id}
                relationshipTypes={['related-to', 'located-at']}
                stixCoreObjectTypes={['Stix-Cyber-Observable']}
                entityLink={link}
                allDirections={true}
                isRelationReversed={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/locations/positions/:positionId/knowledge/sightings"
            render={(routeProps) => (
              <EntityStixSightingRelationships
                entityId={position.id}
                entityLink={link}
                noRightBar={true}
                isTo={true}
                {...routeProps}
              />
            )}
          />
        </Routes>
      </>
    );
  }
}

PositionKnowledgeComponent.propTypes = {
  position: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
};

const PositionKnowledge = createFragmentContainer(PositionKnowledgeComponent, {
  position: graphql`
    fragment PositionKnowledge_position on Position {
      id
      name
      x_opencti_aliases
    }
  `,
});

export default compose(
  inject18n,
  withRouter,
)(PositionKnowledge);
