import React from 'react';
import { graphql } from 'react-relay';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { useTheme } from '@mui/styles';
import * as R from 'ramda';
import { useNavigate } from 'react-router-dom-v5-compat';
import Chart from '../charts/Chart';
import { QueryRenderer } from '../../../../relay/environment';
import { useFormatter } from '../../../../components/i18n';
import { horizontalBarsChartOptions } from '../../../../utils/Charts';
import { simpleNumberFormat } from '../../../../utils/Number';
import { defaultValue } from '../../../../utils/Graph';
import { itemColor } from '../../../../utils/Colors';

const useStyles = makeStyles(() => ({
  paper: {
    height: '100%',
    margin: '10px 0 0 0',
    padding: 0,
    borderRadius: 6,
  },
}));

const stixCoreObjectsMultiHorizontalBarsDistributionQuery = graphql`
  query StixCoreObjectsMultiHorizontalBarsDistributionQuery(
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
    $subDistributionRelationshipType: [String]
    $subDistributionToTypes: [String]
    $subDistributionField: String!
    $subDistributionStartDate: DateTime
    $subDistributionEndDate: DateTime
    $subDistributionDateAttribute: String
    $subDistributionOperation: StatsOperation!
    $subDistributionLimit: Int
    $subDistributionOrder: String
    $subDistributionTypes: [String]
    $subDistributionFilters: FilterGroup
    $subDistributionSearch: String
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
        ... on BasicObject {
          entity_type
          id
        }
        ... on BasicRelationship {
          entity_type
          id
        }
        ... on StixCoreObject {
          stixCoreObjectsDistribution(
            relationship_type: $subDistributionRelationshipType
            toTypes: $subDistributionToTypes
            field: $subDistributionField
            startDate: $subDistributionStartDate
            endDate: $subDistributionEndDate
            dateAttribute: $subDistributionDateAttribute
            operation: $subDistributionOperation
            limit: $subDistributionLimit
            order: $subDistributionOrder
            types: $subDistributionTypes
            filters: $subDistributionFilters
            search: $subDistributionSearch
          ) {
            label
            value
            entity {
              ... on BasicObject {
                entity_type
                id
              }
              ... on AttackPattern {
                name
                description
              }
              ... on Campaign {
                name
                description
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
              ... on System {
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
              ... on MalwareAnalysis {
                result_name
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
              ... on Incident {
                name
                description
              }
              ... on Event {
                name
                description
              }
              ... on Channel {
                name
                description
              }
              ... on Narrative {
                name
                description
              }
              ... on Language {
                name
              }
              ... on DataComponent {
                name
                description
              }
              ... on DataSource {
                name
                description
              }
              ... on Case {
                name
                description
              }
              ... on StixCyberObservable {
                observable_value
              }
              ... on MarkingDefinition {
                definition_type
                definition
              }
              ... on Report {
                name
              }
              ... on Grouping {
                name
              }
              ... on Note {
                attribute_abstract
                content
              }
              ... on Opinion {
                opinion
              }
              ... on Label {
                value
              }
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
        ... on System {
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
        ... on AdministrativeArea {
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
        ... on MalwareAnalysis {
          result_name
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
        ... on Incident {
          name
          description
        }
        ... on Event {
          name
          description
        }
        ... on Channel {
          name
          description
        }
        ... on Narrative {
          name
          description
        }
        ... on Language {
          name
        }
        ... on DataComponent {
          name
        }
        ... on DataSource {
          name
        }
        ... on Case {
          name
        }
        ... on StixCyberObservable {
          observable_value
        }
        ... on MarkingDefinition {
          definition_type
          definition
          x_opencti_color
        }
        ... on Creator {
          name
        }
        ... on Report {
          name
        }
        ... on Grouping {
          name
        }
        ... on Note {
          attribute_abstract
          content
        }
        ... on Opinion {
          opinion
        }
        ... on Label {
          value
          color
        }
      }
    }
  }
`;

