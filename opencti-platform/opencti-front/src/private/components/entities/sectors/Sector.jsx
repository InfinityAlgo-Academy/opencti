import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'ramda';
import { graphql, createFragmentContainer } from 'react-relay';
import withStyles from '@mui/styles/withStyles';
import Grid from '@mui/material/Grid';
import inject18n from '../../../../components/i18n';
import SectorDetails from './SectorDetails';
import SectorEdition from './SectorEdition';
import SectorPopover from './SectorPopover';
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

class SectorComponent extends Component {
  render() {
    const { classes, sector } = this.props;
    return (
      <div className={classes.container}>
        <StixDomainObjectHeader
          entityType={'Sector'}
          disableSharing={true}
          stixDomainObject={sector}
          isOpenctiAlias={true}
          PopoverComponent={<SectorPopover />}
          enableQuickSubscription
        />
        <Grid
          container={true}
          spacing={3}
          classes={{ container: classes.gridContainer }}
        >
          <Grid item={true} xs={6} style={{ paddingTop: 10 }}>
            <SectorDetails sector={sector} />
          </Grid>
          <Grid item={true} xs={6} style={{ paddingTop: 10 }}>
            <StixDomainObjectOverview stixDomainObject={sector} displayConfidence={false} />
          </Grid>
          <Grid item={true} xs={6} style={{ marginTop: 30 }}>
            <SimpleStixObjectOrStixRelationshipStixCoreRelationships
              stixObjectOrStixRelationshipId={sector.id}
              stixObjectOrStixRelationshipLink={`/dashboard/entities/sectors/${sector.id}/knowledge`}
            />
          </Grid>
          <Grid item={true} xs={6} style={{ marginTop: 30 }}>
            <StixCoreObjectOrStixRelationshipLastContainers
              stixCoreObjectOrStixRelationshipId={sector.id}
            />
          </Grid>
          <Grid item={true} xs={6} style={{ marginTop: 30 }}>
            <StixCoreObjectExternalReferences stixCoreObjectId={sector.id} />
          </Grid>
          <Grid item={true} xs={6} style={{ marginTop: 30 }}>
            <StixCoreObjectLatestHistory stixCoreObjectId={sector.id} />
          </Grid>
        </Grid>
        <StixCoreObjectOrStixCoreRelationshipNotes
          stixCoreObjectOrStixCoreRelationshipId={sector.id}
          defaultMarkings={(sector.objectMarking?.edges ?? []).map(
            (edge) => edge.node,
          )}
        />
        <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <SectorEdition sectorId={sector.id} />
        </Security>
      </div>
    );
  }
}

SectorComponent.propTypes = {
  sector: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
};

const Sector = createFragmentContainer(SectorComponent, {
  sector: graphql`
    fragment Sector_sector on Sector {
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
      ...SectorDetails_sector
    }
  `,
});

export default compose(inject18n, withStyles(styles))(Sector);
