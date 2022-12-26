import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, withRouter } from 'react-router-dom';
import { compose } from 'ramda';
import { graphql, createFragmentContainer } from 'react-relay';
import withStyles from '@mui/styles/withStyles';
import inject18n from '../../../../components/i18n';
import EntityStixCoreRelationships from '../../common/stix_core_relationships/EntityStixCoreRelationships';
import StixCoreRelationship from '../../common/stix_core_relationships/StixCoreRelationship';
import ThreatActorPopover from './ThreatActorPopover';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import StixDomainObjectAttackPatterns from '../../common/stix_domain_objects/StixDomainObjectAttackPatterns';
import StixDomainObjectThreatKnowledge from '../../common/stix_domain_objects/StixDomainObjectThreatKnowledge';
import StixDomainObjectVictimology from '../../common/stix_domain_objects/StixDomainObjectVictimology';
import EntityStixSightingRelationships from '../../events/stix_sighting_relationships/EntityStixSightingRelationships';
import StixSightingRelationship from '../../events/stix_sighting_relationships/StixSightingRelationship';

const styles = () => ({
  container: {
    margin: 0,
    padding: '0 200px 0 0',
  },
});

class ThreatActorKnowledgeComponent extends Component {
  render() {
    const { classes, threatActor, enableReferences } = this.props;
    const link = `/dashboard/threats/threat_actors/${threatActor.id}/knowledge`;
    return (
      <div className={classes.container}>
        <StixDomainObjectHeader
          stixDomainObject={threatActor}
          PopoverComponent={<ThreatActorPopover />}
          enableReferences={enableReferences}
        />
        <Route
          exact
          path="/dashboard/threats/threat_actors/:threatActorId/knowledge/relations/:relationId"
          render={(routeProps) => (
            <StixCoreRelationship
              entityId={threatActor.id}
              paddingRight={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/threat_actors/:threatActorId/knowledge/sightings/:sightingId"
          render={(routeProps) => (
            <StixSightingRelationship
              entityId={threatActor.id}
              paddingRight={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/threat_actors/:threatActorId/knowledge/overview"
          render={(routeProps) => (
            <StixDomainObjectThreatKnowledge
              stixDomainObjectId={threatActor.id}
              stixDomainObjectType="Threat-Actor"
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/threat_actors/:threatActorId/knowledge/related"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={threatActor.id}
              relationshipTypes={['related-to', 'part-of']}
              entityLink={link}
              defaultStartTime={threatActor.first_seen}
              defaultStopTime={threatActor.last_seen}
              allDirections={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/threat_actors/:threatActorId/knowledge/victimology"
          render={(routeProps) => (
            <StixDomainObjectVictimology
              stixDomainObjectId={threatActor.id}
              entityLink={link}
              defaultStartTime={threatActor.first_seen}
              defaultStopTime={threatActor.last_seen}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/threat_actors/:threatActorId/knowledge/threat_actors"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={threatActor.id}
              relationshipTypes={['part-of', 'cooperates-with']}
              stixCoreObjectTypes={['Threat-Actor']}
              entityLink={link}
              defaultStartTime={threatActor.first_seen}
              defaultStopTime={threatActor.last_seen}
              allDirections={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/threat_actors/:threatActorId/knowledge/intrusion_sets"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={threatActor.id}
              relationshipTypes={['attributed-to']}
              stixCoreObjectTypes={['Intrusion-Set']}
              entityLink={link}
              defaultStartTime={threatActor.first_seen}
              defaultStopTime={threatActor.last_seen}
              isRelationReversed={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/threat_actors/:threatActorId/knowledge/campaigns"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={threatActor.id}
              relationshipTypes={['attributed-to', 'participates-in']}
              stixCoreObjectTypes={['Campaign']}
              entityLink={link}
              defaultStartTime={threatActor.first_seen}
              defaultStopTime={threatActor.last_seen}
              allDirections={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/threat_actors/:threatActorId/knowledge/attack_patterns"
          render={(routeProps) => (
            <StixDomainObjectAttackPatterns
              stixDomainObjectId={threatActor.id}
              entityLink={link}
              defaultStartTime={threatActor.first_seen}
              defaultStopTime={threatActor.last_seen}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/threat_actors/:threatActorId/knowledge/malwares"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={threatActor.id}
              relationshipTypes={['uses']}
              stixCoreObjectTypes={['Malware']}
              entityLink={link}
              defaultStartTime={threatActor.first_seen}
              defaultStopTime={threatActor.last_seen}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/threat_actors/:threatActorId/knowledge/tools"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={threatActor.id}
              relationshipTypes={['uses']}
              stixCoreObjectTypes={['Tool']}
              entityLink={link}
              defaultStartTime={threatActor.first_seen}
              defaultStopTime={threatActor.last_seen}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/threat_actors/:threatActorId/knowledge/vulnerabilities"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={threatActor.id}
              relationshipTypes={['targets']}
              stixCoreObjectTypes={['Vulnerability']}
              entityLink={link}
              defaultStartTime={threatActor.first_seen}
              defaultStopTime={threatActor.last_seen}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/threat_actors/:threatActorId/knowledge/incidents"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={threatActor.id}
              relationshipTypes={['attributed-to']}
              stixCoreObjectTypes={['Incident']}
              entityLink={link}
              isRelationReversed={true}
              defaultStartTime={threatActor.first_seen}
              defaultStopTime={threatActor.last_seen}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/threat_actors/:threatActorId/knowledge/observables"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={threatActor.id}
              relationshipTypes={['related-to']}
              stixCoreObjectTypes={['Stix-Cyber-Observable']}
              entityLink={link}
              defaultStartTime={threatActor.first_seen}
              defaultStopTime={threatActor.last_seen}
              allDirections={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/threat_actors/:threatActorId/knowledge/infrastructures"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={threatActor.id}
              relationshipTypes={['uses', 'compromises']}
              stixCoreObjectTypes={['Infrastructure']}
              entityLink={link}
              isRelationReversed={false}
              defaultStartTime={threatActor.first_seen}
              defaultStopTime={threatActor.last_seen}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/threat_actors/:threatActorId/knowledge/sightings"
          render={(routeProps) => (
            <EntityStixSightingRelationships
              entityId={threatActor.id}
              entityLink={link}
              noRightBar={true}
              defaultStartTime={threatActor.first_seen}
              defaultStopTime={threatActor.last_seen}
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
      </div>
    );
  }
}

ThreatActorKnowledgeComponent.propTypes = {
  threatActor: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  enableReferences: PropTypes.bool,
};

const ThreatActorKnowledge = createFragmentContainer(
  ThreatActorKnowledgeComponent,
  {
    threatActor: graphql`
      fragment ThreatActorKnowledge_threatActor on ThreatActor {
        id
        name
        aliases
        first_seen
        last_seen
      }
    `,
  },
);

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(ThreatActorKnowledge);
