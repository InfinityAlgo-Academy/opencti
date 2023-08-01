import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import { createFragmentContainer, graphql } from 'react-relay';
import withStyles from '@mui/styles/withStyles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import inject18n from '../../../../components/i18n';
import ItemOpenVocab from '../../../../components/ItemOpenVocab';
import ExpandableMarkdown from '../../../../components/ExpandableMarkdown';
import MarkdownDisplay from '../../../../components/MarkdownDisplay';

const styles = () => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: '15px',
    borderRadius: 6,
  },
  item: {
    paddingLeft: 10,
    transition: 'background-color 0.1s ease',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.1)',
    },
  },
  chip: {
    fontSize: 12,
    height: 25,
    marginRight: 7,
    textTransform: 'uppercase',
    borderRadius: '0',
    width: 150,
    backgroundColor: 'rgba(229,152,137, 0.08)',
    color: '#e59889',
  },
});

class OrganizationDetailsComponent extends Component {
  render() {
    const { t, classes, organization } = this.props;
    return (
      <div style={{ height: '100%' }}>
        <Typography variant="h4" gutterBottom={true}>
          {t('Details')}
        </Typography>
        <Paper classes={{ root: classes.paper }} variant="outlined">
          <Grid container={true} spacing={3}>
            <Grid item={true} xs={6}>
              <Typography variant="h3" gutterBottom={true}>
                {t('Organization type')}
              </Typography>
              <Chip
                classes={{ root: classes.chip }}
                label={t(
                  organization.x_opencti_organization_type
                    ? `organization_${organization.x_opencti_organization_type}`
                    : 'organization_other',
                )}
              />
              <Typography
                variant="h3"
                gutterBottom={true}
                style={{ marginTop: 20 }}
              >
                {t('Description')}
              </Typography>
              <ExpandableMarkdown
                source={organization.description}
                limit={400}
              />
            </Grid>
            <Grid item={true} xs={6}>
              <Typography variant="h3" gutterBottom={true}>
                {t('Reliability')}
              </Typography>
              <ItemOpenVocab
                displayMode="chip"
                type="reliability_ov"
                value={organization.x_opencti_reliability}
              />
              <Typography
                variant="h3"
                gutterBottom={true}
                style={{ marginTop: 20 }}
              >
                {t('Contact information')}
              </Typography>
              <MarkdownDisplay
                content={organization.contact_information}
                remarkGfmPlugin={true}
                commonmark={true}
              />
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}

OrganizationDetailsComponent.propTypes = {
  organization: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  fld: PropTypes.func,
};

const OrganizationDetails = createFragmentContainer(
  OrganizationDetailsComponent,
  {
    organization: graphql`
      fragment OrganizationDetails_organization on Organization {
        id
        description
        contact_information
        x_opencti_reliability
        x_opencti_organization_type
        objectLabel {
          edges {
            node {
              id
              value
              color
            }
          }
        }
      }
    `,
  },
);

export default compose(inject18n, withStyles(styles))(OrganizationDetails);
