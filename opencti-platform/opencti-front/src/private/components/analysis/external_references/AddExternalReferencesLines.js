import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import {
  map, filter, head, compose,
} from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import { CheckCircle } from '@material-ui/icons';
import graphql from 'babel-plugin-relay/macro';
import { ConnectionHandler } from 'relay-runtime';
import { truncate } from '../../../../utils/String';
import inject18n from '../../../../components/i18n';
import { commitMutation } from '../../../../relay/environment';
import ExternalReferenceCreation from './ExternalReferenceCreation';

const styles = (theme) => ({
  avatar: {
    width: 24,
    height: 24,
  },
  icon: {
    color: theme.palette.primary.main,
  },
});

const externalReferenceLinesMutationRelationAdd = graphql`
  mutation AddExternalReferencesLinesRelationAddMutation(
    $id: ID!
    $input: StixMetaRelationshipAddInput!
  ) {
    externalReferenceEdit(id: $id) {
      relationAdd(input: $input) {
        id
        to {
          ... on ExternalReference {
            id
            source_name
            description
            url
            hash
            external_id
          }
        }
      }
    }
  }
`;

export const externalReferenceMutationRelationDelete = graphql`
  mutation AddExternalReferencesLinesRelationDeleteMutation(
    $id: ID!
    $fromId: String!
    $relationship_type: String!
  ) {
    externalReferenceEdit(id: $id) {
      relationDelete(fromId: $fromId, relationship_type: $relationship_type) {
        id
      }
    }
  }
`;

const sharedUpdater = (store, stixCoreObjectId, newEdge) => {
  const entity = store.get(stixCoreObjectId);
  const conn = ConnectionHandler.getConnection(
    entity,
    'Pagination_externalReferences',
  );
  ConnectionHandler.insertEdgeBefore(conn, newEdge);
};

class AddExternalReferencesLinesContainer extends Component {
  toggleExternalReference(externalReference) {
    const { stixCoreObjectId, stixCoreObjectExternalReferences } = this.props;
    const stixCoreObjectExternalReferencesIds = map(
      (n) => n.node.id,
      stixCoreObjectExternalReferences,
    );
    const alreadyAdded = stixCoreObjectExternalReferencesIds.includes(
      externalReference.id,
    );

    if (alreadyAdded) {
      const existingExternalReference = head(
        filter(
          (n) => n.node.id === externalReference.id,
          stixCoreObjectExternalReferences,
        ),
      );
      commitMutation({
        mutation: externalReferenceMutationRelationDelete,
        variables: {
          id: existingExternalReference.node.id,
          fromId: stixCoreObjectId,
          relationship_type: 'external-reference',
        },
        updater: (store) => {
          const entity = store.get(stixCoreObjectId);
          const conn = ConnectionHandler.getConnection(
            entity,
            'Pagination_externalReferences',
          );
          ConnectionHandler.deleteNode(conn, externalReference.id);
        },
      });
    } else {
      const input = {
        fromId: stixCoreObjectId,
        relationship_type: 'external-reference',
      };
      commitMutation({
        mutation: externalReferenceLinesMutationRelationAdd,
        variables: {
          id: externalReference.id,
          input,
        },
        updater: (store) => {
          const payload = store
            .getRootField('externalReferenceEdit')
            .getLinkedRecord('relationAdd', { input });
          const relationId = payload.getValue('id');
          const node = payload.getLinkedRecord('to');
          const relation = store.get(relationId);
          payload.setLinkedRecord(node, 'node');
          payload.setLinkedRecord(relation, 'relation');
          sharedUpdater(store, stixCoreObjectId, payload);
        },
      });
    }
  }

  render() {
    const {
      classes,
      data,
      stixCoreObjectExternalReferences,
      open,
      search,
      paginationOptions,
    } = this.props;
    const stixCoreObjectExternalReferencesIds = map(
      (n) => n.node.id,
      stixCoreObjectExternalReferences,
    );
    return (
      <div>
        <List>
          {data.externalReferences.edges.map((externalReferenceNode) => {
            const externalReference = externalReferenceNode.node;
            const alreadyAdded = stixCoreObjectExternalReferencesIds.includes(
              externalReference.id,
            );
            const externalReferenceId = externalReference.external_id
              ? `(${externalReference.external_id})`
              : '';
            return (
              <ListItem
                key={externalReference.id}
                classes={{ root: classes.menuItem }}
                divider={true}
                button={true}
                onClick={this.toggleExternalReference.bind(
                  this,
                  externalReference,
                )}
              >
                <ListItemIcon>
                  {alreadyAdded ? (
                    <CheckCircle classes={{ root: classes.icon }} />
                  ) : (
                    <Avatar classes={{ root: classes.avatar }}>
                      {externalReference.source_name.substring(0, 1)}
                    </Avatar>
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={`${externalReference.source_name} ${externalReferenceId}`}
                  secondary={truncate(
                    externalReference.description !== null
                      && externalReference.description.length > 0
                      ? externalReference.description
                      : externalReference.url,
                    120,
                  )}
                />
              </ListItem>
            );
          })}
        </List>
        <ExternalReferenceCreation
          display={open}
          contextual={true}
          inputValue={search}
          paginationOptions={paginationOptions}
          onCreate={this.toggleExternalReference.bind(this)}
        />
      </div>
    );
  }
}

AddExternalReferencesLinesContainer.propTypes = {
  stixCoreObjectId: PropTypes.string,
  stixCoreObjectExternalReferences: PropTypes.array,
  data: PropTypes.object,
  limit: PropTypes.number,
  classes: PropTypes.object,
  t: PropTypes.func,
  fld: PropTypes.func,
  paginationOptions: PropTypes.object,
  open: PropTypes.bool,
  search: PropTypes.string,
};

export const addExternalReferencesLinesQuery = graphql`
  query AddExternalReferencesLinesQuery(
    $search: String
    $count: Int!
    $cursor: ID
  ) {
    ...AddExternalReferencesLines_data
      @arguments(search: $search, count: $count, cursor: $cursor)
  }
`;

const AddExternalReferencesLines = createPaginationContainer(
  AddExternalReferencesLinesContainer,
  {
    data: graphql`
      fragment AddExternalReferencesLines_data on Query
      @argumentDefinitions(
        search: { type: "String" }
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "ID" }
      ) {
        externalReferences(search: $search, first: $count, after: $cursor)
          @connection(key: "Pagination_externalReferences") {
          edges {
            node {
              id
              source_name
              description
              url
              external_id
            }
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.data && props.data.externalReferences;
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
    query: addExternalReferencesLinesQuery,
  },
);

export default compose(
  inject18n,
  withStyles(styles),
)(AddExternalReferencesLines);
