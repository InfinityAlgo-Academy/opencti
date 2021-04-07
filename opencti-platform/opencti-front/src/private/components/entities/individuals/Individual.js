import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, propOr } from 'ramda';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import inject18n from '../../../../components/i18n';
import IndividualDetails from './IndividualDetails';
import IndividualEdition from './IndividualEdition';
import IndividualPopover from './IndividualPopover';
import StixCoreObjectOrStixCoreRelationshipLastReports from '../../analysis/reports/StixCoreObjectOrStixCoreRelationshipLastReports';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import Security, { KNOWLEDGE_KNUPDATE } from '../../../../utils/Security';
import StixCoreObjectOrStixCoreRelationshipNotes from '../../analysis/notes/StixCoreObjectOrStixCoreRelationshipNotes';
import StixDomainObjectOverview from '../../common/stix_domain_objects/StixDomainObjectOverview';
import StixCoreObjectExternalReferences from '../../analysis/external_references/StixCoreObjectExternalReferences';
import StixCoreObjectLatestHistory from '../../common/stix_core_objects/StixCoreObjectLatestHistory';
import SimpleStixObjectOrStixRelationshipStixCoreRelationships from '../../common/stix_core_relationships/SimpleStixObjectOrStixRelationshipStixCoreRelationships';
import {
  buildViewParamsFromUrlAndStorage,
  saveViewParameters,
} from '../../../../utils/ListParameters';

const styles = () => ({
  container: {
    margin: 0,
  },
  gridContainer: {
    marginBottom: 20,
  },
});

const VIEW_AS_KNOWLEDGE = 'knowledge';

class IndividualComponent extends Component {
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
    const lastReportsProps = viewAs === VIEW_AS_KNOWLEDGE
      ? { stixCoreObjectOrStixCoreRelationshipId: individual.id }
      : { authorId: individual.id };
    return (
      <div className={classes.container}>
        <StixDomainObjectHeader
          stixDomainObject={individual}
          isOpenctiAlias={true}
          PopoverComponent={<IndividualPopover />}
          onViewAs={this.handleChangeViewAs.bind(this)}
          viewAs={viewAs}
        />
        <Grid
          container={true}
          spacing={3}
          classes={{ container: classes.gridContainer }}
        >
          <Grid item={true} xs={6}>
            <StixDomainObjectOverview stixDomainObject={individual} />
          </Grid>
          <Grid item={true} xs={6}>
            <IndividualDetails individual={individual} />
          </Grid>
        </Grid>
        <Grid
          container={true}
          spacing={3}
          classes={{ container: classes.gridContainer }}
          style={{ marginTop: 25 }}
        >
          {viewAs === VIEW_AS_KNOWLEDGE && (
            <Grid item={true} xs={6}>
              <SimpleStixObjectOrStixRelationshipStixCoreRelationships
                stixObjectOrStixRelationshipId={individual.id}
                stixObjectOrStixRelationshipLink={`/dashboard/entities/individuals/${individual.id}/knowledge`}
              />
            </Grid>
          )}
          <Grid item={true} xs={viewAs === VIEW_AS_KNOWLEDGE ? 6 : 12}>
            <StixCoreObjectOrStixCoreRelationshipLastReports
              {...lastReportsProps}
            />
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
              stixCoreObjectId={individual.id}
            />
          </Grid>
          <Grid item={true} xs={6}>
            <StixCoreObjectLatestHistory stixCoreObjectId={individual.id} />
          </Grid>
        </Grid>
        <StixCoreObjectOrStixCoreRelationshipNotes
          stixCoreObjectOrStixCoreRelationshipId={individual.id}
        />
        <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <IndividualEdition individualId={individual.id} />
        </Security>
      </div>
    );
  }
}

IndividualComponent.propTypes = {
  individual: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
};

const Individual = createFragmentContainer(IndividualComponent, {
  individual: graphql`
    fragment Individual_individual on Individual {
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
      objectMarking {
        edges {
          node {
            id
            definition
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
      ...IndividualDetails_individual
    }
  `,
});

export default compose(inject18n, withStyles(styles))(Individual);