const stixCoreObjectsMultiHorizontalBars = ({
  variant,
  height,
  startDate,
  endDate,
  dataSelection,
  parameters = {},
  withExportPopover = false,
  isReadOnly = false,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useFormatter();
  const navigate = useNavigate();
  const renderContent = () => {
    const selection = dataSelection[0];
    let filtersContent = selection.filters?.filters ?? [];
    const dataSelectionTypes = R.head(
      filtersContent.filter((n) => n.key === 'entity_type'),
    )?.values || ['Stix-Core-Object'];
    const dataSelectionObjectId = filtersContent.filter((n) => n.key === 'elementId')?.values || null;
    const dataSelectionRelationshipType = R.head(filtersContent.filter((n) => n.key === 'relationship_type'))
      ?.values || null;
    const dataSelectionToTypes = R.head(filtersContent.filter((n) => n.key === 'toTypes'))?.values || null;
    filtersContent = filtersContent.filter(
      (n) => !['entity_type', 'elementId', 'relationship_type', 'toTypes'].includes(
        n.key,
      ),
    );
    const subSelection = dataSelection[1];
    let subSelectionFiltersContent = subSelection.filters.filters;
    const subSelectionDataSelectionTypes = R.head(
      subSelectionFiltersContent.filter((n) => n.key === 'entity_type'),
    )?.values || ['Stix-Core-Object'];
    const subSelectionDataSelectionRelationshipType = R.head(
      subSelectionFiltersContent.filter((n) => n.key === 'relationship_type'),
    )?.values || null;
    const subSelectionDataSelectionToTypes = R.head(subSelectionFiltersContent.filter((n) => n.key === 'toTypes'))
      ?.values || null;
    subSelectionFiltersContent = subSelectionFiltersContent.filter(
      (n) => !['entity_type', 'elementId', 'relationship_type', 'toTypes'].includes(
        n.key,
      ),
    );
    return (
      <QueryRenderer
        query={stixCoreObjectsMultiHorizontalBarsDistributionQuery}
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
          subDistributionRelationshipType:
            subSelectionDataSelectionRelationshipType,
          subDistributionToTypes: subSelectionDataSelectionToTypes,
          subDistributionField: subSelection.attribute,
          subDistributionStartDate: startDate,
          subDistributionEndDate: endDate,
          subDistributionDateAttribute:
            subSelection.date_attribute
            && subSelection.date_attribute.length > 0
              ? subSelection.date_attribute
              : 'created_at',
          subDistributionOperation: 'count',
          subDistributionLimit: subSelection.number ?? 10,
          subDistributionTypes: subSelectionDataSelectionTypes,
          subDistributionFilters: { ...subSelection.filters, filters: subSelectionFiltersContent },
        }}
        render={({ props }) => {
          if (
            props
            && props.stixCoreObjectsDistribution
            && props.stixCoreObjectsDistribution.length > 0
          ) {
            const data = props.stixCoreObjectsDistribution.map((n) => {
              let color = selection.attribute.endsWith('_id')
                ? itemColor(n.entity.entity_type)
                : itemColor(n.label);
              if (n.entity?.color) {
                color = theme.palette.mode === 'light' && n.entity.color === '#ffffff'
                  ? '#000000'
                  : n.entity.color;
              }
              if (n.entity?.x_opencti_color) {
                color = theme.palette.mode === 'light'
                  && n.entity.x_opencti_color === '#ffffff'
                  ? '#000000'
                  : n.entity.x_opencti_color;
              }
              return {
                x:
                  // eslint-disable-next-line no-nested-ternary
                  selection.attribute.endsWith('_id')
                    ? defaultValue(n.entity)
                    : selection.attribute === 'entity_type'
                      ? t(`entity_${n.label}`)
                      : n.label,
                y: n.value,
                fillColor: color,
              };
            });
            const chartData = [
              {
                name: selection.label || t('Number of relationships'),
                data,
              },
            ];
            const redirectionUtils = selection.attribute === 'name'
              ? props.stixCoreObjectsDistribution.map((n) => ({
                id: n.entity.id,
                entity_type: n.entity.entity_type,
              }))
              : null;
            return (
              <Chart
                options={horizontalBarsChartOptions(
                  theme,
                  true,
                  simpleNumberFormat,
                  null,
                  parameters.distributed,
                  navigate,
                  redirectionUtils,
                )}
                series={chartData}
                type="bar"
                width="100%"
                height="100%"
                withExportPopover={withExportPopover}
                isReadOnly={isReadOnly}
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

export default stixCoreObjectsMultiHorizontalBars;
