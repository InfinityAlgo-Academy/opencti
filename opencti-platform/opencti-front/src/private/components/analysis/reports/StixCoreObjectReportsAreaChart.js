import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import {
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  XAxis,
  YAxis,
  Area,
  Tooltip,
} from 'recharts';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { QueryRenderer } from '../../../../relay/environment';
import Theme from '../../../../components/ThemeDark';
import inject18n from '../../../../components/i18n';
import { monthsAgo, now } from '../../../../utils/Time';

const styles = () => ({
  paper: {
    minHeight: 280,
    height: '100%',
    margin: '4px 0 0 0',
    padding: '0 0 10px 0',
    borderRadius: 6,
  },
  chip: {
    fontSize: 10,
    height: 20,
    marginLeft: 10,
  },
});

const stixCoreObjectReportsAreaChartTimeSeriesQuery = graphql`
  query StixCoreObjectReportsAreaChartTimeSeriesQuery(
    $objectId: String
    $authorId: String
    $reportClass: String
    $field: String!
    $operation: StatsOperation!
    $startDate: DateTime!
    $endDate: DateTime!
    $interval: String!
  ) {
    reportsTimeSeries(
      objectId: $objectId
      authorId: $authorId
      reportType: $reportClass
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

class StixCoreObjectReportsAreaChart extends Component {
  renderContent() {
    const {
      t,
      md,
      reportType,
      startDate,
      endDate,
      stixCoreObjectId,
      authorId,
    } = this.props;
    const interval = 'day';
    const finalStartDate = startDate || monthsAgo(12);
    const finalEndDate = endDate || now();
    let reportsTimeSeriesVariables;
    if (authorId) {
      reportsTimeSeriesVariables = {
        authorId,
        objectId: null,
        reportType: reportType || null,
        field: 'created_at',
        operation: 'count',
        startDate: finalStartDate,
        endDate: finalEndDate,
        interval,
      };
    } else {
      reportsTimeSeriesVariables = {
        authorId: null,
        objectId: stixCoreObjectId,
        reportType: reportType || null,
        field: 'created_at',
        operation: 'count',
        startDate: finalStartDate,
        endDate: finalEndDate,
        interval,
      };
    }
    return (
      <QueryRenderer
        query={stixCoreObjectReportsAreaChartTimeSeriesQuery}
        variables={reportsTimeSeriesVariables}
        render={({ props }) => {
          if (props && props.reportsTimeSeries) {
            return (
              <ResponsiveContainer height="100%" width="100%">
                <AreaChart
                  data={props.reportsTimeSeries}
                  margin={{
                    top: 20,
                    right: 0,
                    bottom: 20,
                    left: -10,
                  }}
                >
                  <CartesianGrid strokeDasharray="2 2" stroke="#0f181f" />
                  <XAxis
                    dataKey="date"
                    stroke="#ffffff"
                    interval={interval}
                    textAnchor="end"
                    angle={-30}
                    tickFormatter={md}
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
                    labelFormatter={md}
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
            );
          }
          if (props) {
            return (
              <div style={{ display: 'table', height: '100%', width: '100%' }}>
                <span
                  style={{
                    display: 'table-cell',
                    verticalAlign: 'middle',
                    textAlign: 'center',
                  }}
                >
                  {t('No entities of this type has been found.')}
                </span>
              </div>
            );
          }
          return (
            <div style={{ display: 'table', height: '100%', width: '100%' }}>
              <span
                style={{
                  display: 'table-cell',
                  verticalAlign: 'middle',
                  textAlign: 'center',
                }}
              >
                <CircularProgress size={40} thickness={2} />
              </span>
            </div>
          );
        }}
      />
    );
  }

  render() {
    const {
      t, classes, title, variant, height,
    } = this.props;
    return (
      <div style={{ height: height || '100%' }}>
        <Typography variant="h4" gutterBottom={true}>
          {title || t('Reports history')}
        </Typography>
        {variant !== 'inLine' ? (
          <Paper classes={{ root: classes.paper }} elevation={2}>
            {this.renderContent()}
          </Paper>
        ) : (
          this.renderContent()
        )}
      </div>
    );
  }
}

StixCoreObjectReportsAreaChart.propTypes = {
  classes: PropTypes.object,
  stixCoreObjectId: PropTypes.string,
  authorId: PropTypes.string,
  t: PropTypes.func,
  md: PropTypes.func,
};

export default compose(
  inject18n,
  withStyles(styles),
)(StixCoreObjectReportsAreaChart);
