import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import { graphql, createFragmentContainer } from 'react-relay';
import ListItem from '@mui/material/ListItem';
import { Link } from 'react-router-dom';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import inject18n from '../../../../components/i18n';
import ItemIcon from '../../../../components/ItemIcon';
import StixCyberObservableRelationshipPopover from '../stix_cyber_observable_relationships/StixCyberObservableRelationshipPopover';
import { resolveLink } from '../../../../utils/Entity';
import { defaultValue } from '../../../../utils/Graph';

const styles = (theme) => ({
  item: {
    paddingLeft: 10,
    height: 50,
  },
  itemIcon: {
    color: theme.palette.primary.main,
  },
  itemHead: {
    paddingLeft: 10,
    textTransform: 'uppercase',
  },
  bodyItem: {
    height: 20,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 5,
  },
  goIcon: {
    position: 'absolute',
    right: -10,
  },
  itemIconDisabled: {
    color: theme.palette.grey[700],
  },
  placeholder: {
    display: 'inline-block',
    height: '1em',
    backgroundColor: theme.palette.grey[700],
  },
});

class StixDomainObjectNestedEntitiesLinesComponent extends Component {
  render() {
    const { stixDomainObjectId, t, fsd, paginationOptions, data, classes } = this.props;
    return (
      <div>
        {data
          && data.stixCyberObservableRelationships
          && data.stixCyberObservableRelationships.edges.map(
            (stixCyberObservableRelationEdge) => {
              const stixCyberObservableRelationship = stixCyberObservableRelationEdge.node;
              const stixCoreObject = stixCyberObservableRelationship.from.id === stixDomainObjectId
                ? stixCyberObservableRelationship.to
                : stixCyberObservableRelationship.from;
              const link = `${resolveLink(stixCoreObject.entity_type)}/${
                stixCoreObject.id
              }`;
              return (
                <ListItem
                  key={stixCoreObject.id}
                  classes={{ root: classes.item }}
                  divider={true}
                  button={true}
                  component={Link}
                  to={link}
                >
                  <ListItemIcon classes={{ root: classes.itemIcon }}>
                    <ItemIcon type={stixCoreObject.entity_type} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <div>
                        <div
                          className={classes.bodyItem}
                          style={{ width: '20%' }}
                        >
                          {t(
                            `relationship_${stixCyberObservableRelationship.relationship_type}`,
                          )}
                        </div>
                        <div
                          className={classes.bodyItem}
                          style={{ width: '20%' }}
                        >
                          {t(`entity_${stixCoreObject.entity_type}`)}
                        </div>
                        <div
                          className={classes.bodyItem}
                          style={{ width: '40%' }}
                        >
                          {defaultValue(stixCoreObject)}
                        </div>
                        <div className={classes.bodyItem}>
                          {fsd(stixCyberObservableRelationship.start_time)}
                        </div>
                      </div>
                    }
                  />
                  <ListItemSecondaryAction>
                    <StixCyberObservableRelationshipPopover
                      stixCyberObservableRelationshipId={
                        stixCyberObservableRelationship.id
                      }
                      paginationOptions={paginationOptions}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              );
            },
          )}
      </div>
    );
  }
}

StixDomainObjectNestedEntitiesLinesComponent.propTypes = {
  stixDomainObjectId: PropTypes.string,
  paginationOptions: PropTypes.object,
  data: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export const stixDomainObjectNestedEntitiesLinesQuery = graphql`
  query StixDomainObjectNestedEntitiesLinesQuery(
    $elementId: String
    $search: String
    $count: Int!
    $orderBy: StixCyberObservableRelationshipsOrdering
    $orderMode: OrderingMode
  ) {
    ...StixDomainObjectNestedEntitiesLines_data
      @arguments(
        elementId: $elementId
        search: $search
        count: $count
        orderBy: $orderBy
        orderMode: $orderMode
      )
  }
`;

const StixDomainObjectNestedEntitiesLines = createFragmentContainer(
  StixDomainObjectNestedEntitiesLinesComponent,
  {
    data: graphql`
      fragment StixDomainObjectNestedEntitiesLines_data on Query
      @argumentDefinitions(
        elementId: { type: "String" }
        search: { type: "String" }
        count: { type: "Int", defaultValue: 25 }
        orderBy: { type: "StixCyberObservableRelationshipsOrdering" }
        orderMode: { type: "OrderingMode" }
      ) {
        stixCyberObservableRelationships(
          elementId: $elementId
          search: $search
          first: $count
          orderBy: $orderBy
          orderMode: $orderMode
        ) @connection(key: "Pagination_stixCyberObservableRelationships") {
          edges {
            node {
              id
              relationship_type
              start_time
              stop_time
              from {
                ... on BasicObject {
                  id
                  entity_type
                  parent_types
                }
                ... on StixObject {
                  created_at
                  updated_at
                }
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
                }
                ... on Infrastructure {
                  name
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
                ... on AdministrativeArea {
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
                ... on Event {
                  name
                  description
                }
                ... on Channel {
                  name
                  description
                }
                ... on Narrative {
                  name
                  description
                }
                ... on Language {
                  name
                }
                ... on DataComponent {
                  name
                }
                ... on DataSource {
                  name
                }
                ... on Case {
                  name
                }
                ... on StixCyberObservable {
                  observable_value
                }
              }
              to {
                ... on BasicObject {
                  id
                  entity_type
                  parent_types
                }
                ... on StixObject {
                  created_at
                  updated_at
                }
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
                }
                ... on Infrastructure {
                  name
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
                ... on AdministrativeArea {
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
                ... on Event {
                  name
                  description
                }
                ... on Channel {
                  name
                  description
                }
                ... on Narrative {
                  name
                  description
                }
                ... on Language {
                  name
                }
                ... on DataComponent {
                  name
                }
                ... on DataSource {
                  name
                }
                ... on Case {
                  name
                }
                ... on StixCyberObservable {
                  observable_value
                }
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
            globalCount
          }
        }
      }
    `,
  },
);

export default compose(
  inject18n,
  withStyles(styles),
)(StixDomainObjectNestedEntitiesLines);
