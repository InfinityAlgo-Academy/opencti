import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';
import Chip from '@mui/material/Chip';
import { useFormatter } from '../../../../components/i18n';
import EntityStixCoreRelationshipsDonut from '../../common/stix_core_relationships/EntityStixCoreRelationshipsDonut';
import ExpandableMarkdown from '../../../../components/ExpandableMarkdown';
import ItemSeverity from '../../../../components/ItemSeverity';

const useStyles = makeStyles(() => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: '15px',
    borderRadius: 6,
  },
  chip: {
    fontSize: 12,
    height: 25,
    marginRight: 7,
    textTransform: 'uppercase',
    borderRadius: '0',
    width: 120,
  },
  chip2: {
    fontSize: 12,
    height: 25,
    marginRight: 7,
    textTransform: 'uppercase',
    borderRadius: '0',
    width: 150,
  },
}));

const IncidentDetailsComponent = ({ incident }) => {
  const classes = useStyles();
  const { t, fldt } = useFormatter();
  return (
    <div style={{ height: '100%' }}>
      <Typography variant="h4" gutterBottom={true}>
        {t('Details')}
      </Typography>
      <Paper classes={{ root: classes.paper }} variant="outlined">
        <Grid container={true} spacing={3}>
          <Grid item={true} xs={6}>
            <Typography variant="h3" gutterBottom={true}>
              {t('Incident type')}
            </Typography>
            <Chip
              classes={{ root: classes.chip }}
              color="primary"
              variant="outlined"
              label={incident.incident_type || t('Unknown')}
            />
            <Typography
              variant="h3"
              gutterBottom={true}
              style={{ marginTop: 20 }}
            >
              {t('First seen')}
            </Typography>
            {fldt(incident.first_seen)}
            <Typography
              variant="h3"
              gutterBottom={true}
              style={{ marginTop: 20 }}
            >
              {t('Description')}
            </Typography>
            <ExpandableMarkdown source={incident.description} limit={400} />
          </Grid>
          <Grid item={true} xs={6}>
            <Typography variant="h3" gutterBottom={true}>
              {t('Severity')}
            </Typography>
            <ItemSeverity
              severity={incident.severity}
              label={t(incident.severity || 'Unknown')}
            />
            <Typography
              variant="h3"
              gutterBottom={true}
              style={{ marginTop: 20 }}
            >
              {t('Last seen')}
            </Typography>
            {fldt(incident.last_seen)}
            <Typography
              variant="h3"
              gutterBottom={true}
              style={{ marginTop: 20 }}
            >
              {t('Source')}
            </Typography>
            <Chip
              classes={{ root: classes.chip2 }}
              color="secondary"
              variant="outlined"
              label={incident.source || t('Unknown')}
            />
            <Typography
              variant="h3"
              gutterBottom={true}
              style={{ marginTop: 20 }}
            >
              {t('Objective')}
            </Typography>
            <ExpandableMarkdown source={incident.objective} limit={100} />
          </Grid>
          <Grid item={true} xs={6}>
            <EntityStixCoreRelationshipsDonut
              entityId={incident.id}
              toTypes={['Stix-Domain-Object']}
              relationshipType="stix-core-relationship"
              field="entity_type"
              height={260}
              variant="inEntity"
              isTo={false}
              title={t('Entities distribution')}
            />
          </Grid>
          <Grid item={true} xs={6}>
            <EntityStixCoreRelationshipsDonut
              entityId={incident.id}
              toTypes={['Stix-Cyber-Observable']}
              relationshipType="stix-core-relationship"
              field="entity_type"
              height={260}
              variant="inEntity"
              isTo={true}
              title={t('Observables distribution')}
            />
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default createFragmentContainer(IncidentDetailsComponent, {
  incident: graphql`
    fragment IncidentDetails_incident on Incident {
      id
      first_seen
      last_seen
      objective
      description
      incident_type
      severity
      source
      status {
        id
        order
        template {
          name
          color
        }
      }
      workflowEnabled
    }
  `,
});
