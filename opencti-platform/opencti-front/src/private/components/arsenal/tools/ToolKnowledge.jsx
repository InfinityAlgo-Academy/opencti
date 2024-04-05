import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Routes } from 'react-router-dom';
import * as R from 'ramda';
import { graphql, createFragmentContainer } from 'react-relay';
import inject18n from '../../../../components/i18n';
import EntityStixCoreRelationships from '../../common/stix_core_relationships/EntityStixCoreRelationships';
import StixCoreRelationship from '../../common/stix_core_relationships/StixCoreRelationship';
import EntityStixSightingRelationships from '../../events/stix_sighting_relationships/EntityStixSightingRelationships';
import StixDomainObjectThreatKnowledge from '../../common/stix_domain_objects/StixDomainObjectThreatKnowledge';
import StixSightingRelationship from '../../events/stix_sighting_relationships/StixSightingRelationship';
import EntityStixCoreRelationshipsIndicators from '../../common/stix_core_relationships/views/indicators/EntityStixCoreRelationshipsIndicators';
import EntityStixCoreRelationshipsStixCyberObservable from '../../common/stix_core_relationships/views/stix_cyber_observable/EntityStixCoreRelationshipsStixCyberObservable';
import withRouter from '../../../../utils/compat-router/withRouter';

class ToolKnowledgeComponent extends Component {
  render() {
    const { tool } = this.props;
    const link = `/dashboard/arsenal/tools/${tool.id}/knowledge`;
    return (
      <>
        <Routes>
          <Route
            exact
            path="/dashboard/arsenal/tools/:toolId/knowledge/relations/:relationId"
            render={(routeProps) => (
              <StixCoreRelationship
                entityId={tool.id}
                paddingRight={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/arsenal/tools/:toolId/knowledge/sightings/:sightingId"
            render={(routeProps) => (
              <StixSightingRelationship
                entityId={tool.id}
                paddingRight={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/arsenal/tools/:toolId/knowledge/overview"
            render={(routeProps) => (
              <StixDomainObjectThreatKnowledge
                stixDomainObjectId={tool.id}
                stixDomainObjectType="Tool"
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/arsenal/tools/:toolId/knowledge/related"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={tool.id}
                relationshipTypes={['related-to']}
                entityLink={link}
                allDirections={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/arsenal/tools/:toolId/knowledge/threat_actors"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={tool.id}
                relationshipTypes={['uses']}
                stixCoreObjectTypes={['Threat-Actor']}
                entityLink={link}
                isRelationReversed={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/arsenal/tools/:toolId/knowledge/intrusion_sets"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={tool.id}
                relationshipTypes={['uses']}
                stixCoreObjectTypes={['Intrusion-Set']}
                entityLink={link}
                isRelationReversed={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/arsenal/tools/:toolId/knowledge/campaigns"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={tool.id}
                relationshipTypes={['uses']}
                stixCoreObjectTypes={['Campaign']}
                entityLink={link}
                isRelationReversed={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/arsenal/tools/:toolId/knowledge/attack_patterns"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={tool.id}
                relationshipTypes={['uses']}
                stixCoreObjectTypes={['Attack-Pattern']}
                entityLink={link}
                isRelationReversed={false}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/arsenal/tools/:toolId/knowledge/malwares"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={tool.id}
                relationshipTypes={['delivers', 'drops']}
                stixCoreObjectTypes={['Malware']}
                entityLink={link}
                isRelationReversed={false}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/arsenal/tools/:toolId/knowledge/vulnerabilities"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={tool.id}
                relationshipTypes={['uses', 'has', 'targets']}
                stixCoreObjectTypes={['Vulnerability']}
                entityLink={link}
                isRelationReversed={false}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/arsenal/tools/:toolId/knowledge/incidents"
            render={(routeProps) => (
              <EntityStixCoreRelationships
                entityId={tool.id}
                relationshipTypes={['uses']}
                stixCoreObjectTypes={['Incident']}
                entityLink={link}
                isRelationReversed={true}
                {...routeProps}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/arsenal/tools/:toolId/knowledge/indicators"
            render={(routeProps) => (
              <EntityStixCoreRelationshipsIndicators
                {...routeProps}
                entityId={tool.id}
                entityLink={link}
                defaultStartTime={tool.first_seen}
                defaultStopTime={tool.last_seen}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/arsenal/tools/:toolId/knowledge/observables"
            render={(routeProps) => (
              <EntityStixCoreRelationshipsStixCyberObservable
                {...routeProps}
                entityId={tool.id}
                entityLink={link}
                defaultStartTime={tool.first_seen}
                defaultStopTime={tool.last_seen}
                isRelationReversed={true}
                relationshipTypes={['related-to']}
              />
            )}
          />
          <Route
            exact
            path="/dashboard/arsenal/tools/:toolId/knowledge/sightings"
            render={(routeProps) => (
              <EntityStixSightingRelationships
                entityId={tool.id}
                entityLink={link}
                noRightBar={true}
                stixCoreObjectTypes={[
                  'Region',
                  'Country',
                  'City',
                  'Position',
                  'Sector',
                  'Organization',
                  'Individual',
                  'System',
                ]}
                {...routeProps}
              />
            )}
          />
        </Routes>
      </>
    );
  }
}

ToolKnowledgeComponent.propTypes = {
  tool: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
};

const ToolKnowledge = createFragmentContainer(ToolKnowledgeComponent, {
  tool: graphql`
    fragment ToolKnowledge_tool on Tool {
      id
      name
      aliases
    }
  `,
});

export default R.compose(inject18n, withRouter)(ToolKnowledge);
