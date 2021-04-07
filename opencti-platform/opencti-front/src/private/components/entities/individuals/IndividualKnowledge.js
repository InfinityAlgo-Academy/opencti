import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, withRouter } from 'react-router-dom';
import { compose, propOr } from 'ramda';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import inject18n from '../../../../components/i18n';
import EntityStixCoreRelationships from '../../common/stix_core_relationships/EntityStixCoreRelationships';
import StixDomainObjectKnowledge from '../../common/stix_domain_objects/StixDomainObjectKnowledge';
import StixCoreRelationship from '../../common/stix_core_relationships/StixCoreRelationship';
import IndividualPopover from './IndividualPopover';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import StixCoreObjectKnowledgeBar from '../../common/stix_core_objects/StixCoreObjectKnowledgeBar';
import StixCoreObjectStixCyberObservables from '../../observations/stix_cyber_observables/StixCoreObjectStixCyberObservables';
import EntityStixSightingRelationships from '../../events/stix_sighting_relationships/EntityStixSightingRelationships';
import {
  buildViewParamsFromUrlAndStorage,
  saveViewParameters,
} from '../../../../utils/ListParameters';
import StixDomainObjectAuthorKnowledge from '../../common/stix_domain_objects/StixDomainObjectAuthorKnowledge';

const styles = () => ({
  container: {
    margin: 0,
    padding: 0,
  },
});

const VIEW_AS_KNOWLEDGE = 'knowledge';

class IndividualKnowledgeComponent extends Component {
  constructor(props) {
    super(props);
    const params = buildViewParamsFromUrlAndStorage(
      props.history,
      props.location,
      `view-individual-${props.individual.id}`,
    );
    this.state = {
      viewAs: propOr(VIEW_AS_KNOWLEDGE, 'viewAs', params),
    };
  }

  saveView() {
    saveViewParameters(
      this.props.history,
      this.props.location,
      `view-individual-${this.props.individual.id}`,
      this.state,
    );
  }

  handleChangeViewAs(event) {
    this.setState({ viewAs: event.target.value }, () => this.saveView());
  }

  render() {
    const { classes, individual } = this.props;
    const { viewAs } = this.state;
    const link = `/dashboard/entities/individuals/${individual.id}/knowledge`;
    return (
      <div
        className={classes.container}
        style={{ paddingRight: viewAs === VIEW_AS_KNOWLEDGE ? 200 : 0 }}
      >
        <StixDomainObjectHeader
          stixDomainObject={individual}
          PopoverComponent={<IndividualPopover />}
          onViewAs={this.handleChangeViewAs.bind(this)}
          viewAs={viewAs}
        />
        {viewAs === VIEW_AS_KNOWLEDGE && (
          <StixCoreObjectKnowledgeBar
            stixCoreObjectLink={link}
            availableSections={[
              'individuals',
              'individuals',
              'threat_actors',
              'intrusion_sets',
              'campaigns',
              'incidents',
              'malwares',
              'observables',
              'sightings',
            ]}
          />
        )}
        <Route
          exact
          path="/dashboard/entities/individuals/:individualId/knowledge/relations/:relationId"
          render={(routeProps) => (
            <StixCoreRelationship
              entityId={individual.id}
              paddingRight={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/entities/individuals/:individualId/knowledge/overview"
          render={(routeProps) => (viewAs === VIEW_AS_KNOWLEDGE ? (
              <StixDomainObjectKnowledge
                stixDomainObjectId={individual.id}
                stixDomainObjectType="Individual"
                {...routeProps}
              />
          ) : (
              <StixDomainObjectAuthorKnowledge
                stixDomainObjectId={individual.id}
                stixDomainObjectType="Individual"
                {...routeProps}
              />
          ))
          }
        />
        <Route
          exact
          path="/dashboard/entities/individuals/:individualId/knowledge/individuals"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={individual.id}
              relationshipTypes={['part-of']}
              targetStixDomainObjectTypes={['Individual']}
              entityLink={link}
              isRelationReversed={false}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/entities/individuals/:individualId/knowledge/locations"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={individual.id}
              relationshipTypes={['localization']}
              targetStixDomainObjectTypes={['City', 'Country', 'Region']}
              entityLink={link}
              isRelationReversed={false}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/entities/individuals/:individualId/knowledge/threat_actors"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={individual.id}
              targetStixDomainObjectTypes={['Threat-Actor']}
              entityLink={link}
              isRelationReversed={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/entities/individuals/:individualId/knowledge/intrusion_sets"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={individual.id}
              targetStixDomainObjectTypes={['Intrusion-Set']}
              entityLink={link}
              isRelationReversed={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/entities/individuals/:individualId/knowledge/campaigns"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={individual.id}
              relationshipTypes={['targets']}
              targetStixDomainObjectTypes={['Campaign']}
              entityLink={link}
              isRelationReversed={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/entities/individuals/:individualId/knowledge/incidents"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={individual.id}
              relationshipTypes={['targets']}
              targetStixDomainObjectTypes={['X-OpenCTI-Incident']}
              entityLink={link}
              isRelationReversed={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/entities/individuals/:individualId/knowledge/malwares"
          render={(routeProps) => (
            <EntityStixCoreRelationships
              entityId={individual.id}
              relationshipTypes={['targets']}
              targetStixDomainObjectTypes={['Malware']}
              entityLink={link}
              isRelationReversed={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/entities/individuals/:individualId/knowledge/observables"
          render={(routeProps) => (
            <StixCoreObjectStixCyberObservables
              stixCoreObjectId={individual.id}
              stixCoreObjectLink={link}
              noRightBar={true}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path="/dashboard/entities/individuals/:individualId/knowledge/sightings"
          render={(routeProps) => (
            <EntityStixSightingRelationships
              entityId={individual.id}
              entityLink={link}
              noRightBar={true}
              isTo={true}
              {...routeProps}
            />
          )}
        />
      </div>
    );
  }
}

IndividualKnowledgeComponent.propTypes = {
  individual: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
};

const IndividualKnowledge = createFragmentContainer(
  IndividualKnowledgeComponent,
  {
    individual: graphql`
      fragment IndividualKnowledge_individual on Individual {
        id
        name
        x_opencti_aliases
      }
    `,
  },
);

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(IndividualKnowledge);
