import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Switch, withRouter } from 'react-router-dom';
import { graphql, createFragmentContainer } from 'react-relay';
import EntityStixCoreRelationships from '../../common/stix_core_relationships/EntityStixCoreRelationships';
import StixDomainObjectKnowledge from '../../common/stix_domain_objects/StixDomainObjectKnowledge';
import StixCoreRelationship from '../../common/stix_core_relationships/StixCoreRelationship';
import EntityStixSightingRelationships from '../../events/stix_sighting_relationships/EntityStixSightingRelationships';
import StixDomainObjectAuthorKnowledge from '../../common/stix_domain_objects/StixDomainObjectAuthorKnowledge';
import StixSightingRelationship from '../../events/stix_sighting_relationships/StixSightingRelationship';

class SystemKnowledgeComponent extends Component {
  render() {
    const { system, viewAs } = this.props;
    const link = `/dashboard/entities/systems/${system.id}/knowledge`;
    return (
      <>
        <Switch>
          <Route
            exact
            path="/dashboard/entities/systems/:systemId/knowledge/relations/:relationId"
            render={(routeProps) => (
              <StixCoreRelationship
                entityId={system.id}
                paddingRight={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/entities/systems/:systemId/knowledge/sightings/:sightingId"
            render={(routeProps) => (
              <StixSightingRelationship
                entityId={system.id}
                paddingRight={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/entities/systems/:systemId/knowledge/overview"
            render={(routeProps) => (viewAs === 'knowledge' ? (
              <StixDomainObjectKnowledge
                stixDomainObjectId={system.id}
                stixDomainObjectType="System"
                {...routeProps}
              />
            ) : (
              <StixDomainObjectAuthorKnowledge
                stixDomainObjectId={system.id}
                stixDomainObjectType="System"
                {...routeProps}
              />
            ))
            }
          />
          <Route
            exact
            path="/dashboard/entities/systems/:systemId/knowledge/threats"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={system.id}
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
            path="/dashboard/entities/systems/:systemId/knowledge/related"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={system.id}
                relationshipTypes={['related-to']}
                entityLink={link}
                allDirections={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/entities/systems/:systemId/knowledge/systems"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={system.id}
                relationshipTypes={['part-of']}
                stixCoreObjectTypes={['System']}
                entityLink={link}
                isRelationReversed={false}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/entities/systems/:systemId/knowledge/locations"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={system.id}
                relationshipTypes={['localization']}
                stixCoreObjectTypes={['City', 'Country', 'Region']}
                entityLink={link}
                isRelationReversed={false}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/entities/systems/:systemId/knowledge/threat_actors"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={system.id}
                stixCoreObjectTypes={['Threat-Actor']}
                entityLink={link}
                isRelationReversed={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/entities/systems/:systemId/knowledge/intrusion_sets"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={system.id}
                stixCoreObjectTypes={['Intrusion-Set']}
                entityLink={link}
                isRelationReversed={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/entities/systems/:systemId/knowledge/campaigns"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={system.id}
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
            path="/dashboard/entities/systems/:systemId/knowledge/incidents"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={system.id}
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
            path="/dashboard/entities/systems/:systemId/knowledge/malwares"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={system.id}
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
            path="/dashboard/entities/systems/:systemId/knowledge/attack_patterns"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={system.id}
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
            path="/dashboard/entities/systems/:systemId/knowledge/tools"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={system.id}
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
            path="/dashboard/entities/systems/:systemId/knowledge/observables"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={system.id}
                relationshipTypes={['related-to']}
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
            path="/dashboard/entities/systems/:systemId/knowledge/sightings"
            render={(routeProps) => (
              <EntityStixSightingRelationships
                entityId={system.id}
                entityLink={link}
                noRightBar={true}
                isTo={true}
                {...routeProps}
              />
            )}
          />
        </Switch>
      </>
    );
  }
}

SystemKnowledgeComponent.propTypes = {
  system: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  viewAs: PropTypes.string,
};

const SystemKnowledge = createFragmentContainer(SystemKnowledgeComponent, {
  system: graphql`
    fragment SystemKnowledge_system on System {
      id
      name
      x_opencti_aliases
    }
  `,
});

export default withRouter(SystemKnowledge);
