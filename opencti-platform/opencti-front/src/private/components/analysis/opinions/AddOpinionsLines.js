import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import {
  map, filter, head, compose, pathOr,
} from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { CheckCircle, WorkOutline } from '@material-ui/icons';
import graphql from 'babel-plugin-relay/macro';
import { ConnectionHandler } from 'relay-runtime';
import { truncate } from '../../../../utils/String';
import inject18n from '../../../../components/i18n';
import { commitMutation } from '../../../../relay/environment';
import ItemMarking from '../../../../components/ItemMarking';

const styles = (theme) => ({
  avatar: {
    width: 24,
    height: 24,
  },
  icon: {
    color: theme.palette.primary.main,
  },
});

const opinionLinesMutationRelationAdd = graphql`
  mutation AddOpinionsLinesRelationAddMutation(
    $id: ID!
    $input: StixMetaRelationshipAddInput!
  ) {
    opinionEdit(id: $id) {
      relationAdd(input: $input) {
        id
        from {
          ...OpinionLine_node
        }
      }
    }
  }
`;

export const opinionMutationRelationDelete = graphql`
  mutation AddOpinionsLinesRelationDeleteMutation(
    $id: ID!
    $toId: String!
    $relationship_type: String!
  ) {
    opinionEdit(id: $id) {
      relationDelete(toId: $toId, relationship_type: $relationship_type) {
        id
      }
    }
  }
`;

const sharedUpdater = (store, entityId, newEdge) => {
  const entity = store.get(entityId);
  const conn = ConnectionHandler.getConnection(entity, 'Pagination_opinions');
  ConnectionHandler.insertEdgeBefore(conn, newEdge);
};

class AddOpinionsLinesContainer extends Component {
  toggleOpinion(opinion) {
    const { entityId, entityOpinions } = this.props;
    const entityOpinionsIds = map((n) => n.node.id, entityOpinions);
    const alreadyAdded = entityOpinionsIds.includes(opinion.id);
    if (alreadyAdded) {
      const existingOpinion = head(
        filter((n) => n.node.id === opinion.id, entityOpinions),
      );
      commitMutation({
        mutation: opinionMutationRelationDelete,
        variables: {
          id: existingOpinion.node.id,
          toId: entityId,
          relationship_type: 'object',
        },
        updater: (store) => {
          const entity = store.get(entityId);
          const conn = ConnectionHandler.getConnection(
            entity,
            'Pagination_opinions',
          );
          ConnectionHandler.deleteNode(conn, opinion.id);
        },
      });
    } else {
      const input = {
        toId: entityId,
        relationship_type: 'object',
      };
      commitMutation({
        mutation: opinionLinesMutationRelationAdd,
        variables: {
          id: opinion.id,
          input,
        },
        updater: (store) => {
          const payload = store
            .getRootField('opinionEdit')
            .getLinkedRecord('relationAdd', { input });
          const relationId = payload.getValue('id');
          const node = payload.getLinkedRecord('from');
          const relation = store.get(relationId);
          payload.setLinkedRecord(node, 'node');
          payload.setLinkedRecord(relation, 'relation');
          sharedUpdater(store, entityId, payload);
        },
      });
    }
  }

  render() {
    const { classes, data, entityOpinions } = this.props;
    const entityOpinionsIds = map((n) => n.node.id, entityOpinions);
    return (
      <List>
        {data.opinions.edges.map((opinionNode) => {
          const opinion = opinionNode.node;
          const alreadyAdded = entityOpinionsIds.includes(opinion.id);
          const opinionId = opinion.external_id
            ? `(${opinion.external_id})`
            : '';
          return (
            <ListItem
              key={opinion.id}
              classes={{ root: classes.menuItem }}
              divider={true}
              button={true}
              onClick={this.toggleOpinion.bind(this, opinion)}
            >
              <ListItemIcon>
                {alreadyAdded ? (
                  <CheckCircle classes={{ root: classes.icon }} />
                ) : (
                  <WorkOutline />
                )}
              </ListItemIcon>
              <ListItemText
                primary={`${opinion.opinion} ${opinionId}`}
                secondary={truncate(opinion.explanation, 120)}
              />
              <div style={{ marginRight: 50 }}>
                {pathOr('', ['createdBy', 'name'], opinion)}
              </div>
              <div style={{ marginRight: 50 }}>
                {pathOr([], ['objectMarking', 'edges'], opinion).length > 0 ? (
                  map(
                    (markingDefinition) => (
                      <ItemMarking
                        key={markingDefinition.node.id}
                        label={markingDefinition.node.definition}
                        variant="inList"
                      />
                    ),
                    opinion.objectMarking.edges,
                  )
                ) : (
                  <ItemMarking label="TLP:WHITE" variant="inList" />
                )}
              </div>
            </ListItem>
          );
        })}
      </List>
    );
  }
}

AddOpinionsLinesContainer.propTypes = {
  entityId: PropTypes.string,
  entityOpinions: PropTypes.array,
  data: PropTypes.object,
  limit: PropTypes.number,
  classes: PropTypes.object,
  t: PropTypes.func,
  fld: PropTypes.func,
};

export const addOpinionsLinesQuery = graphql`
  query AddOpinionsLinesQuery($search: String, $count: Int!, $cursor: ID) {
    ...AddOpinionsLines_data
      @arguments(search: $search, count: $count, cursor: $cursor)
  }
`;

const AddOpinionsLines = createPaginationContainer(
  AddOpinionsLinesContainer,
  {
    data: graphql`
      fragment AddOpinionsLines_data on Query
      @argumentDefinitions(
        search: { type: "String" }
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "ID" }
      ) {
        opinions(search: $search, first: $count, after: $cursor)
          @connection(key: "Pagination_opinions") {
          edges {
            node {
              id
              opinion
              explanation
            }
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.data && props.data.opinions;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }) {
      return {
        count,
        cursor,
      };
    },
    query: addOpinionsLinesQuery,
  },
);

export default compose(inject18n, withStyles(styles))(AddOpinionsLines);
