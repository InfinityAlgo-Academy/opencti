import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { KeyboardArrowRightOutlined } from '@material-ui/icons';
import { compose, pathOr, take } from 'ramda';
import Skeleton from '@material-ui/lab/Skeleton';
import inject18n from '../../../../components/i18n';
import ItemMarking from '../../../../components/ItemMarking';
import StixCoreObjectLabels from '../stix_core_objects/StixCoreObjectLabels';
import ItemIcon from '../../../../components/ItemIcon';
import { resolveLink } from '../../../../utils/Entity';
import { truncate } from '../../../../utils/String';

const styles = (theme) => ({
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

class StixCoreObjectOrStixCoreRelationshipContainerLineComponent extends Component {
  render() {
    const {
      fd, classes, node, dataColumns, onLabelClick,
    } = this.props;
    return (
      <ListItem
        classes={{ root: classes.item }}
        divider={true}
        button={true}
        component={Link}
        to={`${resolveLink(node.entity_type)}/${node.id}`}
      >
        <ListItemIcon classes={{ root: classes.itemIcon }}>
          <ItemIcon type={node.entity_type} />
        </ListItemIcon>
        <ListItemText
          primary={
            <div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.name.width }}
              >
                {node.name
                  || node.attribute_abstract
                  || truncate(node.content, 30)
                  || node.opinion}
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.createdBy.width }}
              >
                {pathOr('', ['createdBy', 'name'], node)}
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.objectLabel.width }}
              >
                <StixCoreObjectLabels
                  variant="inList"
                  labels={node.objectLabel}
                  onClick={onLabelClick.bind(this)}
                />
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.created.width }}
              >
                {fd(node.first_observed || node.published || node.created)}
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.objectMarking.width }}
              >
                {take(1, pathOr([], ['objectMarking', 'edges'], node)).map(
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
        <ListItemIcon classes={{ root: classes.goIcon }}>
          <KeyboardArrowRightOutlined />
        </ListItemIcon>
      </ListItem>
    );
  }
}

StixCoreObjectOrStixCoreRelationshipContainerLineComponent.propTypes = {
  dataColumns: PropTypes.object,
  node: PropTypes.object,
  classes: PropTypes.object,
  fd: PropTypes.func,
  t: PropTypes.func,
  onLabelClick: PropTypes.func,
};

const StixCoreObjectOrStixCoreRelationshipContainerLineFragment = createFragmentContainer(
  StixCoreObjectOrStixCoreRelationshipContainerLineComponent,
  {
    node: graphql`
        fragment StixCoreObjectOrStixCoreRelationshipContainerLine_node on Container {
          id
          entity_type
          ... on Note {
            attribute_abstract
            content
            created
          }
          ... on Opinion {
            opinion
            created
          }
          ... on ObservedData {
            first_observed
            last_observed
          }
          ... on Report {
            name
            published
          }
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
          objectLabel {
            edges {
              node {
                id
                value
                color
              }
            }
          }
        }
      `,
  },
);

export const StixCoreObjectOrStixCoreRelationshipContainerLine = compose(
  inject18n,
  withStyles(styles),
)(StixCoreObjectOrStixCoreRelationshipContainerLineFragment);

class StixCoreObjectOrStixCoreRelationshipContainerLineDummyComponent extends Component {
  render() {
    const { classes, dataColumns } = this.props;
    return (
      <ListItem classes={{ root: classes.item }} divider={true}>
        <ListItemIcon classes={{ root: classes.itemIconDisabled }}>
          <Skeleton animation="wave" variant="circle" width={30} height={30} />
        </ListItemIcon>
        <ListItemText
          primary={
            <div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.name.width }}
              >
                <Skeleton
                  animation="wave"
                  variant="rect"
                  width="90%"
                  height="100%"
                />
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.createdBy.width }}
              >
                <Skeleton
                  animation="wave"
                  variant="rect"
                  width="90%"
                  height="100%"
                />
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.objectLabel.width }}
              >
                <Skeleton
                  animation="wave"
                  variant="rect"
                  width="90%"
                  height="100%"
                />
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.created.width }}
              >
                <Skeleton
                  animation="wave"
                  variant="rect"
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
                  variant="rect"
                  width={100}
                  height="100%"
                />
              </div>
            </div>
          }
        />
        <ListItemIcon classes={{ root: classes.goIcon }}>
          <KeyboardArrowRightOutlined />
        </ListItemIcon>
      </ListItem>
    );
  }
}

StixCoreObjectOrStixCoreRelationshipContainerLineDummyComponent.propTypes = {
  classes: PropTypes.object,
  dataColumns: PropTypes.object,
};

export const StixCoreObjectOrStixCoreRelationshipContainerLineDummy = compose(
  inject18n,
  withStyles(styles),
)(StixCoreObjectOrStixCoreRelationshipContainerLineDummyComponent);
