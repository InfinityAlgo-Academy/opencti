import React from 'react';
import * as R from 'ramda';
import { Link } from 'react-router-dom';
import { graphql, createFragmentContainer } from 'react-relay';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { MoreVert } from '@mui/icons-material';
import Skeleton from '@mui/material/Skeleton';
import makeStyles from '@mui/styles/makeStyles';
import { useFormatter } from '../../../../components/i18n';
import ItemMarking from '../../../../components/ItemMarking';
import ItemIcon from '../../../../components/ItemIcon';
import ContainerStixCoreObjectPopover from './ContainerStixCoreObjectPopover';
import { resolveLink } from '../../../../utils/Entity';

const useStyles = makeStyles((theme) => ({
  item: {
    paddingLeft: 10,
    height: 50,
  },
  itemIcon: {
    color: theme.palette.primary.main,
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
  itemIconDisabled: {
    color: theme.palette.grey[700],
  },
  placeholder: {
    display: 'inline-block',
    height: '1em',
    backgroundColor: theme.palette.grey[700],
  },
}));

const ContainerStixObjectOrStixRelationshipLineComponent = (props) => {
  const { node, dataColumns, containerId, paginationOptions } = props;
  const classes = useStyles();
  const { t, fd } = useFormatter();
  const restrictedWithFrom = node.from === null;
  // eslint-disable-next-line no-nested-ternary
  const link = node.relationship_type
    ? !restrictedWithFrom
      ? `${resolveLink(node.from.entity_type)}/${
        node.from.id
      }/knowledge/relations/${node.id}`
      : null
    : `${resolveLink(node.entity_type)}/${node.id}`;
  return (
    <ListItem
      classes={{ root: classes.item }}
      button={true}
      divider={true}
      component={Link}
      to={link}
      disabled={node.relationship_type && restrictedWithFrom}
    >
      <ListItemIcon classes={{ root: classes.itemIcon }}>
        <ItemIcon type={node.entity_type} />
      </ListItemIcon>
      <ListItemText
        primary={
          <div>
            <div
              className={classes.bodyItem}
              style={{ width: dataColumns.entity_type.width }}
            >
              {/* eslint-disable-next-line no-nested-ternary */}
              {node.relationship_type
                ? !restrictedWithFrom
                  ? t(`relationship_${node.entity_type}`)
                  : t('Restricted')
                : t(`entity_${node.entity_type}`)}
            </div>
            <div
              className={classes.bodyItem}
              style={{ width: dataColumns.name.width }}
            >
              {/* eslint-disable-next-line no-nested-ternary */}
              {node.relationship_type
                ? !restrictedWithFrom
                  ? `${node.from.name || node.from.observable_value} - ${
                    node.to.name || node.to.observable_value
                  }`
                  : t('Restricted')
                : node.name
                  || node.observable_value
                  || node.attribute_abstract
                  || node.content
                  || node.opinion}
            </div>
            <div
              className={classes.bodyItem}
              style={{ width: dataColumns.created_at.width }}
            >
              {fd(node.created_at)}
            </div>
            <div
              className={classes.bodyItem}
              style={{ width: dataColumns.objectMarking.width }}
            >
              {R.take(1, R.pathOr([], ['objectMarking', 'edges'], node)).map(
                (markingDefinition) => (
                  <ItemMarking
                    key={markingDefinition.node.id}
                    variant="inList"
                    label={markingDefinition.node.definition}
                    color={markingDefinition.node.x_opencti_color}
                  />
                ),
              )}
            </div>
          </div>
        }
      />
      <ListItemSecondaryAction>
        <ContainerStixCoreObjectPopover
          containerId={containerId}
          toId={node.id}
          relationshipType="object"
          paginationKey="Pagination_objects"
          paginationOptions={paginationOptions}
        />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export const ContainerStixObjectOrStixRelationshipLine = createFragmentContainer(ContainerStixObjectOrStixRelationshipLineComponent, {
  node: graphql`
      fragment ContainerStixObjectOrStixRelationshipLine_node on StixObjectOrStixRelationship {
        ... on BasicObject {
          id
          entity_type
        }
        ... on StixCoreObject {
          created_at
          createdBy {
            ... on Identity {
              id
              name
              entity_type
            }
          }
          objectMarking {
            edges {
              node {
                id
                definition
                x_opencti_color
              }
            }
          }
        }
        ... on AttackPattern {
          name
        }
        ... on Campaign {
          name
        }
        ... on Report {
          name
        }
        ... on CourseOfAction {
          name
        }
        ... on Individual {
          name
        }
        ... on Organization {
          name
        }
        ... on Sector {
          name
        }
        ... on System {
          name
        }
        ... on Indicator {
          name
        }
        ... on Infrastructure {
          name
        }
        ... on IntrusionSet {
          name
        }
        ... on Position {
          name
        }
        ... on City {
          name
        }
        ... on Country {
          name
        }
        ... on Region {
          name
        }
        ... on Malware {
          name
        }
        ... on ThreatActor {
          name
        }
        ... on Tool {
          name
        }
        ... on Vulnerability {
          name
        }
        ... on Incident {
          name
        }
        ... on Event {
          name
        }
        ... on Channel {
          name
        }
        ... on Narrative {
          name
        }
        ... on Language {
          name
        }
        ... on StixCyberObservable {
          observable_value
        }
        ... on BasicRelationship {
          id
          entity_type
        }
        ... on StixCoreRelationship {
          relationship_type
          from {
            ... on BasicObject {
              id
              entity_type
            }
            ... on BasicRelationship {
              id
              entity_type
            }
            ... on AttackPattern {
              name
            }
            ... on Campaign {
              name
            }
            ... on CourseOfAction {
              name
            }
            ... on Individual {
              name
            }
            ... on Organization {
              name
            }
            ... on Sector {
              name
            }
            ... on Indicator {
              name
            }
            ... on Infrastructure {
              name
            }
            ... on IntrusionSet {
              name
            }
            ... on Position {
              name
            }
            ... on City {
              name
            }
            ... on Country {
              name
            }
            ... on Region {
              name
            }
            ... on Malware {
              name
            }
            ... on ThreatActor {
              name
            }
            ... on Tool {
              name
            }
            ... on Vulnerability {
              name
            }
            ... on Incident {
              name
            }
            ... on Event {
              name
            }
            ... on Channel {
              name
            }
            ... on Narrative {
              name
            }
            ... on Language {
              name
            }
          }
          to {
            ... on BasicObject {
              id
              entity_type
            }
            ... on BasicRelationship {
              id
              entity_type
            }
            ... on AttackPattern {
              name
            }
            ... on Campaign {
              name
            }
            ... on CourseOfAction {
              name
            }
            ... on Individual {
              name
            }
            ... on Organization {
              name
            }
            ... on Sector {
              name
            }
            ... on Indicator {
              name
            }
            ... on Infrastructure {
              name
            }
            ... on IntrusionSet {
              name
            }
            ... on Position {
              name
            }
            ... on City {
              name
            }
            ... on Country {
              name
            }
            ... on Region {
              name
            }
            ... on Malware {
              name
            }
            ... on ThreatActor {
              name
            }
            ... on Tool {
              name
            }
            ... on Vulnerability {
              name
            }
            ... on Incident {
              name
            }
            ... on Event {
              name
            }
            ... on Channel {
              name
            }
            ... on Narrative {
              name
            }
            ... on Language {
              name
            }
          }
        }
      }
    `,
});

export const ContainerStixObjectOrStixRelationshipLineDummy = (props) => {
  const { dataColumns } = props;
  const classes = useStyles();
  return (
    <ListItem classes={{ root: classes.item }} divider={true}>
      <ListItemIcon classes={{ root: classes.itemIconDisabled }}>
        <Skeleton animation="wave" variant="circular" width={30} height={30} />
      </ListItemIcon>
      <ListItemText
        primary={
          <div>
            <div
              className={classes.bodyItem}
              style={{ width: dataColumns.entity_type.width }}
            >
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="90%"
                height="100%"
              />
            </div>
            <div
              className={classes.bodyItem}
              style={{ width: dataColumns.name.width }}
            >
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="90%"
                height="100%"
              />
            </div>
            <div
              className={classes.bodyItem}
              style={{ width: dataColumns.created_at.width }}
            >
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="90%"
                height="100%"
              />
            </div>
            <div
              className={classes.bodyItem}
              style={{ width: dataColumns.objectMarking.width }}
            >
              <Skeleton
                animation="wave"
                variant="rectangular"
                width={100}
                height="100%"
              />
            </div>
          </div>
        }
      />
      <ListItemSecondaryAction classes={{ root: classes.itemIconDisabled }}>
        <MoreVert />
      </ListItemSecondaryAction>
    </ListItem>
  );
};
