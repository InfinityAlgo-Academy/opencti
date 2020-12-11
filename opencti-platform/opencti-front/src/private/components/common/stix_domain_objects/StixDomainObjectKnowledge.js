import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import CircularProgress from '@material-ui/core/CircularProgress';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import { DescriptionOutlined, DeviceHubOutlined } from '@material-ui/icons';
import { HexagonMultipleOutline } from 'mdi-material-ui';
import { QueryRenderer } from '../../../../relay/environment';
import { monthsAgo } from '../../../../utils/Time';
import inject18n from '../../../../components/i18n';
import ItemNumberDifference from '../../../../components/ItemNumberDifference';
import { resolveLink } from '../../../../utils/Entity';
import StixCoreObjectReportsBars from '../../analysis/reports/StixCoreObjectReportsBars';
import StixCoreObjectStixCoreRelationshipsCloud from '../stix_core_relationships/StixCoreObjectStixCoreRelationshipsCloud';
import StixCoreObjectStixDomainObjectsBars from '../stix_core_objects/StixCoreObjectStixDomainObjectsBars';
import SectorTargetedOrganizations from '../../entities/sectors/SectorTargetedOrganizations';

const styles = (theme) => ({
  card: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 6,
    position: 'relative',
  },
  itemIcon: {
    color: theme.palette.primary.main,
  },
  itemIconSecondary: {
    marginRight: 0,
    color: theme.palette.secondary.main,
  },
  number: {
    marginTop: 10,
    float: 'left',
    fontSize: 30,
  },
  title: {
    marginTop: 5,
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: 500,
    color: '#a8a8a8',
  },
  icon: {
    position: 'absolute',
    color: theme.palette.primary.main,
    top: 35,
    right: 20,
  },
  bottomNav: {
    zIndex: 1000,
    padding: '10px 200px 10px 205px',
    backgroundColor: theme.palette.navBottom.background,
    display: 'flex',
  },
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 70px 0',
    padding: '15px 15px 15px 15px',
    borderRadius: 6,
  },
});

const stixDomainObjectKnowledgeReportsNumberQuery = graphql`
  query StixDomainObjectKnowledgeReportsNumberQuery(
    $objectId: String
    $endDate: DateTime
  ) {
    reportsNumber(objectId: $objectId, endDate: $endDate) {
      total
      count
    }
  }
`;

const stixDomainObjectKnowledgeStixCoreRelationshipsNumberQuery = graphql`
  query StixDomainObjectKnowledgeStixCoreRelationshipsNumberQuery(
    $type: String
    $fromId: String
    $toTypes: [String]
    $endDate: DateTime
  ) {
    stixCoreRelationshipsNumber(
      type: $type
      fromId: $fromId
      toTypes: $toTypes
      endDate: $endDate
    ) {
      total
      count
    }
  }
`;

