import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'ramda';
import { graphql, createFragmentContainer } from 'react-relay';
import withStyles from '@mui/styles/withStyles';
import Grid from '@mui/material/Grid';
import inject18n from '../../../../components/i18n';
import NarrativeDetails from './NarrativeDetails';
import NarrativeEdition from './NarrativeEdition';
import NarrativePopover from './NarrativePopover';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import Security from '../../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../../utils/hooks/useGranted';
import StixCoreObjectOrStixCoreRelationshipNotes from '../../analyses/notes/StixCoreObjectOrStixCoreRelationshipNotes';
import StixDomainObjectOverview from '../../common/stix_domain_objects/StixDomainObjectOverview';
import StixCoreObjectExternalReferences from '../../analyses/external_references/StixCoreObjectExternalReferences';
import StixCoreObjectLatestHistory from '../../common/stix_core_objects/StixCoreObjectLatestHistory';
import SimpleStixObjectOrStixRelationshipStixCoreRelationships from '../../common/stix_core_relationships/SimpleStixObjectOrStixRelationshipStixCoreRelationships';
import StixCoreObjectOrStixRelationshipLastContainers from '../../common/containers/StixCoreObjectOrStixRelationshipLastContainers';

const styles = () => ({
  container: {
    margin: 0,
  },
  gridContainer: {
    marginBottom: 20,
  },
});

class NarrativeComponent extends Component {
  render() {
    const { classes, narrative } = this.props;
    return (
      <div className={classes.container}>
        <StixDomainObjectHeader
          entityType='Narrative'
          stixDomainObject={narrative}
          PopoverComponent={<NarrativePopover />}
        />
        <Grid
          container={true}
          spacing={3}
          classes={{ container: classes.gridContainer }}
        >
          <Grid item={true} xs={6} style={{ paddingTop: 10 }}>
            <NarrativeDetails narrative={narrative} />
          </Grid>
          <Grid item={true} xs={6} style={{ paddingTop: 10 }}>
            <StixDomainObjectOverview stixDomainObject={narrative} displayConfidence={false} />
          </Grid>
          <Grid item={true} xs={6} style={{ marginTop: 30 }}>
            <SimpleStixObjectOrStixRelationshipStixCoreRelationships
              stixObjectOrStixRelationshipId={narrative.id}
              stixObjectOrStixRelationshipLink={`/dashboard/techniques/narratives/${narrative.id}/knowledge`}
            />
          </Grid>
          <Grid item={true} xs={6}>
            <StixCoreObjectOrStixRelationshipLastContainers
              stixCoreObjectOrStixRelationshipId={narrative.id}
            />
          </Grid>
          <Grid item={true} xs={6} style={{ marginTop: 30 }}>
            <StixCoreObjectExternalReferences stixCoreObjectId={narrative.id} />
          </Grid>
          <Grid item={true} xs={6} style={{ marginTop: 30 }}>
            <StixCoreObjectLatestHistory stixCoreObjectId={narrative.id} />
          </Grid>
        </Grid>
        <StixCoreObjectOrStixCoreRelationshipNotes
          stixCoreObjectOrStixCoreRelationshipId={narrative.id}
          defaultMarkings={(narrative.objectMarking?.edges ?? []).map(
            (edge) => edge.node,
          )}
        />
        <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <NarrativeEdition narrativeId={narrative.id} />
        </Security>
      </div>
    );
  }
}

NarrativeComponent.propTypes = {
  narrative: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  enableReferences: PropTypes.bool,
};

const Narrative = createFragmentContainer(NarrativeComponent, {
  narrative: graphql`
    fragment Narrative_narrative on Narrative {
      id
      standard_id
      entity_type
      x_opencti_stix_ids
      spec_version
      revoked
      confidence
      created
      modified
      created_at
      updated_at
      createdBy {
        ... on Identity {
          id
          name
          entity_type
          x_opencti_reliability
        }
      }
      creators {
        id
        name
      }
      objectMarking {
        edges {
          node {
            id
            definition_type
            definition
            x_opencti_order
            x_opencti_color
          }
        }
      }
      objectLabel {
        edges {
          node {
            id
            value
            color
          }
        }
      }
      name
      aliases
      status {
        id
        order
        template {
          name
          color
        }
      }
      workflowEnabled
      ...NarrativeDetails_narrative
    }
  `,
});

export default compose(inject18n, withStyles(styles))(Narrative);
