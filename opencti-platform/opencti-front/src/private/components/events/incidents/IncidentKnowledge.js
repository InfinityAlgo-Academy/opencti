import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, withRouter } from 'react-router-dom';
import { compose } from 'ramda';
import { graphql, createFragmentContainer } from 'react-relay';
import withStyles from '@mui/styles/withStyles';
import inject18n from '../../../../components/i18n';
import EntityStixCoreRelationships from '../../common/stix_core_relationships/EntityStixCoreRelationships';
import StixDomainObjectThreatKnowledge from '../../common/stix_domain_objects/StixDomainObjectThreatKnowledge';
import StixCoreRelationship from '../../common/stix_core_relationships/StixCoreRelationship';
import IncidentPopover from './IncidentPopover';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import StixDomainObjectAttackPatterns from '../../common/stix_domain_objects/StixDomainObjectAttackPatterns';
import StixDomainObjectVictimology from '../../common/stix_domain_objects/StixDomainObjectVictimology';
import StixSightingRelationship from '../stix_sighting_relationships/StixSightingRelationship';

const styles = () => ({
  container: {
    margin: 0,
    padding: '0 200px 0 0',
  },
});

class IncidentKnowledgeComponent extends Component {
  render() {
    const { classes, incident } = this.props;
    const link = `/dashboard/events/incidents/${incident.id}/knowledge`;
    return (
      <div className={classes.container}>
        <StixDomainObjectHeader
          stixDomainObject={incident}
          PopoverComponent={<IncidentPopover />}
        />
        <Route
          exact
          path="/dashboard/events/incidents/:incidentId/knowledge/relations/:relationId"
          render={(routeProps) => (
            <StixCoreRelationship
              entityId={incident.id}
              paddingRight={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/events/incidents/:incidentId/knowledge/sightings/:sightingId"
          render={(routeProps) => (
            <StixSightingRelationship
              entityId={incident.id}
              paddingRight={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/events/incidents/:incidentId/knowledge/overview"
          render={(routeProps) => (
            <StixDomainObjectThreatKnowledge
              stixDomainObjectId={incident.id}
              stixDomainObjectType="Incident"
              displayObservablesStats={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/events/incidents/:incidentId/knowledge/related"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={incident.id}
              relationshipTypes={['related-to']}
              entityLink={link}
              defaultStartTime={incident.first_seen}
              defaultStopTime={incident.last_seen}
              allDirections={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/events/incidents/:incidentId/knowledge/attribution"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={incident.id}
              relationshipTypes={['attributed-to']}
              stixCoreObjectTypes={[
                'Threat-Actor',
                'Intrusion-Set',
                'Campaign',
              ]}
              entityLink={link}
              defaultStartTime={incident.first_seen}
              defaultStopTime={incident.last_seen}
              isRelationReversed={false}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/events/incidents/:incidentId/knowledge/victimology"
          render={(routeProps) => (
            <StixDomainObjectVictimology
              stixDomainObjectId={incident.id}
              entityLink={link}
              defaultStartTime={incident.first_seen}
              defaultStopTime={incident.last_seen}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/events/incidents/:incidentId/knowledge/attack_patterns"
          render={(routeProps) => (
            <StixDomainObjectAttackPatterns
              stixDomainObjectId={incident.id}
              entityLink={link}
              defaultStartTime={incident.first_seen}
              defaultStopTime={incident.last_seen}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/events/incidents/:incidentId/knowledge/malwares"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={incident.id}
              relationshipTypes={['uses']}
              stixCoreObjectTypes={['Malware']}
              entityLink={link}
              defaultStartTime={incident.first_seen}
              defaultStopTime={incident.last_seen}
              isRelationReversed={false}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/events/incidents/:incidentId/knowledge/tools"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={incident.id}
              relationshipTypes={['uses']}
              stixCoreObjectTypes={['Tool']}
              entityLink={link}
              defaultStartTime={incident.first_seen}
              defaultStopTime={incident.last_seen}
              isRelationReversed={false}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/events/incidents/:incidentId/knowledge/vulnerabilities"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={incident.id}
              relationshipTypes={['targets']}
              stixCoreObjectTypes={['Vulnerability']}
              entityLink={link}
              defaultStartTime={incident.first_seen}
              defaultStopTime={incident.last_seen}
              isRelationReversed={false}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/events/incidents/:incidentId/knowledge/observables"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={incident.id}
              relationshipTypes={['related-to']}
              stixCoreObjectTypes={['Stix-Cyber-Observable']}
              entityLink={link}
              defaultStartTime={incident.first_seen}
              defaultStopTime={incident.last_seen}
              allDirections={true}
              {...routeProps}
            />
          )}
        />
      </div>
    );
  }
}

IncidentKnowledgeComponent.propTypes = {
  incident: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
};

const IncidentKnowledge = createFragmentContainer(IncidentKnowledgeComponent, {
  incident: graphql`
    fragment IncidentKnowledge_incident on Incident {
      id
      name
      aliases
      first_seen
      last_seen
    }
  `,
});

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(IncidentKnowledge);
