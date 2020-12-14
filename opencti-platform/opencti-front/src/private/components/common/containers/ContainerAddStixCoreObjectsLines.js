import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import {
  map,
  filter,
  keys,
  groupBy,
  assoc,
  compose,
  append,
  pipe,
} from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { ExpandMore, CheckCircle } from '@material-ui/icons';
import { ConnectionHandler } from 'relay-runtime';
import Markdown from 'react-markdown';
import { commitMutation } from '../../../../relay/environment';
import { truncate } from '../../../../utils/String';
import ItemIcon from '../../../../components/ItemIcon';
import inject18n from '../../../../components/i18n';
// TODO @SAM Fix cyclic redundancies
// eslint-disable-next-line import/no-cycle
import {
  reportKnowledgeGraphtMutationRelationAddMutation,
  reportKnowledgeGraphtMutationRelationDeleteMutation,
} from '../../analysis/reports/ReportKnowledgeGraph';

const styles = (theme) => ({
  container: {
    padding: '20px 0 20px 0',
  },
  expansionPanel: {
    backgroundColor: '#193E45',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  expansionPanelContent: {
    padding: 0,
  },
  list: {
    width: '100%',
  },
  listItem: {
    width: '100M',
  },
  icon: {
    color: theme.palette.primary.main,
  },
  tooltip: {
    maxWidth: '80%',
    lineHeight: 2,
    padding: 10,
    backgroundColor: '#323232',
  },
});

export const containerAddStixCoreObjectsLinesRelationAddMutation = graphql`
  mutation ContainerAddStixCoreObjectsLinesRelationAddMutation(
    $id: ID!
    $input: StixMetaRelationshipAddInput
  ) {
    containerEdit(id: $id) {
      relationAdd(input: $input) {
        id
        to {
          ... on StixDomainObject {
            ...ContainerStixDomainObjectLine_node
          }
          ... on StixCyberObservable {
            ...ContainerStixCyberObservableLine_node
          }
        }
      }
    }
  }
`;

export const containerAddStixCoreObjectsLinesRelationDeleteMutation = graphql`
  mutation ContainerAddStixCoreObjectsLinesRelationDeleteMutation(
    $id: ID!
    $toId: String!
    $relationship_type: String!
  ) {
    containerEdit(id: $id) {
      relationDelete(toId: $toId, relationship_type: $relationship_type) {
        id
      }
    }
  }
`;

class ContainerAddStixCoreObjectsLinesContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { expandedPanels: {}, addedStixCoreObjects: [] };
  }

  getContainerStixCoreObjectsIds() {
    const { containerStixCoreObjects } = this.props;

    // eslint-disable-next-line no-underscore-dangle
    return map((n) => n.node.__id, containerStixCoreObjects || []);
  }

  toggleStixCoreObject(stixCoreObject) {
    const { containerId, paginationOptions, knowledgeGraph } = this.props;
    const { addedStixCoreObjects } = this.state;
    const containerStixCoreObjectsIds = this.getContainerStixCoreObjectsIds();
    const alreadyAdded = addedStixCoreObjects.includes(stixCoreObject.id)
      || containerStixCoreObjectsIds.includes(stixCoreObject.id);

    if (alreadyAdded) {
      if (knowledgeGraph) {
        commitMutation({
          mutation: reportKnowledgeGraphtMutationRelationDeleteMutation,
          variables: {
            id: containerId,
            toId: stixCoreObject.id,
            relationship_type: 'object',
          },
          onCompleted: () => {
            this.setState({
              addedStixCoreObjects: filter(
                (n) => n !== stixCoreObject.id,
                this.state.addedStixCoreObjects,
              ),
            });
          },
        });
      } else {
        commitMutation({
          mutation: containerAddStixCoreObjectsLinesRelationDeleteMutation,
          variables: {
            id: containerId,
            toId: stixCoreObject.id,
            relationship_type: 'object',
          },
          updater: (store) => {
            const conn = ConnectionHandler.getConnection(
              store.get(containerId),
              'Pagination_objects',
              this.props.paginationOptions,
            );
            ConnectionHandler.deleteNode(conn, stixCoreObject.id);
          },
          onCompleted: () => {
            this.setState({
              addedStixCoreObjects: filter(
                (n) => n !== stixCoreObject.id,
                this.state.addedStixCoreObjects,
              ),
            });
          },
        });
      }
    } else {
      const input = {
        toId: stixCoreObject.id,
        relationship_type: 'object',
      };
      if (knowledgeGraph) {
        commitMutation({
          mutation: reportKnowledgeGraphtMutationRelationAddMutation,
          variables: {
            id: containerId,
            input,
          },
          onCompleted: () => {
            this.setState({
              addedStixCoreObjects: append(
                stixCoreObject.id,
                this.state.addedStixCoreObjects,
              ),
            });
          },
        });
      } else {
        commitMutation({
          mutation: containerAddStixCoreObjectsLinesRelationAddMutation,
          variables: {
            id: containerId,
            input,
          },
          updater: (store) => {
            const payload = store
              .getRootField('containerEdit')
              .getLinkedRecord('relationAdd', { input })
              .getLinkedRecord('to');
            const newEdge = payload.setLinkedRecord(payload, 'node');
            const conn = ConnectionHandler.getConnection(
              store.get(containerId),
              'Pagination_objects',
              paginationOptions,
            );
            ConnectionHandler.insertEdgeBefore(conn, newEdge);
          },
          onCompleted: () => {
            this.setState({
              addedStixCoreObjects: append(
                stixCoreObject.id,
                this.state.addedStixCoreObjects,
              ),
            });
          },
        });
      }
    }
  }

  handleChangePanel(panelKey, event, expanded) {
    this.setState({
      expandedPanels: assoc(panelKey, expanded, this.state.expandedPanels),
    });
  }

  isExpanded(type, numberOfEntities, numberOfTypes) {
    if (this.state.expandedPanels[type] !== undefined) {
      return this.state.expandedPanels[type];
    }
    if (numberOfEntities === 1) {
      return true;
    }
    return numberOfTypes === 1;
  }

  render() {
    const {
      t, classes, data, fd,
    } = this.props;
    const { addedStixCoreObjects } = this.state;
    const stixCoreObjectsNodes = pipe(
      map((n) => n.node),
      filter(
        (n) => n.entity_type !== 'Note'
          && n.entity_type !== 'Opinion'
          && n.entity_type !== 'Report',
      ),
    )(data.stixCoreObjects.edges);
    const byType = groupBy((stixCoreObject) => stixCoreObject.entity_type);
    const stixCoreObjects = byType(stixCoreObjectsNodes);
    const stixCoreObjectsTypes = keys(stixCoreObjects);
    const containerStixCoreObjectsIds = this.getContainerStixCoreObjectsIds();

    return (
      <div className={classes.container}>
        {stixCoreObjectsTypes.length > 0 ? (
          stixCoreObjectsTypes.map((type) => (
            <Accordion
              key={type}
              expanded={this.isExpanded(
                type,
                stixCoreObjects[type].length,
                stixCoreObjectsTypes.length,
              )}
              onChange={this.handleChangePanel.bind(this, type)}
              classes={{ root: classes.expansionPanel }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography className={classes.heading}>
                  {t(`entity_${type}`)}
                </Typography>
                <Typography className={classes.secondaryHeading}>
                  {stixCoreObjects[type].length} {t('entitie(s)')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                classes={{ root: classes.expansionPanelContent }}
              >
                <List classes={{ root: classes.list }}>
                  {stixCoreObjects[type].map((stixCoreObject) => {
                    const alreadyAdded = addedStixCoreObjects.includes(stixCoreObject.id)
                      || containerStixCoreObjectsIds.includes(stixCoreObject.id);
                    return (
                      <ListItem
                        key={stixCoreObject.id}
                        classes={{ root: classes.menuItem }}
                        divider={true}
                        button={true}
                        onClick={this.toggleStixCoreObject.bind(
                          this,
                          stixCoreObject,
                        )}
                      >
                        <ListItemIcon>
                          {alreadyAdded ? (
                            <CheckCircle classes={{ root: classes.icon }} />
                          ) : (
                            <ItemIcon type={type} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            stixCoreObject.name
                            || stixCoreObject.observable_value
                            || stixCoreObject.attribute_abstract
                            || stixCoreObject.opinion
                            || `${fd(stixCoreObject.first_observed)} - ${fd(
                              stixCoreObject.last_observed,
                            )}`
                          }
                          secondary={
                            <Markdown
                              className="markdown"
                              source={truncate(
                                stixCoreObject.description
                                  || fd(stixCoreObject.created_at),
                                200,
                              )}
                            />
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <div style={{ paddingLeft: 20 }}>
            {t('No entities were found for this search.')}
          </div>
        )}
      </div>
    );
  }
}

ContainerAddStixCoreObjectsLinesContainer.propTypes = {
  containerId: PropTypes.string,
  data: PropTypes.object,
  limit: PropTypes.number,
  classes: PropTypes.object,
  t: PropTypes.func,
  fld: PropTypes.func,
  paginationOptions: PropTypes.object,
  knowledgeGraph: PropTypes.bool,
  containerStixCoreObjects: PropTypes.array,
};

export const containerAddStixCoreObjectsLinesQuery = graphql`
  query ContainerAddStixCoreObjectsLinesQuery(
    $types: [String]
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: StixCoreObjectsOrdering
    $orderMode: OrderingMode
  ) {
    ...ContainerAddStixCoreObjectsLines_data
      @arguments(
        types: $types
        search: $search
        count: $count
        cursor: $cursor
        orderBy: $orderBy
        orderMode: $orderMode
      )
  }
`;

const ContainerAddStixCoreObjectsLines = createPaginationContainer(
  ContainerAddStixCoreObjectsLinesContainer,
  {
    data: graphql`
      fragment ContainerAddStixCoreObjectsLines_data on Query
      @argumentDefinitions(
        types: { type: "[String]" }
        search: { type: "String" }
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "ID" }
        orderBy: { type: "StixCoreObjectsOrdering", defaultValue: created_at }
        orderMode: { type: "OrderingMode", defaultValue: asc }
      ) {
        stixCoreObjects(
          types: $types
          search: $search
          first: $count
          after: $cursor
          orderBy: $orderBy
          orderMode: $orderMode
        ) @connection(key: "Pagination_stixCoreObjects") {
          edges {
            node {
              id
              entity_type
              ... on AttackPattern {
                name
                description
              }
              ... on Campaign {
                name
                description
              }
              ... on Note {
                attribute_abstract
              }
              ... on ObservedData {
                first_observed
                last_observed
              }
              ... on Opinion {
                opinion
              }
              ... on Report {
                name
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
              ... on XOpenCTIIncident {
                name
                description
              }
              ... on StixCyberObservable {
                observable_value
                x_opencti_description
              }
            }
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.data && props.data.stixCoreObjects;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        types: fragmentVariables.types,
        count,
        cursor,
        orderBy: fragmentVariables.orderBy,
        orderMode: fragmentVariables.orderMode,
      };
    },
    query: containerAddStixCoreObjectsLinesQuery,
  },
);

export default compose(
  inject18n,
  withStyles(styles),
)(ContainerAddStixCoreObjectsLines);
