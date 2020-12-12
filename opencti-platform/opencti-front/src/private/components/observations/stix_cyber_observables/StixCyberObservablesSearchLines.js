import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import {
  map, keys, groupBy, assoc, compose,
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
import { ExpandMore } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { truncate } from '../../../../utils/String';
import ItemIcon from '../../../../components/ItemIcon';
import inject18n from '../../../../components/i18n';
import StixCoreObjectLabels from '../../common/stix_core_objects/StixCoreObjectLabels';

const styles = (theme) => ({
  container: {
    padding: '0 0 20px 0',
  },
  expansionPanel: {
    backgroundColor: theme.palette.background.paper,
  },
  itemIcon: {
    color: theme.palette.primary.main,
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
});

class StixCyberObservablesContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { expandedPanels: {} };
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
    if (numberOfTypes === 1) {
      return true;
    }
    return false;
  }

  render() {
    const { t, classes, data } = this.props;
    const stixCyberObservablesNodes = map(
      (n) => n.node,
      data.stixCyberObservables.edges,
    );
    const byType = groupBy(
      (stixCyberObservable) => stixCyberObservable.entity_type,
    );
    const stixCyberObservables = byType(stixCyberObservablesNodes);
    const stixCyberObservablesTypes = keys(stixCyberObservables);
    return (
      <div className={classes.container}>
        {stixCyberObservablesTypes.map((type) => (
          <Accordion
            key={type}
            expanded={this.isExpanded(
              type,
              stixCyberObservables[type].length,
              stixCyberObservablesTypes.length,
            )}
            onChange={this.handleChangePanel.bind(this, type)}
            classes={{ root: classes.expansionPanel }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              className={classes.summary}
            >
              <Typography className={classes.heading}>
                {t(`entity_${type}`)}
              </Typography>
              <Typography classes={{ root: classes.secondaryHeading }}>
                {stixCyberObservables[type].length} {t('observable(s)')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails classes={{ root: classes.expansionPanelContent }}>
              <List classes={{ root: classes.list }}>
                {stixCyberObservables[type].map((stixCyberObservable) => (
                  <ListItem
                    key={stixCyberObservable.id}
                    classes={{ root: classes.menuItem }}
                    divider={true}
                    button={true}
                    component={Link}
                    to={`/dashboard/observations/observables/${stixCyberObservable.id}`}
                  >
                    <ListItemIcon classes={{ root: classes.itemIcon }}>
                      <ItemIcon type={type} />
                    </ListItemIcon>
                    <ListItemText
                      primary={stixCyberObservable.observable_value}
                      secondary={truncate(stixCyberObservable.description, 200)}
                    />
                    <ListItemSecondaryAction>
                      <StixCoreObjectLabels
                        labels={stixCyberObservable.objectLabel}
                        variant="inSearch"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    );
  }
}

StixCyberObservablesContainer.propTypes = {
  reportId: PropTypes.string,
  reportObjectRefs: PropTypes.array,
  data: PropTypes.object,
  limit: PropTypes.number,
  classes: PropTypes.object,
  t: PropTypes.func,
  fld: PropTypes.func,
};

export const stixCyberObservablesSearchLinesQuery = graphql`
  query StixCyberObservablesSearchLinesQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: StixCyberObservablesOrdering
    $orderMode: OrderingMode
  ) {
    ...StixCyberObservablesSearchLines_data
      @arguments(
        search: $search
        count: $count
        cursor: $cursor
        orderBy: $orderBy
        orderMode: $orderMode
      )
  }
`;

const StixCyberObservablesSearchLines = createPaginationContainer(
  StixCyberObservablesContainer,
  {
    data: graphql`
      fragment StixCyberObservablesSearchLines_data on Query
      @argumentDefinitions(
        search: { type: "String" }
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "ID" }
        orderBy: {
          type: "StixCyberObservablesOrdering"
          defaultValue: created_at
        }
        orderMode: { type: "OrderingMode", defaultValue: asc }
      ) {
        stixCyberObservables(
          search: $search
          first: $count
          after: $cursor
          orderBy: $orderBy
          orderMode: $orderMode
        ) @connection(key: "Pagination_stixCyberObservables") {
          edges {
            node {
              id
              entity_type
              observable_value
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
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.data && props.data.stixCyberObservables;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        count,
        cursor,
        orderBy: fragmentVariables.orderBy,
        orderMode: fragmentVariables.orderMode,
      };
    },
    query: stixCyberObservablesSearchLinesQuery,
  },
);

export default compose(
  inject18n,
  withStyles(styles),
)(StixCyberObservablesSearchLines);
