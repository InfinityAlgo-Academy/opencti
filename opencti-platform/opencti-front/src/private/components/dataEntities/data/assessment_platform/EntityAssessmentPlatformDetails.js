/* eslint-disable */
/* refactor */
import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Grid, Switch, Tooltip } from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Launch from '@material-ui/icons/Launch';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { BullseyeArrow, ArmFlexOutline, Information } from 'mdi-material-ui';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandableMarkdown from '../../../../../components/ExpandableMarkdown';
import inject18n from '../../../../../components/i18n';
import CyioCoreObjectLabelsView from '../../../common/stix_core_objects/CyioCoreObjectLabelsView';
const styles = (theme) => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: '24px 24px 32px 24px',
    borderRadius: 6,
  },
  link: {
    textAlign: 'left',
    fontSize: '16px',
    font: 'DIN Next LT Pro',
  },
  chip: {
    color: theme.palette.header.text,
    height: 25,
    fontSize: 12,
    padding: '14px 12px',
    margin: '0 7px 7px 0',
    backgroundColor: theme.palette.header.background,
  },
  scrollBg: {
    background: theme.palette.header.background,
    width: '100%',
    color: 'white',
    padding: '10px 5px 10px 15px',
    borderRadius: '5px',
    lineHeight: '20px',
  },
  scrollDiv: {
    width: '100%',
    background: theme.palette.header.background,
    height: '223px',
    overflow: 'hidden',
    overflowY: 'scroll',
  },
  scrollObj: {
    color: theme.palette.header.text,
    fontFamily: 'sans-serif',
    padding: '0px',
    textAlign: 'left',
  },
  markingText: {
    background: theme.palette.header.text,
    color: 'black',
    width: '100px',
    textAlign: 'center',
    padding: '3px 0',
  }
});

class EntityAssessmentPlatformDetailsComponent extends Component {
  render() {
    const {
      t,
      classes,
      refreshQuery,
      assessmentPlatform,
      fd,
      history,
    } = this.props;
    return (
      <div style={{ height: '100%' }}>
        <Typography variant="h4" gutterBottom={true}>
          {t('Basic Information')}
        </Typography>
        <Paper classes={{ root: classes.paper }} elevation={2}>
          <Grid container={true} spacing={3}>
            <Grid item={true} xs={3}>
              <div>
                <Typography
                  variant="h3"
                  color="textSecondary"
                  gutterBottom={true}
                >
                  {t('Name')}
                </Typography>
                <div className="clearfix" />
                {assessmentPlatform.name}
              </div>
              <div style={{ marginTop: '20px' }}>
                <Typography
                  variant="h3"
                  color="textSecondary"
                  gutterBottom={true}
                >
                  {t('Created')}
                </Typography>
                <div className="clearfix" />
                {assessmentPlatform.created}
              </div>
              <div style={{ marginTop: '20px' }}>
                <Typography
                  variant="h3"
                  color="textSecondary"
                  gutterBottom={true}
                >
                  {t('User Component')}
                </Typography>
                <div className="clearfix" />
                {assessmentPlatform.uses_components.name}
              </div>
            </Grid>
            <Grid item={true} xs={4}>
              <div>
                <Typography
                  variant="h3"
                  color="textSecondary"
                  gutterBottom={true}
                >
                  {t('ID')}
                </Typography>
                <div className="clearfix" />
                {assessmentPlatform.id}
              </div>
              <div style={{ marginTop: '20px' }}>
                <Typography
                  variant="h3"
                  color="textSecondary"
                  gutterBottom={true}
                >
                  {t('Last Modified')}
                </Typography>
                <div className="clearfix" />
                {assessmentPlatform.modified}
              </div>
            </Grid>
            <Grid item={true} xs={4}>
              <Typography
                variant="h3"
                color="textSecondary"
                gutterBottom={true}
              >
                {t('Description')}
              </Typography>
              <div className="clearfix" />
              <div className={classes.scrollBg}>
                <div className={classes.scrollDiv}>
                  <div className={classes.scrollObj}>
                  {assessmentPlatform.description}
                  </div>
                </div>
              </div>
            </Grid>
          </Grid>
          <Grid container={true} spacing={3}>
            <Grid item={true} xs={3}>
              <CyioCoreObjectLabelsView
                labels={assessmentPlatform.labels}
                marginTop={0}
                refreshQuery={refreshQuery}
                id={assessmentPlatform.id}
                typename={assessmentPlatform.__typename}
              />
            </Grid>
            <Grid item={true} xs={4}>
              <Typography
                variant="h3"
                color="textSecondary"
                gutterBottom={true}
              >
                {t('Markings')}
              </Typography>
              <div className="clearfix" />
              <p className={classes.markingText}>
                {t('IEP: WHITE')}
              </p>
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}

EntityAssessmentPlatformDetailsComponent.propTypes = {
  assessmentPlatform: PropTypes.object,
  classes: PropTypes.object,
  refreshQuery: PropTypes.func,
  t: PropTypes.func,
  fd: PropTypes.func,
};

const EntityAssessmentPlatformDetails = createFragmentContainer(
  EntityAssessmentPlatformDetailsComponent,
  {
    assessmentPlatform: graphql`
      fragment EntityAssessmentPlatformDetails_assessmentPlatform on AssessmentPlatform {
        __typename
        id
        entity_type
        created
        modified
        name
        description
        remarks {
          id
          authors
        }
        labels {
          __typename
          id
          name
          color
          entity_type
          description
        }
        uses_components {
          id
          name
        }
      }
    `,
  },
);

export default compose(inject18n, withStyles(styles))(EntityAssessmentPlatformDetails);
