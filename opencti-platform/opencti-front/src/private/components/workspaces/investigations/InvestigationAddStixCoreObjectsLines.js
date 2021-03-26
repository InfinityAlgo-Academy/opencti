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
import Markdown from 'react-markdown';
import { commitMutation } from '../../../../relay/environment';
import { truncate } from '../../../../utils/String';
import ItemIcon from '../../../../components/ItemIcon';
import inject18n from '../../../../components/i18n';

const styles = (theme) => ({
  investigation: {
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

export const investigationAddStixCoreObjectsLinesRelationAddMutation = graphql`
  mutation InvestigationAddStixCoreObjectsLinesRelationAddMutation(
    $id: ID!
    $input: StixMetaRelationshipAddInput
  ) {
    workspaceEdit(id: $id) {
      relationAdd(input: $input) {
        id
        to {
          ... on BasicObject {
            id
            entity_type
            parent_types
          }
          ... on BasicRelationship {
            id
            entity_type
            parent_types
          }
        }
      }
    }
  }
`;

export const investigationAddStixCoreObjectsLinesRelationDeleteMutation = graphql`
  mutation InvestigationAddStixCoreObjectsLinesRelationDeleteMutation(
    $id: ID!
    $toId: String!
    $relationship_type: String!
  ) {
    workspaceEdit(id: $id) {
      relationDelete(toId: $toId, relationship_type: $relationship_type) {
        id
      }
    }
  }
`;

class InvestigationAddStixCoreObjectsLinesInvestigation extends Component {
  constructor(props) {
    super(props);
    this.state = { expandedPanels: {}, addedStixCoreObjects: [] };
  }

  getWorkspaceStixCoreObjectsIds() {
    const { workspaceStixCoreObjects } = this.props;
    // eslint-disable-next-line no-underscore-dangle
    return map((n) => n.node.__id, workspaceStixCoreObjects || []);
  }

  toggleStixCoreObject(stixCoreObject) {
    const { workspaceId, onAdd, onDelete } = this.props;
    const { addedStixCoreObjects } = this.state;
    const workspaceStixCoreObjectsIds = this.getWorkspaceStixCoreObjectsIds();
    const alreadyAdded = addedStixCoreObjects.includes(stixCoreObject.id)
      || workspaceStixCoreObjectsIds.includes(stixCoreObject.id);
    if (alreadyAdded) {
      commitMutation({
        mutation: investigationAddStixCoreObjectsLinesRelationDeleteMutation,
        variables: {
          id: workspaceId,
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
          if (typeof onDelete === 'function') {
            onDelete(stixCoreObject);
          }
        },
      });
    } else {
      const input = {
        toId: stixCoreObject.id,
        relationship_type: 'object',
      };
      commitMutation({
        mutation: investigationAddStixCoreObjectsLinesRelationAddMutation,
        variables: {
          id: workspaceId,
          input,
        },
        onCompleted: () => {
          this.setState({
            addedStixCoreObjects: append(
              stixCoreObject.id,
              this.state.addedStixCoreObjects,
            ),
          });
          if (typeof onAdd === 'function') {
            onAdd(stixCoreObject);
          }
        },
      });
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
    const stixCoreObjectsNodes = map((n) => n.node, data.stixCoreObjects.edges);
    const byType = groupBy((stixCoreObject) => stixCoreObject.entity_type);
    const stixCoreObjects = byType(stixCoreObjectsNodes);
    const stixCoreObjectsTypes = keys(stixCoreObjects);
    const workspaceStixCoreObjectsIds = this.getWorkspaceStixCoreObjectsIds();
    return (
      <div className={classes.investigation}>
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
                      || workspaceStixCoreObjectsIds.includes(stixCoreObject.id);
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

InvestigationAddStixCoreObjectsLinesInvestigation.propTypes = {
  workspaceId: PropTypes.string,
  data: PropTypes.object,
  limit: PropTypes.number,
  classes: PropTypes.object,
  t: PropTypes.func,
  fld: PropTypes.func,
  paginationOptions: PropTypes.object,
  workspaceStixCoreObjects: PropTypes.array,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
};

export const investigationAddStixCoreObjectsLinesQuery = graphql`
  query InvestigationAddStixCoreObjectsLinesQuery(
    $types: [String]
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: StixCoreObjectsOrdering
    $orderMode: OrderingMode
  ) {
    ...InvestigationAddStixCoreObjectsLines_data
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

const InvestigationAddStixCoreObjectsLines = createPaginationContainer(
  InvestigationAddStixCoreObjectsLinesInvestigation,
  {
    data: graphql`
      fragment InvestigationAddStixCoreObjectsLines_data on Query
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
              parent_types
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
                  }
                }
              }
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
    query: investigationAddStixCoreObjectsLinesQuery,
  },
);

export default compose(
  inject18n,
  withStyles(styles),
)(InvestigationAddStixCoreObjectsLines);
