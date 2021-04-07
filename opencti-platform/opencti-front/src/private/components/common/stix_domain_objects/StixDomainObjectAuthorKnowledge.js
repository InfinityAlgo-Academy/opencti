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
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { QueryRenderer } from '../../../../relay/environment';
import { monthsAgo, now, yearsAgo } from '../../../../utils/Time';
import inject18n from '../../../../components/i18n';
import ItemNumberDifference from '../../../../components/ItemNumberDifference';
import Theme from '../../../../components/ThemeDark';
import Loader from '../../../../components/Loader';

const styles = (theme) => ({
  card: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 6,
    position: 'relative',
  },
  paper: {
    margin: '10px 0 0 0',
    padding: '20px 20px 0 20px',
    borderRadius: 6,
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
});

const stixDomainObjectAuthorKnowledgeReportsNumberQuery = graphql`
  query StixDomainObjectAuthorKnowledgeReportsNumberQuery(
    $authorId: String
    $endDate: DateTime
  ) {
    reportsNumber(authorId: $authorId, endDate: $endDate) {
      total
      count
    }
  }
`;

const stixDomainObjectAuthorKnowledgeStixCoreRelationshipsNumberQuery = graphql`
  query StixDomainObjectAuthorKnowledgeStixCoreRelationshipsNumberQuery(
    $type: String
    $authorId: String
    $toTypes: [String]
    $endDate: DateTime
  ) {
    stixCoreRelationshipsNumber(
      type: $type
      authorId: $authorId
      toTypes: $toTypes
      endDate: $endDate
    ) {
      total
      count
    }
  }
`;

const stixDomainObjectAuthorKnowledgeStixDomainObjectsTimeSeriesQuery = graphql`
  query StixDomainObjectAuthorKnowledgeStixDomainObjectsTimeSeriesQuery(
    $authorId: String
    $field: String!
    $operation: StatsOperation!
    $startDate: DateTime!
    $endDate: DateTime!
    $interval: String!
  ) {
    stixDomainObjectsTimeSeries(
      authorId: $authorId
      field: $field
      operation: $operation
      startDate: $startDate
      endDate: $endDate
      interval: $interval
    ) {
      date
      value
    }
  }
`;

class StixDomainObjectAuthorKnowledge extends Component {
  render() {
    const {
      t, nsd, mtd, n, classes, stixDomainObjectId,
    } = this.props;
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
                query={stixDomainObjectAuthorKnowledgeReportsNumberQuery}
                variables={{
                  authorId: stixDomainObjectId,
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
                  stixDomainObjectAuthorKnowledgeStixCoreRelationshipsNumberQuery
                }
                variables={{
                  authorId: stixDomainObjectId,
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
                  stixDomainObjectAuthorKnowledgeStixCoreRelationshipsNumberQuery
                }
                variables={{
                  authorId: stixDomainObjectId,
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
          <Grid item={true} xs={12}>
            <Typography variant="h4" gutterBottom={true}>
              {t('Created entities')}
            </Typography>
            <Paper
              classes={{ root: classes.paper }}
              elevation={2}
              style={{ height: 300 }}
            >
              <QueryRenderer
                query={
                  stixDomainObjectAuthorKnowledgeStixDomainObjectsTimeSeriesQuery
                }
                variables={{
                  authorId: stixDomainObjectId,
                  field: 'created_at',
                  operation: 'count',
                  startDate: yearsAgo(1),
                  endDate: now(),
                  interval: 'month',
                }}
                render={({ props }) => {
                  if (props && props.stixDomainObjectsTimeSeries) {
                    return (
                      <div className={classes.graphContainer}>
                        <ResponsiveContainer height={270} width="100%">
                          <AreaChart
                            data={props.stixDomainObjectsTimeSeries}
                            margin={{
                              top: 0,
                              right: 0,
                              bottom: 0,
                              left: -10,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="2 2"
                              stroke="#0f181f"
                            />
                            <XAxis
                              dataKey="date"
                              stroke="#ffffff"
                              interval={0}
                              textAnchor="end"
                              tickFormatter={mtd}
                            />
                            <YAxis stroke="#ffffff" />
                            <Tooltip
                              cursor={{
                                fill: 'rgba(0, 0, 0, 0.2)',
                                stroke: 'rgba(0, 0, 0, 0.2)',
                                strokeWidth: 2,
                              }}
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                fontSize: 12,
                                borderRadius: 10,
                              }}
                              labelFormatter={nsd}
                            />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke={Theme.palette.primary.main}
                              strokeWidth={2}
                              fill={Theme.palette.primary.main}
                              fillOpacity={0.1}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  }
                  return <Loader variant="inElement" />;
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

StixDomainObjectAuthorKnowledge.propTypes = {
  stixDomainObjectId: PropTypes.string,
  stixDomainObjectType: PropTypes.string,
  classes: PropTypes.object,
  t: PropTypes.func,
};

export default compose(
  inject18n,
  withStyles(styles),
)(StixDomainObjectAuthorKnowledge);
