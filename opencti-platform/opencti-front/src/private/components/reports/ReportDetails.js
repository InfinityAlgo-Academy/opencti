import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose, pathOr } from 'ramda';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import inject18n from '../../../components/i18n';
import ItemStatus from '../../../components/ItemStatus';
import ItemCreator from '../../../components/ItemCreator';
import ItemConfidenceLevel from '../../../components/ItemConfidenceLevel';

const styles = () => ({
  paper: {
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: '15px',
    borderRadius: 6,
  },
});

class ReportDetailsComponent extends Component {
  render() {
    const {
      t, fld, classes, report,
    } = this.props;
    return (
      <div style={{ height: '100%' }}>
        <Typography variant="h4" gutterBottom={true}>
          {t('Details')}
        </Typography>
        <Paper classes={{ root: classes.paper }} elevation={2}>
          <Typography variant="h3" gutterBottom={true}>
            {t('Author')}
          </Typography>
          <ItemCreator
            createdByRef={pathOr(null, ['createdByRef', 'node'], report)}
          />
          <Typography
            variant="h3"
            gutterBottom={true}
            style={{ marginTop: 20 }}
          >
            {t('Publication date')}
          </Typography>
          {fld(report.published)}
          <Typography
            variant="h3"
            gutterBottom={true}
            style={{ marginTop: 20 }}
          >
            {t('Processing status')}
          </Typography>
          <ItemStatus
            label={t(
              `${
                report.object_status
                  ? `report_status_${report.object_status}`
                  : 'report_status_0'
              }`,
            )}
            status={report.object_status}
          />
          <Typography
            variant="h3"
            gutterBottom={true}
            style={{ marginTop: 20 }}
          >
            {t('Confidence level')}
          </Typography>
          <ItemConfidenceLevel level={report.source_confidence_level} />
        </Paper>
      </div>
    );
  }
}

ReportDetailsComponent.propTypes = {
  report: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  fld: PropTypes.func,
};

const ReportDetails = createFragmentContainer(ReportDetailsComponent, {
  report: graphql`
    fragment ReportDetails_report on Report {
      id
      published
      object_status
      source_confidence_level
      createdByRef {
        node {
          id
          name
          entity_type
        }
      }
    }
  `,
});

export default compose(
  inject18n,
  withStyles(styles),
)(ReportDetails);
