import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import { LinkOff } from '@material-ui/icons';
import { compose } from 'ramda';
import { Link } from 'react-router-dom';
import inject18n from '../../../../components/i18n';
import { truncate } from '../../../../utils/String';
import { commitMutation } from '../../../../relay/environment';
import AddCoursesOfAction from './AddCoursesOfAction';
import { courseOfActionMutationRelationDelete } from './AddCoursesOfActionLines';

const styles = theme => ({
  paper: {
    minHeight: '100%',
    margin: '-4px 0 0 0',
    padding: 0,
    borderRadius: 6,
  },
  list: {
    padding: 0,
  },
  avatar: {
    width: 24,
    height: 24,
    backgroundColor: theme.palette.primary.main,
  },
  avatarDisabled: {
    width: 24,
    height: 24,
  },
  placeholder: {
    display: 'inline-block',
    height: '1em',
    backgroundColor: theme.palette.grey[700],
  },
});

class EntityCoursesOfActionLinesContainer extends Component {
  removeCourseOfAction(courseOfActionEdge) {
    commitMutation({
      mutation: courseOfActionMutationRelationDelete,
      variables: {
        id: courseOfActionEdge.node.id,
        relationId: courseOfActionEdge.relation.id,
      },
      updater: (store) => {
        const container = store.getRoot();
        const userProxy = store.get(container.getDataID());
        const conn = ConnectionHandler.getConnection(
          userProxy,
          'Pagination_coursesOfAction',
          this.props.paginationOptions,
        );
        ConnectionHandler.deleteNode(conn, courseOfActionEdge.node.id);
      },
    });
  }

  render() {
    const {
      t, classes, entityId, data, paginationOptions,
    } = this.props;
    return (
      <div style={{ height: '100%' }}>
        <Typography variant="h4" gutterBottom={true} style={{ float: 'left' }}>
          {t('Courses of action')}
        </Typography>
        <AddCoursesOfAction
          entityId={entityId}
          entityCoursesOfAction={data.coursesOfAction.edges}
          entityPaginationOptions={paginationOptions}
        />
        <div className="clearfix" />
        <Paper classes={{ root: classes.paper }} elevation={2}>
          <List classes={{ root: classes.list }}>
            {data.coursesOfAction.edges.map((courseOfActionEdge) => {
              const courseOfAction = courseOfActionEdge.node;
              return (
                <ListItem
                  key={courseOfAction.id}
                  dense={true}
                  divider={true}
                  button={true}
                  component={Link}
                  to={`/dashboard/techniques/courses_of_action/${courseOfAction.id}`}
                >
                  <ListItemIcon>
                    <Avatar classes={{ root: classes.avatar }}>
                      {courseOfAction.name.substring(0, 1)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={courseOfAction.name}
                    secondary={truncate(courseOfAction.description, 60)}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      aria-label="Remove"
                      onClick={this.removeCourseOfAction.bind(
                        this,
                        courseOfActionEdge,
                      )}
                    >
                      <LinkOff />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </div>
    );
  }
}

EntityCoursesOfActionLinesContainer.propTypes = {
  entityId: PropTypes.string,
  paginationOptions: PropTypes.object,
  data: PropTypes.object,
  limit: PropTypes.number,
  classes: PropTypes.object,
  t: PropTypes.func,
  fld: PropTypes.func,
};

export const entityCoursesOfActionLinesQuery = graphql`
  query EntityCoursesOfActionLinesQuery(
    $objectId: String!
    $count: Int!
    $cursor: ID
    $orderBy: CoursesOfActionOrdering
    $orderMode: OrderingMode
  ) {
    ...EntityCoursesOfActionLines_data
      @arguments(
        objectId: $objectId
        count: $count
        cursor: $cursor
        orderBy: $orderBy
        orderMode: $orderMode
      )
  }
`;

const EntityCoursesOfActionLines = createPaginationContainer(
  EntityCoursesOfActionLinesContainer,
  {
    data: graphql`
      fragment EntityCoursesOfActionLines_data on Query
        @argumentDefinitions(
          objectId: { type: "String!" }
          count: { type: "Int", defaultValue: 25 }
          cursor: { type: "ID" }
          orderBy: { type: "CoursesOfActionOrdering", defaultValue: "name" }
          orderMode: { type: "OrderingMode", defaultValue: "asc" }
        ) {
        coursesOfAction(
          objectId: $objectId
          first: $count
          after: $cursor
          orderBy: $orderBy
          orderMode: $orderMode
        ) @connection(key: "Pagination_coursesOfAction") {
          edges {
            node {
              id
              name
              description
            }
            relation {
              id
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
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.data && props.data.coursesOfAction;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        objectId: fragmentVariables.objectId,
        count,
        cursor,
        orderBy: fragmentVariables.orderBy,
        orderMode: fragmentVariables.orderMode,
      };
    },
    query: entityCoursesOfActionLinesQuery,
  },
);

export default compose(
  inject18n,
  withStyles(styles),
)(EntityCoursesOfActionLines);
