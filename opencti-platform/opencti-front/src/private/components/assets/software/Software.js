import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'ramda';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import inject18n from '../../../../components/i18n';
import SoftwareDetails from './SoftwareDetails';
import SoftwareEdition from './SoftwareEdition';
import SoftwarePopover from './SoftwarePopover';
import SoftwareDeletion from './SoftwareDeletion';
import StixCoreObjectOrStixCoreRelationshipLastReports from '../../analysis/reports/StixCoreObjectOrStixCoreRelationshipLastReports';
import StixDomainObjectAssetHeader from '../../common/stix_domain_objects/StixDomainObjectAssetHeader';
import Security, { KNOWLEDGE_KNUPDATE } from '../../../../utils/Security';
import StixCoreObjectOrStixCoreRelationshipNotes from '../../analysis/notes/StixCoreObjectOrStixCoreRelationshipNotes';
import StixDomainObjectAssetOverview from '../../common/stix_domain_objects/StixDomainObjectAssetOverview';
import StixCoreObjectExternalReferences from '../../analysis/external_references/StixCoreObjectExternalReferences';
import StixCoreObjectLatestHistory from '../../common/stix_core_objects/StixCoreObjectLatestHistory';
import SimpleStixObjectOrStixRelationshipStixCoreRelationships from '../../common/stix_core_relationships/SimpleStixObjectOrStixRelationshipStixCoreRelationships';

const styles = () => ({
  container: {
    margin: 0,
  },
  gridContainer: {
    marginBottom: 20,
  },
});

class SoftwareComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayEdit: false,
    };
  }

  handleDisplayEdit() {
    this.setState({ displayEdit: !this.state.displayEdit });
  }

  handleOpenNewCreation() {
    this.props.history.push({
      pathname: '/dashboard/assets/software',
      openNewCreation: true,
    });
  }

  render() {
    const {
      classes,
      software,
      history,
      location,
    } = this.props;
    return (
      <>
        {!this.state.displayEdit && !location.openEdit ? (
          <div className={classes.container}>
            <StixDomainObjectAssetHeader
              stixDomainObject={software}
              history={history}
              PopoverComponent={<SoftwarePopover />}
              handleDisplayEdit={this.handleDisplayEdit.bind(this)}
              handleOpenNewCreation={this.handleOpenNewCreation.bind(this)}
              OperationsComponent={<SoftwareDeletion />}
            />
            <Grid
              container={true}
              spacing={3}
              classes={{ container: classes.gridContainer }}
            >
              <Grid item={true} xs={6}>
                <StixDomainObjectAssetOverview stixDomainObject={software} />
              </Grid>
              <Grid item={true} xs={6}>
                <SoftwareDetails software={software} />
              </Grid>
            </Grid>
            <Grid
              container={true}
              spacing={3}
              classes={{ container: classes.gridContainer }}
              style={{ marginTop: 25 }}
            >
              <Grid item={true} xs={6}>
                {/* <StixCoreObjectExternalReferences stixCoreObjectId={software.id} /> */}
              </Grid>
              <Grid item={true} xs={6}>
                <StixCoreObjectLatestHistory stixCoreObjectId={software.id} />
              </Grid>
            </Grid>
            <StixCoreObjectOrStixCoreRelationshipNotes
              stixCoreObjectOrStixCoreRelationshipId={software.id}
            />
            {/* <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <SoftwareEdition softwareId={software.id} />
        </Security> */}
          </div>
        ) : (
          // <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <SoftwareEdition
            open={this.state.openEdit}
            softwareId={software.id}
            history={history}
          />
          // </Security>
        )}
      </>
    );
  }
}

SoftwareComponent.propTypes = {
  software: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
};

const Software = createFragmentContainer(SoftwareComponent, {
  software: graphql`
    fragment Software_software on Campaign {
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
      aliases
    }
  `,
});

export default compose(inject18n, withStyles(styles))(Software);
