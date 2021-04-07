import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Markdown from 'react-markdown';
import Grid from '@material-ui/core/Grid';
import inject18n from '../../../../components/i18n';
import ItemReliability from '../../../../components/ItemReliability';
import ExpandableMarkdown from '../../../../components/ExpandableMarkdown';

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
        <Paper classes={{ root: classes.paper }} elevation={2}>
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
              <ItemReliability
                reliability={organization.x_opencti_reliability}
                label={t(`reliability_${organization.x_opencti_reliability}`)}
              />
              <Typography
                variant="h3"
                gutterBottom={true}
                style={{ marginTop: 20 }}
              >
                {t('Contact information')}
              </Typography>
              <Markdown
                className="markdown"
                source={organization.contact_information}
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
      }
    `,
  },
);

export default compose(inject18n, withStyles(styles))(OrganizationDetails);
