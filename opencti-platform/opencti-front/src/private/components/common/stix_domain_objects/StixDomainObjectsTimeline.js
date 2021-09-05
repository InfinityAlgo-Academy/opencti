import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import TimelineDot from '@material-ui/lab/TimelineDot';
import { Link } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import Markdown from 'react-markdown';
import { QueryRenderer } from '../../../../relay/environment';
import ItemIcon from '../../../../components/ItemIcon';
import inject18n from '../../../../components/i18n';
import { defaultValue } from '../../../../utils/Graph';
import { resolveLink } from '../../../../utils/Entity';
import { truncate } from '../../../../utils/String';

const styles = (theme) => ({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  paper: {
    padding: 15,
  },
  itemIcon: {
    color: theme.palette.primary.main,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
});

const stixDomainObjectsTimelineQuery = graphql`
  query StixDomainObjectsTimelineQuery(
    $first: Int
    $types: [String]
    $orderBy: StixDomainObjectsOrdering
    $orderMode: OrderingMode
  ) {
    stixDomainObjects(
      first: $first
      types: $types
      orderBy: $orderBy
      orderMode: $orderMode
    ) {
      edges {
        node {
          entity_type
          created
          modified
          ... on AttackPattern {
            name
            description
          }
          ... on Campaign {
            name
            description
          }
          ... on CourseOfAction {
            name
            description
          }
          ... on Individual {
            name
            description
          }
          ... on Organization {
            name
            description
          }
          ... on Sector {
            name
            description
          }
          ... on System {
            name
            description
          }
          ... on Indicator {
            name
            description
          }
          ... on Infrastructure {
            name
            description
          }
          ... on IntrusionSet {
            name
            description
          }
          ... on Position {
            name
            description
          }
          ... on City {
            name
            description
          }
          ... on Country {
            name
            description
          }
          ... on Region {
            name
            description
          }
          ... on Malware {
            name
            description
          }
          ... on ThreatActor {
            name
            description
          }
          ... on Tool {
            name
            description
          }
          ... on Vulnerability {
            name
            description
          }
          ... on Incident {
            name
            description
          }
        }
      }
    }
  }
`;

class StixDomainObjectsTimeline extends Component {
  renderContent() {
    const {
      t, types, md, classes,
    } = this.props;
    const stixDomainObjectsVariables = {
      types,
      first: 10,
      orderBy: 'created',
      orderMode: 'desc',
    };
    return (
      <QueryRenderer
        query={stixDomainObjectsTimelineQuery}
        variables={stixDomainObjectsVariables}
        render={({ props }) => {
          if (
            props
            && props.stixDomainObjects
            && props.stixDomainObjects.edges.length > 0
          ) {
            const stixDomainObjectsEdges = props.stixDomainObjects.edges;
            return (
              <div id="container" className={classes.ccontainer}>
                <Timeline align="alternate">
                  {stixDomainObjectsEdges.map((stixDomainObjectEdge) => {
                    const stixDomainObject = stixDomainObjectEdge.node;
                    const link = `${resolveLink(
                      stixDomainObject.entity_type,
                    )}/${stixDomainObject.id}`;
                    return (
                      <TimelineItem key={stixDomainObject.id}>
                        <TimelineOppositeContent>
                          <Typography variant="body2" color="textSecondary">
                            {md(stixDomainObject.created)}
                          </Typography>
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                          <Link to={link}>
                            <TimelineDot color="primary" variant="outlined">
                              <ItemIcon type={stixDomainObject.entity_type} />
                            </TimelineDot>
                          </Link>
                          <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                          <Paper elevation={3} className={classes.paper}>
                            <Typography variant="h2">
                              {defaultValue(stixDomainObject)}
                            </Typography>
                            <div style={{ marginTop: -5, color: '#a8a8a8' }}>
                              <Markdown>
                                {truncate(stixDomainObject.description, 150)}
                              </Markdown>
                            </div>
                          </Paper>
                        </TimelineContent>
                      </TimelineItem>
                    );
                  })}
                </Timeline>
              </div>
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
      t, classes, title, variant,
    } = this.props;
    return (
      <div style={{ height: '100%' }}>
        <Typography variant="h4" gutterBottom={true}>
          {title || t('StixDomainObjects timeline')}
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

StixDomainObjectsTimeline.propTypes = {
  stixDomainObjectId: PropTypes.string,
  data: PropTypes.object,
  entityLink: PropTypes.string,
  paginationOptions: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
};

export default compose(
  inject18n,
  withStyles(styles),
)(StixDomainObjectsTimeline);
