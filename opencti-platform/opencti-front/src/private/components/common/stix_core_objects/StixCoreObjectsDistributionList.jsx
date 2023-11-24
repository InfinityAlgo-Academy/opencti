import React from 'react';
import * as R from 'ramda';
import { graphql } from 'react-relay';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Link } from 'react-router-dom';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useTheme } from '@mui/styles';
import { QueryRenderer } from '../../../../relay/environment';
import { useFormatter } from '../../../../components/i18n';
import { resolveLink } from '../../../../utils/Entity';
import ItemIcon from '../../../../components/ItemIcon';
import useGranted, { SETTINGS_SETACCESSES } from '../../../../utils/hooks/useGranted';

const useStyles = makeStyles({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    paddingBottom: 10,
    marginBottom: 10,
  },
  paper: {
    height: '100%',
    margin: '10px 0 0 0',
    padding: 0,
    borderRadius: 6,
  },
  item: {
    height: 50,
    minHeight: 50,
    maxHeight: 50,
    paddingRight: 0,
  },
  itemText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
});

const inlineStyles = {
  itemNumber: {
    float: 'right',
    marginRight: 20,
    fontSize: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const stixCoreObjectsDistributionListDistributionQuery = graphql`
  query StixCoreObjectsDistributionListDistributionQuery(
    $objectId: [String]
    $relationship_type: [String]
    $toTypes: [String]
    $field: String!
    $startDate: DateTime
    $endDate: DateTime
    $dateAttribute: String
    $operation: StatsOperation!
    $limit: Int
    $order: String
    $types: [String]
    $filters: FilterGroup
    $search: String
  ) {
    stixCoreObjectsDistribution(
      objectId: $objectId
      relationship_type: $relationship_type
      toTypes: $toTypes
      field: $field
      startDate: $startDate
      endDate: $endDate
      dateAttribute: $dateAttribute
      operation: $operation
      limit: $limit
      order: $order
      types: $types
      filters: $filters
      search: $search
    ) {
      label
      value
      entity {
        ... on StixObject {
          id
          entity_type
          representative {
            main
          }
        }
        ... on StixRelationship {
          id
          entity_type
          representative {
            main
          }
        }
        ... on Creator {
          id
          entity_type
          representative {
            main
          }
        }
        ... on Label {
          color
        }
        ... on MarkingDefinition {
          x_opencti_color
        }
      }
    }
  }
`;

const StixCoreObjectsDistributionList = ({
  variant,
  height,
  startDate,
  endDate,
  dataSelection,
  parameters = {},
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t, n } = useFormatter();
  const hasSetAccess = useGranted([SETTINGS_SETACCESSES]);
  const renderContent = () => {
    const selection = dataSelection[0];
    let filtersContent = selection.filters?.filters ?? [];
    const dataSelectionTypes = R.head(
      filtersContent.filter((o) => o.key === 'entity_type'),
    )?.values || ['Stix-Core-Object'];
    const dataSelectionObjectId = filtersContent.filter((o) => o.key === 'elementId')?.values || null;
    const dataSelectionRelationshipType = R.head(filtersContent.filter((o) => o.key === 'relationship_type'))
      ?.values || null;
    const dataSelectionToTypes = R.head(filtersContent.filter((o) => o.key === 'toTypes'))?.values || null;
    filtersContent = filtersContent.filter(
      (o) => !['entity_type', 'elementId', 'relationship_type', 'toTypes'].includes(
        o.key,
      ),
    );
    const computeLink = (entry) => {
      const resolution = resolveLink(entry.type);
      if (resolution) {
        // Handle type with no link
        return `${resolution}/${entry.id}`;
      }
      return null;
    };
    return (
      <QueryRenderer
        query={stixCoreObjectsDistributionListDistributionQuery}
        variables={{
          objectId: dataSelectionObjectId,
          relationship_type: dataSelectionRelationshipType,
          toTypes: dataSelectionToTypes,
          types: dataSelectionTypes,
          field: selection.attribute,
          operation: 'count',
          startDate,
          endDate,
          dateAttribute:
            selection.date_attribute && selection.date_attribute.length > 0
              ? selection.date_attribute
              : 'created_at',
          filters: selection.filters ? { ...selection.filters, filters: filtersContent } : undefined,
          limit: selection.number ?? 10,
        }}
        render={({ props }) => {
          if (
            props
            && props.stixCoreObjectsDistribution
            && props.stixCoreObjectsDistribution.length > 0
          ) {
            const data = props.stixCoreObjectsDistribution.map((o) => ({
              label:
                // eslint-disable-next-line no-nested-ternary
                selection.attribute.endsWith('_id')
                  ? o.entity?.representative?.main
                  : selection.attribute === 'entity_type'
                    ? t(`entity_${o.label}`)
                    : o.label,
              value: o.value,
              color: o.entity?.color ?? o.entity?.x_opencti_color,
              id: selection.attribute.endsWith('_id') ? o.entity.id : null,
              type: selection.attribute.endsWith('_id')
                ? o.entity.entity_type
                : o.label,
            }));
            return (
              <div id="container" className={classes.container}>
                <List style={{ marginTop: -10 }}>
                  {data.map((entry) => {
                    // eslint-disable-next-line no-nested-ternary
                    const link = entry.type === 'User' && !hasSetAccess
                      ? null
                      : entry.id
                        ? computeLink(entry)
                        : null;
                    return (
                      <ListItem
                        key={entry.label}
                        dense={true}
                        button={!!link}
                        classes={{ root: classes.item }}
                        divider={true}
                        component={link ? Link : null}
                        to={link || null}
                      >
                        <ListItemIcon>
                          <ItemIcon
                            color={
                              theme.palette.mode === 'light'
                              && entry.color === '#ffffff'
                                ? '#000000'
                                : entry.color
                            }
                            type={entry.type}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <div className={classes.itemText}>
                              {entry.label}
                            </div>
                          }
                        />
                        <div style={inlineStyles.itemNumber}>
                          {n(entry.value)}
                        </div>
                      </ListItem>
                    );
                  })}
                </List>
              </div>
            );
          }
          if (props) {
            return (
              <div style={{ display: 'table', height: '100%', width: '100%' }}>
                <span
                  style={{
                    display: 'table-cell',
                    verticalAlign: 'middle',
                    textAlign: 'center',
                  }}
                >
                  {t('No entities of this type has been found.')}
                </span>
              </div>
            );
          }
          return (
            <div style={{ display: 'table', height: '100%', width: '100%' }}>
              <span
                style={{
                  display: 'table-cell',
                  verticalAlign: 'middle',
                  textAlign: 'center',
                }}
              >
                <CircularProgress size={40} thickness={2} />
              </span>
            </div>
          );
        }}
      />
    );
  };
  return (
    <div style={{ height: height || '100%' }}>
      <Typography
        variant="h4"
        gutterBottom={true}
        style={{
          margin: variant !== 'inLine' ? '0 0 10px 0' : '-10px 0 10px -7px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {parameters.title || t('Distribution of entities')}
      </Typography>
      {variant === 'inLine' ? (
        renderContent()
      ) : (
        <Paper classes={{ root: classes.paper }} variant="outlined">
          {renderContent()}
        </Paper>
      )}
    </div>
  );
};

export default StixCoreObjectsDistributionList;
