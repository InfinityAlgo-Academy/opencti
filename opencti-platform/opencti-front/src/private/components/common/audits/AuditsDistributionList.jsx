/*
Copyright (c) 2021-2023 Filigran SAS

This file is part of the OpenCTI Enterprise Edition ("EE") and is
licensed under the OpenCTI Non-Commercial License (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

https://github.com/OpenCTI-Platform/opencti/blob/master/LICENSE

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*/

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
import { QueryRenderer } from '../../../../relay/environment';
import { useFormatter } from '../../../../components/i18n';
import { convertFilters } from '../../../../utils/ListParameters';
import { defaultValue } from '../../../../utils/Graph';
import { resolveLink } from '../../../../utils/Entity';
import ItemIcon from '../../../../components/ItemIcon';
import useGranted, {
  SETTINGS,
  SETTINGS_SETACCESSES,
} from '../../../../utils/hooks/useGranted';
import useEnterpriseEdition from '../../../../utils/hooks/useEnterpriseEdition';

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

const auditsDistributionListDistributionQuery = graphql`
  query AuditsDistributionListDistributionQuery(
    $field: String!
    $startDate: DateTime
    $endDate: DateTime
    $dateAttribute: String
    $operation: StatsOperation!
    $limit: Int
    $order: String
    $types: [String]
    $filters: [LogsFiltering]
    $filterMode: FilterMode
    $search: String
  ) {
    auditsDistribution(
      field: $field
      startDate: $startDate
      endDate: $endDate
      dateAttribute: $dateAttribute
      operation: $operation
      limit: $limit
      order: $order
      types: $types
      filters: $filters
      filterMode: $filterMode
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
        ... on Task {
          name
        }
        ... on StixCyberObservable {
          observable_value
        }
        ... on MarkingDefinition {
          definition_type
          definition
        }
        ... on Creator {
          entity_type
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
        ... on Group {
          name
        }
      }
    }
  }
`;

const AuditsDistributionList = ({
  variant,
  height,
  startDate,
  endDate,
  dataSelection,
  parameters = {},
}) => {
  const classes = useStyles();
  const { t, n } = useFormatter();
  const hasSetAccess = useGranted([SETTINGS_SETACCESSES]);
  const isGrantedToSettings = useGranted([SETTINGS]);
  const isEnterpriseEdition = useEnterpriseEdition();
  const renderContent = () => {
    if (!isGrantedToSettings || !isEnterpriseEdition) {
      return (
        <div style={{ display: 'table', height: '100%', width: '100%' }}>
          <span
            style={{
              display: 'table-cell',
              verticalAlign: 'middle',
              textAlign: 'center',
            }}
          >
            {!isEnterpriseEdition
              ? t(
                'This feature is only available in OpenCTI Enterprise Edition.',
              )
              : t('You are not authorized to see this data.')}
          </span>
        </div>
      );
    }
    const selection = dataSelection[0];
    let finalFilters = convertFilters(selection.filters);
    const dataSelectionTypes = R.head(
      finalFilters.filter((o) => o.key === 'entity_type'),
    )?.values || ['History', 'Activity'];
    finalFilters = finalFilters.filter((o) => !['entity_type'].includes(o.key));
    return (
      <QueryRenderer
        query={auditsDistributionListDistributionQuery}
        variables={{
          types: dataSelectionTypes,
          field: selection.attribute,
          operation: 'count',
          startDate,
          endDate,
          dateAttribute:
            selection.date_attribute && selection.date_attribute.length > 0
              ? selection.date_attribute
              : 'timestamp',
          filters: finalFilters,
          limit: selection.number ?? 10,
        }}
        render={({ props }) => {
          if (
            props
            && props.auditsDistribution
            && props.auditsDistribution.length > 0
          ) {
            const data = props.auditsDistribution.map((o) => ({
              label:
                // eslint-disable-next-line no-nested-ternary
                selection.attribute.endsWith('.id')
                || selection.attribute.endsWith('_id')
                || selection.attribute.endsWith('_ids')
                  ? defaultValue(o.entity)
                  : selection.attribute === 'entity_type'
                    ? t(`entity_${o.label}`)
                    : o.label,
              value: o.value,
              id:
                selection.attribute.endsWith('.id')
                || selection.attribute.endsWith('_id')
                || selection.attribute.endsWith('_ids')
                  ? o.entity.id
                  : null,
              type:
                selection.attribute.endsWith('.id')
                || selection.attribute.endsWith('_id')
                || selection.attribute.endsWith('_ids')
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
                        ? `${resolveLink(entry.type)}/${entry.id}`
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
                          <ItemIcon type={entry.type} />
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

export default AuditsDistributionList;
