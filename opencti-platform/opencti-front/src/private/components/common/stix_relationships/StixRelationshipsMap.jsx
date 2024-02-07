import React from 'react';
import * as R from 'ramda';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { graphql } from 'react-relay';
import makeStyles from '@mui/styles/makeStyles';
import Paper from '@mui/material/Paper';
import { useFormatter } from '../../../../components/i18n';
import LocationMiniMapTargets from '../location/LocationMiniMapTargets';
import { QueryRenderer } from '../../../../relay/environment';
import { computeLevel } from '../../../../utils/Number';
import { buildFiltersAndOptionsForWidgets } from '../../../../utils/filters/filtersUtils';

const useStyles = makeStyles(() => ({
  paper: {
    margin: '10px 0 0 0',
    padding: 0,
    borderRadius: 4,
  },
}));

export const stixRelationshipsMapStixRelationshipsDistributionQuery = graphql`
  query StixRelationshipsMapStixRelationshipsDistributionQuery(
    $field: String!
    $operation: StatsOperation!
    $startDate: DateTime
    $endDate: DateTime
    $dateAttribute: String
    $isTo: Boolean
    $limit: Int
    $fromOrToId: [String]
    $elementWithTargetTypes: [String]
    $fromId: [String]
    $fromRole: String
    $fromTypes: [String]
    $toId: [String]
    $toRole: String
    $toTypes: [String]
    $relationship_type: [String]
    $confidences: [Int]
    $search: String
    $filters: FilterGroup
    $dynamicFrom: FilterGroup
    $dynamicTo: FilterGroup
  ) {
    stixRelationshipsDistribution(
      field: $field
      operation: $operation
      startDate: $startDate
      endDate: $endDate
      dateAttribute: $dateAttribute
      isTo: $isTo
      limit: $limit
      fromOrToId: $fromOrToId
      elementWithTargetTypes: $elementWithTargetTypes
      fromId: $fromId
      fromRole: $fromRole
      fromTypes: $fromTypes
      toId: $toId
      toRole: $toRole
      toTypes: $toTypes
      relationship_type: $relationship_type
      confidences: $confidences
      search: $search
      filters: $filters
      dynamicFrom: $dynamicFrom
      dynamicTo: $dynamicTo
    ) {
      label
      value
      entity {
        ... on BasicObject {
          entity_type
        }
        ... on BasicRelationship {
          entity_type
        }
        ... on Country {
          name
          x_opencti_aliases
          latitude
          longitude
        }
        ... on City {
          name
          x_opencti_aliases
          latitude
          longitude
        }
      }
    }
  }
`;

const StixRelationshipsMap = ({
  title,
  variant,
  height,
  field,
  startDate,
  endDate,
  dateAttribute,
  dataSelection,
  parameters = {},
}) => {
  const classes = useStyles();
  const { t_i18n } = useFormatter();
  const renderContent = () => {
    let selection = {};
    let filtersAndOptions;
    if (dataSelection) {
      // eslint-disable-next-line prefer-destructuring
      selection = dataSelection[0];
      filtersAndOptions = buildFiltersAndOptionsForWidgets(selection.filters);
    }
    const finalField = selection.attribute || field || 'entity_type';
    const variables = {
      field: finalField,
      operation: 'count',
      startDate,
      endDate,
      dateAttribute,
      limit: selection.number ?? 10,
      filters: filtersAndOptions?.filters,
      isTo: selection.isTo,
      dynamicFrom: selection.dynamicFrom,
      dynamicTo: selection.dynamicTo,
    };
    return (
      <QueryRenderer
        query={stixRelationshipsMapStixRelationshipsDistributionQuery}
        variables={variables}
        render={({ props }) => {
          if (
            props
            && props.stixRelationshipsDistribution
            && props.stixRelationshipsDistribution.length > 0
          ) {
            const values = R.pluck(
              'value',
              props.stixRelationshipsDistribution,
            );
            const countries = R.map(
              (x) => R.assoc(
                'level',
                computeLevel(x.value, R.last(values), R.head(values) + 1),
                x.entity,
              ),
              R.filter(
                (n) => n.entity?.entity_type === 'Country',
                props.stixRelationshipsDistribution,
              ),
            );
            const cities = R.map(
              (x) => x.entity,
              R.filter(
                (n) => n.entity?.entity_type === 'City',
                props.stixRelationshipsDistribution,
              ),
            );
            return (
              <LocationMiniMapTargets
                center={[selection.centerLat ?? 48.8566969, selection.centerLng ?? 2.3514616]}
                countries={countries}
                cities={cities}
                zoom={selection.zoom ?? 2}
              />
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
                  {t_i18n('No entities of this type has been found.')}
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
        {parameters.title || title || t_i18n('Relationships distribution')}
      </Typography>
      {variant !== 'inLine' ? (
        <Paper classes={{ root: classes.paper }} variant="outlined">
          {renderContent()}
        </Paper>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default StixRelationshipsMap;
