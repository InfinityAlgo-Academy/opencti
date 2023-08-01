import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'ramda';
import { graphql, createFragmentContainer } from 'react-relay';
import withStyles from '@mui/styles/withStyles';
import Grid from '@mui/material/Grid';
import inject18n from '../../../../components/i18n';
import IndividualDetails from './IndividualDetails';
import IndividualEdition from './IndividualEdition';
import IndividualPopover from './IndividualPopover';
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

class IndividualComponent extends Component {
  render() {
    const { classes, individual, viewAs, onViewAs } = this.props;
    const lastReportsProps = viewAs === 'knowledge'
      ? { stixCoreObjectOrStixRelationshipId: individual.id }
      : { authorId: individual.id };
    return (
      <div className={classes.container}>
        <StixDomainObjectHeader
          entityType={'Individual'}
          disableSharing={true}
          stixDomainObject={individual}
          isOpenctiAlias={true}
          PopoverComponent={<IndividualPopover />}
          onViewAs={onViewAs.bind(this)}
          viewAs={viewAs}
          disablePopover={individual.isUser}
        />
        <Grid
          container={true}
          spacing={3}
          classes={{ container: classes.gridContainer }}
        >
          <Grid item={true} xs={6} style={{ paddingTop: 10 }}>
            <IndividualDetails individual={individual} />
          </Grid>
          <Grid item={true} xs={6} style={{ paddingTop: 10 }}>
            <StixDomainObjectOverview
              stixDomainObject={individual}
              displayConfidence={false}
              displayReliability={false}
            />
          </Grid>
          {viewAs === 'knowledge' && (
            <Grid item={true} xs={6} style={{ marginTop: 30 }}>
              <SimpleStixObjectOrStixRelationshipStixCoreRelationships
                stixObjectOrStixRelationshipId={individual.id}
                stixObjectOrStixRelationshipLink={`/dashboard/entities/individuals/${individual.id}/knowledge`}
              />
            </Grid>
          )}
          <Grid
            item={true}
            xs={viewAs === 'knowledge' ? 6 : 12}
            style={{ marginTop: 30 }}
          >
            <StixCoreObjectOrStixRelationshipLastContainers
              {...lastReportsProps}
            />
          </Grid>
          <Grid item={true} xs={6} style={{ marginTop: 30 }}>
            <StixCoreObjectExternalReferences
              stixCoreObjectId={individual.id}
            />
          </Grid>
          <Grid item={true} xs={6} style={{ marginTop: 30 }}>
            <StixCoreObjectLatestHistory stixCoreObjectId={individual.id} />
          </Grid>
        </Grid>
        <StixCoreObjectOrStixCoreRelationshipNotes
          stixCoreObjectOrStixCoreRelationshipId={individual.id}
          defaultMarkings={(individual.objectMarking?.edges ?? []).map(
            (edge) => edge.node,
          )}
        />
        {!individual.isUser && (
          <Security needs={[KNOWLEDGE_KNUPDATE]}>
            <IndividualEdition individualId={individual.id} />
          </Security>
        )}
      </div>
    );
  }
}

IndividualComponent.propTypes = {
  individual: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  viewAs: PropTypes.string,
  onViewAs: PropTypes.func,
};

const Individual = createFragmentContainer(IndividualComponent, {
  individual: graphql`
    fragment Individual_individual on Individual {
      id
      standard_id
      entity_type
      x_opencti_stix_ids
      spec_version
      revoked
      x_opencti_reliability
      confidence
      created
      modified
      created_at
      updated_at
      isUser
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
      x_opencti_aliases
      status {
        id
        order
        template {
          name
          color
        }
      }
      workflowEnabled
      ...IndividualDetails_individual
    }
  `,
});

export default compose(inject18n, withStyles(styles))(Individual);
