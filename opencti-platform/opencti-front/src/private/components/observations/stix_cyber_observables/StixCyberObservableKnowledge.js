import React from 'react';
import { compose } from 'ramda';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core';
import inject18n from '../../../../components/i18n';
import StixCyberObservableHeader from './StixCyberObservableHeader';
import StixCyberObservableKnowledgeEntities from './StixCyberObservableKnowledgeEntities';
import StixCyberObservableEnrichment from './StixCyberObservableEnrichment';

const styles = () => ({
  container: {
    margin: 0,
  },
  gridContainer: {
    marginBottom: 20,
  },
});

const StixCyberObservableKnowledge = (props) => {
  const { stixCyberObservable, classes, t } = props;
  return (
    <div className={classes.container}>
      <StixCyberObservableHeader stixCyberObservable={stixCyberObservable} />
      <Grid
        container={true}
        spacing={3}
        classes={{ container: classes.gridContainer }}
      >
        <Grid item={true} xs={9}>
          <StixCyberObservableKnowledgeEntities
            entityId={stixCyberObservable.id}
          />
        </Grid>
        <Grid item={true} xs={3}>
          <Typography variant="h4" gutterBottom={true}>
            {t('Enrichment connectors')}
          </Typography>
          <StixCyberObservableEnrichment
            stixCyberObservable={stixCyberObservable}
          />
        </Grid>
      </Grid>
    </div>
  );
};

const StixCyberObservableKnowledgeFragment = createFragmentContainer(
  StixCyberObservableKnowledge,
  {
    stixCyberObservable: graphql`
      fragment StixCyberObservableKnowledge_stixCyberObservable on StixCyberObservable {
        id
        entity_type
        ...StixCyberObservableEnrichment_stixCyberObservable
        ...StixCyberObservableHeader_stixCyberObservable
      }
    `,
  },
);

export default compose(
  inject18n,
  withStyles(styles),
)(StixCyberObservableKnowledgeFragment);