class StixDomainObjectKnowledge extends Component {
  render() {
    const {
      t,
      n,
      classes,
      stixDomainObjectId,
      stixDomainObjectType,
    } = this.props;
    const link = `${resolveLink(
      stixDomainObjectType,
    )}/${stixDomainObjectId}/knowledge`;
    return (
      <div>
        <Grid container={true} spacing={3}>
          <Grid item={true} xs={4}>
            <Card
              raised={true}
              classes={{ root: classes.card }}
              style={{ height: 120 }}
            >
              <QueryRenderer
                query={stixDomainObjectKnowledgeReportsNumberQuery}
                variables={{
                  objectId: stixDomainObjectId,
                  endDate: monthsAgo(1),
                }}
                render={({ props }) => {
                  if (props && props.reportsNumber) {
                    const { total } = props.reportsNumber;
                    const difference = total - props.reportsNumber.count;
                    return (
                      <CardContent>
                        <div className={classes.title}>
                          {t('Total reports')}
                        </div>
                        <div className={classes.number}>{n(total)}</div>
                        <ItemNumberDifference difference={difference} />
                        <div className={classes.icon}>
                          <DescriptionOutlined
                            color="inherit"
                            fontSize="large"
                          />
                        </div>
                      </CardContent>
                    );
                  }
                  return (
                    <div style={{ textAlign: 'center', paddingTop: 35 }}>
                      <CircularProgress size={40} thickness={2} />
                    </div>
                  );
                }}
              />
            </Card>
          </Grid>
          <Grid item={true} xs={4}>
            <Card
              raised={true}
              classes={{ root: classes.card }}
              style={{ height: 120 }}
            >
              <QueryRenderer
                query={
                  stixDomainObjectKnowledgeStixCoreRelationshipsNumberQuery
                }
                variables={{
                  fromId: stixDomainObjectId,
                  toTypes: ['Stix-Cyber-Observable'],
                  endDate: monthsAgo(1),
                }}
                render={({ props }) => {
                  if (props && props.stixCoreRelationshipsNumber) {
                    const { total } = props.stixCoreRelationshipsNumber;
                    const difference = total - props.stixCoreRelationshipsNumber.count;
                    return (
                      <CardContent>
                        <div className={classes.title}>
                          {t('Total observables')}
                        </div>
                        <div className={classes.number}>{n(total)}</div>
                        <ItemNumberDifference difference={difference} />
                        <div className={classes.icon}>
                          <HexagonMultipleOutline
                            color="inherit"
                            fontSize="large"
                          />
                        </div>
                      </CardContent>
                    );
                  }
                  return (
                    <div style={{ textAlign: 'center', paddingTop: 35 }}>
                      <CircularProgress size={40} thickness={2} />
                    </div>
                  );
                }}
              />
            </Card>
          </Grid>
          <Grid item={true} xs={4}>
            <Card
              raised={true}
              classes={{ root: classes.card }}
              style={{ height: 120 }}
            >
              <QueryRenderer
                query={
                  stixDomainObjectKnowledgeStixCoreRelationshipsNumberQuery
                }
                variables={{
                  fromId: stixDomainObjectId,
                  endDate: monthsAgo(1),
                }}
                render={({ props }) => {
                  if (props && props.stixCoreRelationshipsNumber) {
                    const { total } = props.stixCoreRelationshipsNumber;
                    const difference = total - props.stixCoreRelationshipsNumber.count;
                    return (
                      <CardContent>
                        <div className={classes.title}>
                          {t('Total relations')}
                        </div>
                        <div className={classes.number}>{n(total)}</div>
                        <ItemNumberDifference difference={difference} />
                        <div className={classes.icon}>
                          <DeviceHubOutlined color="inherit" fontSize="large" />
                        </div>
                      </CardContent>
                    );
                  }
                  return (
                    <div style={{ textAlign: 'center', paddingTop: 35 }}>
                      <CircularProgress size={40} thickness={2} />
                    </div>
                  );
                }}
              />
            </Card>
          </Grid>
        </Grid>
        <Grid container={true} spacing={3} style={{ marginBottom: 20 }}>
          <Grid item={true} xs={6}>
            <StixCoreObjectReportsBars
              stixCoreObjectId={stixDomainObjectId}
              field="created-by.internal_id"
              title={t('Distribution of sources')}
            />
          </Grid>
          <Grid item={true} xs={6}>
            <StixCoreObjectStixCoreRelationshipsCloud
              stixCoreObjectId={stixDomainObjectId}
              stixCoreObjectType="Stix-Domain-Object"
              relationshipType="stix-core-relationship"
              title={t('Distribution of relations')}
              field="entity_type"
              noDirection={true}
            />
          </Grid>
        </Grid>
        <Grid container={true} spacing={3}>
          <Grid item={true} xs={6}>
            <StixCoreObjectStixDomainObjectsBars
              stixCoreObjectId={stixDomainObjectId}
              relationshipType="targets"
              toTypes={['Threat-Actor', 'Intrusion-Set', 'Campaign', 'Malware']}
              title={t('Top 10 threats targeting this entity')}
              field="internal_id"
              isTo={true}
            />
          </Grid>
          {stixDomainObjectType === 'Sector' ? (
            <Grid item={true} xs={6} style={{ marginBottom: 25 }}>
              <SectorTargetedOrganizations
                sectorId={stixDomainObjectId}
                link={link}
              />
            </Grid>
          ) : (
            ''
          )}
        </Grid>
      </div>
    );
  }
}

StixDomainObjectKnowledge.propTypes = {
  stixDomainObjectId: PropTypes.string,
  stixDomainObjectType: PropTypes.string,
  classes: PropTypes.object,
  t: PropTypes.func,
};

export default compose(
  inject18n,
  withStyles(styles),
)(StixDomainObjectKnowledge);
