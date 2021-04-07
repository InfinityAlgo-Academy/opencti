import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import inject18n from '../../../../components/i18n';
import ContainerHeader from '../../common/containers/ContainerHeader';
import ObservedDataDetails from './ObservedDataDetails';
import ObservedDataEdition from './ObservedDataEdition';
import StixDomainObjectOverview from '../../common/stix_domain_objects/StixDomainObjectOverview';
import StixCoreObjectExternalReferences from '../../analysis/external_references/StixCoreObjectExternalReferences';
import Security, { KNOWLEDGE_KNUPDATE } from '../../../../utils/Security';
import StixCoreObjectOrStixCoreRelationshipNotes from '../../analysis/notes/StixCoreObjectOrStixCoreRelationshipNotes';
import StixCoreObjectLatestHistory from '../../common/stix_core_objects/StixCoreObjectLatestHistory';
import ObservedDataPopover from './ObservedDataPopover';

const styles = () => ({
  container: {
    margin: 0,
  },
  gridContainer: {
    marginBottom: 20,
  },
});

class ObservedDataComponent extends Component {
  render() {
    const { classes, observedData } = this.props;
    return (
      <div className={classes.container}>
        <ContainerHeader
          container={observedData}
          PopoverComponent={<ObservedDataPopover />}
        />
        <Grid
          container={true}
          spacing={3}
          classes={{ container: classes.gridContainer }}
        >
          <Grid item={true} xs={6}>
            <StixDomainObjectOverview stixDomainObject={observedData} />
          </Grid>
          <Grid item={true} xs={6}>
            <ObservedDataDetails observedData={observedData} />
          </Grid>
        </Grid>
        <Grid
          container={true}
          spacing={3}
          classes={{ container: classes.gridContainer }}
          style={{ marginTop: 25 }}
        >
          <Grid item={true} xs={6}>
            <StixCoreObjectExternalReferences
              stixCoreObjectId={observedData.id}
            />
          </Grid>
          <Grid item={true} xs={6}>
            <StixCoreObjectLatestHistory stixCoreObjectId={observedData.id} />
          </Grid>
        </Grid>
        <StixCoreObjectOrStixCoreRelationshipNotes
          stixCoreObjectOrStixCoreRelationshipId={observedData.id}
        />
        <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <ObservedDataEdition observedDataId={observedData.id} />
        </Security>
      </div>
    );
  }
}

ObservedDataComponent.propTypes = {
  observedData: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
};

const ObservedData = createFragmentContainer(ObservedDataComponent, {
  observedData: graphql`
    fragment ObservedData_observedData on ObservedData {
      id
      standard_id
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
        }
      }
      creator {
        id
        name
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
      ...ObservedDataDetails_observedData
      ...ContainerHeader_container
    }
  `,
});

export default compose(inject18n, withStyles(styles))(ObservedData);
