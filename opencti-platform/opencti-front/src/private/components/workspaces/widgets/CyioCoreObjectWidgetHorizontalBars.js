import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import {
  BarChart,
  ResponsiveContainer,
  CartesianGrid,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { withStyles, withTheme } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { QueryRenderer } from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import { monthsAgo, now } from '../../../../utils/Time';
import {
  dashboardQueryRisksDistribution,
} from '../../settings/DashboardQuery';

const styles = () => ({
  paper: {
    minHeight: 280,
    height: '100%',
    margin: '4px 0 0 0',
    padding: '1rem',
    borderRadius: 6,
  },
  chip: {
    fontSize: 10,
    height: 20,
    marginLeft: 10,
  },
});

class CyioCoreObjectWidgetHorizontalBars extends Component {
  renderhorizontalBarChartQuery() {
    const { widget, t } = this.props;
    switch (widget.config.queryType) {
      case 'risksDistribution':
        return this.renderRiskChart();
      default:
        return (
          <div style={{ display: 'table', height: '100%', width: '100%' }}>
            <span
              style={{
                display: 'table-cell',
                verticalAlign: 'middle',
                textAlign: 'center',
              }}
            >
              {t('Not implemented yet.')}
            </span>
          </div>
        );
    }
  }

  renderRiskChart() {
    const {
      t,
      widget,
      startDate,
      endDate,
      theme,
    } = this.props;
    const finalStartDate = startDate || monthsAgo(12);
    const finalEndDate = endDate || now();
    const horizontalBarsChartVariables = {
      ...widget.config.variables,
      startDate: finalStartDate,
      endDate: finalEndDate,
    };

    return (
      <>
        <Typography variant="h4" gutterBottom={true}>
          {widget.config.name || t('Component')}
        </Typography>
        <QueryRenderer
          query={dashboardQueryRisksDistribution}
          variables={horizontalBarsChartVariables}
          render={({ props }) => {
            if (props && props[widget.config.queryType]) {
              return (
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart
                    data={props[widget.config.queryType]}
                    margin={{
                      top: 20,
                      right: 20,
                      bottom: 0,
                      left: 0,
                    }}
                    barGap={0}
                  >
                    <CartesianGrid
                      strokeDasharray="2 2"
                      stroke='rgba(241, 241, 242, 0.35)'
                      // stroke={theme.palette.action.grid}
                      vertical={false}
                    />
                    <XAxis
                      dataKey='label'
                      stroke={theme.palette.text.primary}
                    // interval={interval}
                    // angle={-45}
                    // textAnchor="end"
                    // tickFormatter={md}
                    />
                    <YAxis stroke={theme.palette.text.primary} />
                    <Tooltip
                      cursor={{
                        fill: 'rgba(0, 0, 0, 0.2)',
                        stroke: 'rgba(0, 0, 0, 0.2)',
                        strokeWidth: 2,
                      }}
                      contentStyle={{
                        backgroundColor: '#1F2842',
                        fontSize: 12,
                        border: '1px solid #06102D',
                        borderRadius: 10,
                      }}
                    // labelFormatter={md}
                    />
                    <Bar
                      // fill={theme.palette.primary.main}
                      fill="#075AD3"
                      dataKey="value"
                      barSize={20}
                    />
                  </BarChart>
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
      </>
    );
  }

  render() {
    const {
      height,
    } = this.props;
    return (
      <div style={{ height: height || '100%' }}>
        {this.renderhorizontalBarChartQuery()}
      </div>
    );
  }
}

CyioCoreObjectWidgetHorizontalBars.propTypes = {
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
  md: PropTypes.func,
  widget: PropTypes.object,
};

export default compose(
  inject18n,
  withTheme,
  withStyles(styles),
)(CyioCoreObjectWidgetHorizontalBars);
