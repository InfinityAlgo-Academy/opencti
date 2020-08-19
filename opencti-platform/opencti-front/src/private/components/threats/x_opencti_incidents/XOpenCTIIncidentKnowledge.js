import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, withRouter } from 'react-router-dom';
import { compose } from 'ramda';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import inject18n from '../../../../components/i18n';
import EntityStixCoreRelationships from '../../common/stix_core_relationships/EntityStixCoreRelationships';
import StixDomainObjectThreatKnowledge from '../../common/stix_domain_objects/StixDomainObjectThreatKnowledge';
import StixCoreRelationship from '../../common/stix_core_relationships/StixCoreRelationship';
import XOpenCTIIncidentPopover from './XOpenCTIIncidentPopover';
import XOpenCTIIncidentKnowledgeBar from './XOpenCTIIncidentKnowledgeBar';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import StixDomainObjectKillChain from '../../common/stix_domain_objects/StixDomainObjectKillChain';
import StixDomainObjectVictimology from '../../common/stix_domain_objects/StixDomainObjectVictimology';

const styles = () => ({
  container: {
    margin: 0,
    padding: '0 260px 0 0',
  },
});

class XOpenCTIIncidentKnowledgeComponent extends Component {
  render() {
    const { classes, xOpenCTIIncident } = this.props;
    const link = `/dashboard/threats/incidents/${xOpenCTIIncident.id}/knowledge`;
    return (
      <div className={classes.container}>
        <StixDomainObjectHeader
          stixDomainObject={xOpenCTIIncident}
          PopoverComponent={<XOpenCTIIncidentPopover />}
        />
        <XOpenCTIIncidentKnowledgeBar
          xOpenCTIIncidentId={xOpenCTIIncident.id}
        />
        <Route
          exact
          path="/dashboard/threats/incidents/:XOpenCTIIncidentId/knowledge/relations/:relationId"
          render={(routeProps) => (
            <StixCoreRelationship
              entityId={xOpenCTIIncident.id}
              paddingRight={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/incidents/:XOpenCTIIncidentId/knowledge/overview"
          render={(routeProps) => (
            <StixDomainObjectThreatKnowledge
              stixDomainObjectId={xOpenCTIIncident.id}
              stixDomainObjectType="X-OpenCTI-Incident"
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/incidents/:XOpenCTIIncidentId/knowledge/attribution"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={xOpenCTIIncident.id}
              relationshipType="attributed-to"
              targetStixDomainObjectTypes={[
                'Threat-Actor',
                'Intrusion-Set',
                'Campaign',
              ]}
              entityLink={link}
              isRelationReversed={false}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/incidents/:XOpenCTIIncidentId/knowledge/malwares"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={xOpenCTIIncident.id}
              relationshipType="uses"
              targetStixDomainObjectTypes={['Malware']}
              entityLink={link}
              isRelationReversed={false}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/incidents/:XOpenCTIIncidentId/knowledge/victimology"
          render={(routeProps) => (
            <StixDomainObjectVictimology
              stixDomainObjectId={xOpenCTIIncident.id}
              entityLink={link}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/incidents/:XOpenCTIIncidentId/knowledge/ttp"
          render={(routeProps) => (
            <StixDomainObjectKillChain
              stixDomainObjectId={xOpenCTIIncident.id}
              entityLink={link}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/incidents/:XOpenCTIIncidentId/knowledge/tools"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={xOpenCTIIncident.id}
              relationshipType="uses"
              targetStixDomainObjectTypes={['Tool']}
              entityLink={link}
              isRelationReversed={false}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/threats/incidents/:XOpenCTIIncidentId/knowledge/vulnerabilities"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={xOpenCTIIncident.id}
              relationshipType="targets"
              targetStixDomainObjectTypes={['Vulnerability']}
              entityLink={link}
              isRelationReversed={false}
              {...routeProps}
            />
          )}
        />
      </div>
    );
  }
}

XOpenCTIIncidentKnowledgeComponent.propTypes = {
  xOpenCTIIncident: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
};

const XOpenCTIXOpenCTIIncidentKnowledge = createFragmentContainer(
  XOpenCTIIncidentKnowledgeComponent,
  {
    xOpenCTIIncident: graphql`
      fragment XOpenCTIIncidentKnowledge_xOpenCTIIncident on XOpenCTIIncident {
        id
        name
        aliases
      }
    `,
  },
);

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(XOpenCTIXOpenCTIIncidentKnowledge);
