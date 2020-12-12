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

const observedDataLinesMutationRelationAdd = graphql`
  mutation AddObservedDataLinesRelationAddMutation(
    $id: ID!
    $input: StixMetaRelationshipAddInput!
  ) {
    observedDataEdit(id: $id) {
      relationAdd(input: $input) {
        id
        from {
          ...ObservedDataLine_node
        }
      }
    }
  }
`;

export const observedDataMutationRelationDelete = graphql`
  mutation AddObservedDataLinesRelationDeleteMutation(
    $id: ID!
    $toId: String!
    $relationship_type: String!
  ) {
    observedDataEdit(id: $id) {
      relationDelete(toId: $toId, relationship_type: $relationship_type) {
        id
      }
    }
  }
`;

const sharedUpdater = (store, entityId, newEdge) => {
  const entity = store.get(entityId);
  const conn = ConnectionHandler.getConnection(
    entity,
    'Pagination_ObservedData',
  );
  ConnectionHandler.insertEdgeBefore(conn, newEdge);
};

class AddObservedDataLinesContainer extends Component {
  toggleObservedData(observedData) {
    const { entityId, entityObservedData } = this.props;
    const entityObservedDataIds = map((n) => n.node.id, entityObservedData);
    const alreadyAdded = entityObservedDataIds.includes(observedData.id);
    if (alreadyAdded) {
      const existingObservedData = head(
        filter((n) => n.node.id === observedData.id, entityObservedData),
      );
      commitMutation({
        mutation: observedDataMutationRelationDelete,
        variables: {
          id: existingObservedData.node.id,
          toId: entityId,
          relationship_type: 'object',
        },
        updater: (store) => {
          const entity = store.get(entityId);
          const conn = ConnectionHandler.getConnection(
            entity,
            'Pagination_ObservedData',
          );
          ConnectionHandler.deleteNode(conn, observedData.id);
        },
      });
    } else {
      const input = {
        toId: entityId,
        relationship_type: 'object',
      };
      commitMutation({
        mutation: observedDataLinesMutationRelationAdd,
        variables: {
          id: observedData.id,
          input,
        },
        updater: (store) => {
          const payload = store
            .getRootField('observedDataEdit')
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
    const { classes, data, entityObservedData } = this.props;
    const entityObservedDataIds = map((n) => n.node.id, entityObservedData);
    return (
      <List>
        {data.ObservedData.edges.map((observedDataNode) => {
          const observedData = observedDataNode.node;
          const alreadyAdded = entityObservedDataIds.includes(observedData.id);
          const observedDataId = observedData.external_id
            ? `(${observedData.external_id})`
            : '';
          return (
            <ListItem
              key={observedData.id}
              classes={{ root: classes.menuItem }}
              divider={true}
              button={true}
              onClick={this.toggleObservedData.bind(this, observedData)}
            >
              <ListItemIcon>
                {alreadyAdded ? (
                  <CheckCircle classes={{ root: classes.icon }} />
                ) : (
                  <WorkOutline />
                )}
              </ListItemIcon>
              <ListItemText
                primary={`${observedData.observedData} ${observedDataId}`}
                secondary={truncate(observedData.explanation, 120)}
              />
              <div style={{ marginRight: 50 }}>
                {pathOr('', ['createdBy', 'name'], observedData)}
              </div>
              <div style={{ marginRight: 50 }}>
                {pathOr([], ['objectMarking', 'edges'], observedData).length
                > 0 ? (
                    map(
                      (markingDefinition) => (
                      <ItemMarking
                        key={markingDefinition.node.id}
                        label={markingDefinition.node.definition}
                        variant="inList"
                      />
                      ),
                      observedData.objectMarking.edges,
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

AddObservedDataLinesContainer.propTypes = {
  entityId: PropTypes.string,
  entityObservedData: PropTypes.array,
  data: PropTypes.object,
  limit: PropTypes.number,
  classes: PropTypes.object,
  t: PropTypes.func,
  fld: PropTypes.func,
};

export const addObservedDataLinesQuery = graphql`
  query AddObservedDataLinesQuery($search: String, $count: Int!, $cursor: ID) {
    ...AddObservedDataLines_data
      @arguments(search: $search, count: $count, cursor: $cursor)
  }
`;

const AddObservedDataLines = createPaginationContainer(
  AddObservedDataLinesContainer,
  {
    data: graphql`
      fragment AddObservedDataLines_data on Query
      @argumentDefinitions(
        search: { type: "String" }
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "ID" }
      ) {
        observedDatas(search: $search, first: $count, after: $cursor)
          @connection(key: "Pagination_observedDatas") {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.data && props.data.ObservedData;
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
    query: addObservedDataLinesQuery,
  },
);

export default compose(inject18n, withStyles(styles))(AddObservedDataLines);
