import React from 'react';
import { graphql } from 'react-relay';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import * as R from 'ramda';
import { QueryRenderer } from '../../../../relay/environment';
import { useFormatter } from '../../../../components/i18n';
import ItemNumberDifference from '../../../../components/ItemNumberDifference';
import { dayAgo } from '../../../../utils/Time';

const useStyles = makeStyles({
  paper: {
    minHeight: 280,
    height: '100%',
    margin: '4px 0 0 0',
    padding: '0 0 10px 0',
    borderRadius: 6,
  },
  number: {
    float: 'left',
    fontSize: 40,
  },
});

const stixCoreObjectsNumberNumberQuery = graphql`
  query StixCoreObjectsNumberNumberSeriesQuery(
    $types: [String]
    $startDate: DateTime
    $endDate: DateTime
    $onlyInferred: Boolean
    $filters: FilterGroup
    $search: String
    $relationship_type: [String]
    $elementId: [String]
  ) {
    stixCoreObjectsNumber(
      types: $types
      startDate: $startDate
      endDate: $endDate
      onlyInferred: $onlyInferred
      filters: $filters
      search: $search
      relationship_type: $relationship_type
      elementId: $elementId
    ) {
      total
      count
    }
  }
`;

const StixCoreObjectsNumber = ({
  variant,
  height,
  startDate,
  endDate,
  dataSelection,
  parameters = {},
}) => {
  const classes = useStyles();
  const { t, n } = useFormatter();
  const renderContent = () => {
    const selection = dataSelection[0];
    let filtersContent = selection.filters?.filters ?? [];
    const dataSelectionTypes = R.head(
      filtersContent.filter((o) => o.key === 'entity_type'),
    )?.values || ['Stix-Core-Object'];
    const dataSelectionElementId = R.head(filtersContent.filter((o) => o.key === 'elementId'))?.values || null;
    const dataSelectionRelationshipType = R.head(filtersContent.filter((o) => o.key === 'relationship_type'))
      ?.values || null;
    filtersContent = filtersContent.filter(
      (o) => !['entity_type', 'elementId', 'relationship_type'].includes(o.key),
    );
    const dateAttribute = selection.date_attribute && selection.date_attribute.length > 0
      ? selection.date_attribute
      : 'created_at';
    if (startDate) {
      filtersContent.push({
        key: dateAttribute,
        values: [startDate],
        operator: 'gt',
      });
    }
    if (endDate) {
      filtersContent.push({
        key: dateAttribute,
        values: [endDate],
        operator: 'lt',
      });
    }
    return (
      <QueryRenderer
        query={stixCoreObjectsNumberNumberQuery}
        variables={{
          types: dataSelectionTypes,
          first: selection.number ?? 10,
          orderBy: dateAttribute,
          orderMode: 'desc',
          filters: selection.filters ? { ...selection.filters, filters: filtersContent } : undefined,
          elementId: dataSelectionElementId,
          relationship_type: dataSelectionRelationshipType,
          startDate,
          endDate: dayAgo(),
        }}
        render={({ props }) => {
          if (props && props.stixCoreObjectsNumber) {
            const { total } = props.stixCoreObjectsNumber;
            const difference = total - props.stixCoreObjectsNumber.count;
            return (
              <div>
                <div className={classes.number}>{n(total)}</div>
                <ItemNumberDifference
                  difference={difference}
                  description={t('24 hours')}
                />
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
        {parameters.title ?? t('Entities number')}
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

export default StixCoreObjectsNumber;
