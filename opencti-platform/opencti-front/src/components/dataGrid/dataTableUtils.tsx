import React from 'react';
import Chip from '@mui/material/Chip';
import makeStyles from '@mui/styles/makeStyles';
import StixCoreObjectLabels from '@components/common/stix_core_objects/StixCoreObjectLabels';
import Tooltip from '@mui/material/Tooltip';
import { Link } from 'react-router-dom';
import type { DataTableColumn, DataTableContextProps } from './dataTableTypes';
import { DataTableProps, DataTableVariant } from './dataTableTypes';
import ItemIcon from '../ItemIcon';
import { hexToRGB, itemColor } from '../../utils/Colors';
import ItemMarkings from '../ItemMarkings';
import ItemStatus from '../ItemStatus';
import { emptyFilled, truncate } from '../../utils/String';
import ItemPriority from '../ItemPriority';
import { isNotEmptyField } from '../../utils/utils';
import RatingField from '../fields/RatingField';
import ItemConfidence from '../ItemConfidence';
import ItemPatternType from '../ItemPatternType';
import type { Theme } from '../Theme';
import { getMainRepresentative } from '../../utils/defaultRepresentatives';

export const DataTableContext = React.createContext<DataTableContextProps>({
  parametersWithPadding: false,
  storageKey: '',
  initialValues: {},
  columns: [],
  effectiveColumns: [],
  setColumns: () => {
  },
  resolvePath: () => {
  },
  variant: DataTableVariant.default,
});

const useStyles = makeStyles<Theme>((theme) => ({
  chipInList: {
    fontSize: 12,
    height: 20,
    float: 'left',
    width: 120,
    textTransform: 'uppercase',
    borderRadius: '0',
  },
  chip: {
    fontSize: 13,
    lineHeight: '12px',
    height: 20,
    textTransform: 'uppercase',
    borderRadius: 4,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  chipNoLink: {
    fontSize: 13,
    lineHeight: '12px',
    height: 20,
    textTransform: 'uppercase',
    borderRadius: 4,
  },
  positive: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
    color: '#f44336',
    textTransform: 'uppercase',
    borderRadius: '0',
  },
  negative: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    color: '#4caf50',
    textTransform: 'uppercase',
    borderRadius: '0',
  },
}));

const defaultColumns: DataTableProps['dataColumns'] = {
  analyses: {
    label: 'Analyses',
    flexSize: 8,
    isSortable: false,
    render: ({ id, entity_type, containersNumber }, { n }) => {
      const classes = useStyles();
      const link = `/dashboard/observations/${
        entity_type === 'Artifact' ? 'artifacts' : 'observables'
      }/${id}`;
      const linkAnalyses = `${link}/analyses`;
      return (
        <>
          {[
            'Note',
            'Opinion',
            'Course-Of-Action',
            'Data-Component',
            'Data-Source',
          ].includes(entity_type) ? (
            <Chip
              classes={{ root: classes.chipNoLink }}
              label={n(containersNumber.total)}
            />
            ) : (
              <Chip
                classes={{ root: classes.chip }}
                label={n(containersNumber.total)}
                component={Link}
                to={linkAnalyses}
              />
            )}
        </>
      );
    },
  },
  attribute_abstract: {
    label: 'Abstract',
    flexSize: 25,
    isSortable: true,
    render: ({ attribute_abstract, content }, { column: { size } }) => {
      const data = attribute_abstract || content;
      return (<Tooltip title={data}>{truncate(data, size * 0.113)}</Tooltip>);
    },
  },
  attribute_count: {
    label: 'Nb.',
    flexSize: 4,
    isSortable: true,
    render: ({ attribute_count }) => (<Tooltip title={attribute_count}>{attribute_count}</Tooltip>),
  },
  channel_types: {
    label: 'Types',
    flexSize: 20,
    isSortable: true,
    render: ({ channel_types }, { column: { size } }) => {
      const value = channel_types ? channel_types.join(', ') : '-';
      return (<Tooltip title={value}>{truncate(value, size * 0.113)}</Tooltip>);
    },
  },
  confidence: {
    flexSize: 10,
    label: 'Confidence',
    isSortable: true,
    render: ({ confidence, entity_type }) => (
      <ItemConfidence confidence={confidence} entityType={entity_type} variant="inList" />
    ),
  },
  context: {
    id: 'context',
    label: 'Context',
    flexSize: 10,
    isSortable: true,
    render: ({ context }) => {
      const classes = useStyles();
      return (
        <Chip
          classes={{ root: classes.chipInList }}
          color="primary"
          variant="outlined"
          label={context}
        />
      );
    },
  },
  created: {
    id: 'created',
    label: 'Original creation',
    flexSize: 15,
    isSortable: true,
    render: ({ created }, { fd }) => fd(created),
  },
  created_at: {
    id: 'created_at',
    label: 'Platform creation date',
    flexSize: 15,
    isSortable: true,
    render: ({ created_at }, { fd }) => fd(created_at),
  },
  createdBy: {
    id: 'createdBy',
    label: 'Author',
    flexSize: 12,
    render: ({ createdBy }) => createdBy?.name ?? '-',
  },
  creator: {
    id: 'creator',
    label: 'Creators',
    flexSize: 12,
    render: ({ creators }, { column: { size } }) => {
      const value = isNotEmptyField(creators) ? creators.map((c: { name: string }) => c.name).join(', ') : '-';
      return (<Tooltip title={value}>{truncate(value, size * 0.113)}</Tooltip>);
    },
  },
  entity_type: {
    id: 'entity_type',
    label: 'Type',
    flexSize: 10,
    isSortable: false,
    render: (data, { t_i18n }) => {
      const classes = useStyles();
      return (
        <>
          <ItemIcon type={data.entity_type} />
          <Chip
            classes={{ root: classes.chipInList }}
            style={{
              backgroundColor: hexToRGB(itemColor(data.entity_type), 0.08),
              color: itemColor(data.entity_type),
              border: `1px solid ${itemColor(data.entity_type)}`,
            }}
            label={t_i18n(`entity_${data.entity_type}`)}
          />
        </>
      );
    },
  },
  event_types: {
    label: 'Types',
    flexSize: 20,
    isSortable: true,
    render: ({ event_types }, { column: { size } }) => {
      const value = event_types ? event_types.join(', ') : '-';
      return (<Tooltip title={value}>{truncate(value, size * 0.113)}</Tooltip>);
    },
  },
  external_id: {
    label: 'External ID',
    flexSize: 10,
    isSortable: true,
    render: ({ external_id }, { column: { size } }) => (<Tooltip title={external_id}>{truncate(external_id, size * 0.113)}</Tooltip>),
  },
  first_observed: {
    label: 'First obs.',
    flexSize: 14,
    isSortable: true,
    render: ({ first_observed }, { nsdt }) => nsdt(first_observed),
  },
  first_seen: {
    label: 'First obs.',
    flexSize: 12,
    isSortable: true,
    render: ({ first_seen }, { nsdt }) => nsdt(first_seen),
  },
  fromName: {
    label: 'From name',
    flexSize: 18,
    isSortable: false,
    render: ({ from }, { column: { size }, t_i18n }) => {
      const value = from ? getMainRepresentative(from) : t_i18n('Restricted');
      return (<Tooltip title={value}>{truncate(value, size * 0.113)}</Tooltip>);
    },
  },
  incident_type: {
    label: 'Incident type',
    flexSize: 9,
    isSortable: true,
    render: ({ incident_type }, { t_i18n }) => {
      const classes = useStyles();
      return (
        <Chip
          classes={{ root: classes.chipInList }}
          color="primary"
          variant="outlined"
          label={incident_type || t_i18n('Unknown')}
        />
      );
    },
  },
  infrastructure_types: {
    label: 'Type',
    flexSize: 8,
    isSortable: true,
    render: ({ infrastructure_types }, { t_i18n }) => {
      const classes = useStyles();
      return (
        <Chip
          classes={{ root: classes.chipInList }}
          color="primary"
          variant="outlined"
          label={infrastructure_types?.at(0) ?? t_i18n('Unknown')}
        />
      );
    },
  },
  killChainPhase: {
    label: 'Kill chain phase',
    flexSize: 15,
    isSortable: false,
    render: ({ killChainPhases }) => ((killChainPhases && killChainPhases.length > 0)
      ? `[${killChainPhases[0].kill_chain_name}] ${killChainPhases[0].phase_name}`
      : '-'),
  },
  last_observed: {
    label: 'Last obs.',
    flexSize: 14,
    isSortable: true,
    render: ({ last_observed }, { nsdt }) => nsdt(last_observed),
  },
  last_seen: {
    label: 'Last obs.',
    flexSize: 12,
    isSortable: true,
    render: ({ last_seen }, { nsdt }) => nsdt(last_seen),
  },
  modified: {
    label: 'Modification date',
    flexSize: 15,
    isSortable: true,
    render: ({ modified }, { fd }) => fd(modified),
  },
  name: {
    id: 'name',
    label: 'Name',
    flexSize: 25,
    isSortable: true,
    render: (data, { column: { size } }) => (<Tooltip title={getMainRepresentative(data)}>{truncate(getMainRepresentative(data), size * 0.113)}</Tooltip>),
  },
  note_types: {
    label: 'Type',
    flexSize: 10,
    isSortable: true,
    render: ({ note_types }, { t_i18n }) => {
      const classes = useStyles();
      return (
        <Chip
          classes={{ root: classes.chipInList }}
          color="primary"
          variant="outlined"
          label={note_types?.at(0) ?? t_i18n('Unknown')}
        />
      );
    },
  },
  number_observed: {
    label: 'Nb.',
    flexSize: 8,
    isSortable: true,
    render: ({ number_observed }, { n }) => (<Tooltip title={number_observed}>{n(number_observed)}</Tooltip>),
  },
  objectAssignee: {
    label: 'Assignees',
    flexSize: 10,
    isSortable: false,
    render: ({ objectAssignee }, { column: { size } }) => {
      const value = isNotEmptyField(objectAssignee) ? objectAssignee.map((c: { name: string }) => c.name).join(', ') : '-';
      return (<Tooltip title={value}>{truncate(value, size * 0.113)}</Tooltip>);
    },
  },
  objectLabel: {
    id: 'objectLabel',
    label: 'Labels',
    flexSize: 15,
    isSortable: false,
    render: ({ objectLabel }, { storageHelpers }) => (
      <StixCoreObjectLabels
        variant="inList"
        labels={objectLabel}
        onClick={storageHelpers.handleAddFilter}
      />
    ),
  },
  objectMarking: {
    id: 'objectMarking',
    label: 'Marking',
    flexSize: 8,
    render: ({ objectMarking }, { storageHelpers: { handleAddFilter } }) => (
      <ItemMarkings
        variant="inList"
        markingDefinitions={objectMarking ?? []}
        limit={1}
        handleAddFilter={handleAddFilter}
      />
    ),
  },
  observable_value: {
    label: 'Value',
    flexSize: 20,
    isSortable: false,
    render: ({ observable_value }, { column: { size } }) => (<Tooltip title={observable_value}>{truncate(observable_value, size * 0.113)}</Tooltip>),
  },
  operatingSystem: {
    label: 'Operating System',
    flexSize: 15,
    isSortable: false,
    render: ({ operatingSystem }) => (<Tooltip title={operatingSystem?.name}>{operatingSystem?.name ?? '-'}</Tooltip>),
  },
  pattern_type: {
    label: 'Pattern type',
    flexSize: 10,
    isSortable: true,
    render: ({ pattern_type }) => (<ItemPatternType variant="inList" label={pattern_type} />),
  },
  priority: {
    label: 'Priority',
    flexSize: 10,
    isSortable: true,
    render: ({ priority }, { t_i18n }) => (
      <ItemPriority
        variant="inList"
        priority={priority}
        label={priority || t_i18n('Unknown')}
      />
    ),
  },
  product: {
    label: 'Product',
    flexSize: 15,
    isSortable: true,
    render: ({ product }, { column: { size } }) => (<Tooltip title={product}>{truncate(product, size * 0.113)}</Tooltip>),
  },
  published: {
    label: 'Date',
    flexSize: 10,
    isSortable: true,
    render: ({ published }, { fd }) => fd(published),
  },
  rating: {
    label: 'Rating',
    flexSize: 10,
    isSortable: true,
    render: ({ rating }) => (
      <RatingField
        rating={rating}
        size="tiny"
        readOnly
        style={{ paddingTop: 2 }}
      />
    ),
  },
  relationship_type: {
    label: 'Type',
    flexSize: 10,
    isSortable: true,
    render: ({ relationship_type }, { t_i18n }) => {
      const classes = useStyles();
      return (
        <Chip
          classes={{ root: classes.chipInList }}
          color="primary"
          variant="outlined"
          label={relationship_type ?? t_i18n('Unknown')}
        />
      );
    },
  },
  report_types: {
    label: 'Type',
    flexSize: 10,
    isSortable: true,
    render: ({ report_types }, { t_i18n }) => {
      const classes = useStyles();
      return (
        <Chip
          classes={{ root: classes.chipInList }}
          color="primary"
          variant="outlined"
          label={report_types?.at(0) ?? t_i18n('Unknown')}
        />
      );
    },
  },
  result_name: {
    label: 'Result name',
    flexSize: 15,
    isSortable: true,
    render: ({ result_name }, { column: { size } }) => (<Tooltip title={result_name}>{truncate(result_name, size * 0.113)}</Tooltip>),
  },
  severity: {
    label: 'Severity',
    flexSize: 10,
    isSortable: true,
    render: ({ severity }, { t_i18n }) => (
      <ItemPriority
        variant="inList"
        priority={severity}
        label={severity || t_i18n('Unknown')}
      />
    ),
  },
  source_name: {
    label: 'Source name',
    flexSize: 15,
    isSortable: true,
    render: ({ source_name }, { column: { size } }) => (<Tooltip title={source_name}>{truncate(source_name, size * 0.113)}</Tooltip>),
  },
  start_time: {
    label: 'Start date',
    flexSize: 15,
    isSortable: true,
    render: ({ start_time }, { fd }) => fd(start_time),
  },
  stop_time: {
    label: 'End date',
    flexSize: 15,
    isSortable: true,
    render: ({ stop_time }, { fd }) => fd(stop_time),
  },
  submitted: {
    label: 'Submission date',
    flexSize: 12,
    isSortable: true,
    render: ({ submitted }, { fd }) => fd(submitted),
  },
  toName: {
    label: 'To name',
    flexSize: 18,
    isSortable: false,
    render: ({ to }, { column: { size }, t_i18n }) => {
      const value = to ? getMainRepresentative(to) : t_i18n('Restricted');
      return (<Tooltip title={value}>{truncate(value, size * 0.113)}</Tooltip>);
    },
  },
  url: {
    label: 'URL',
    flexSize: 45,
    isSortable: true,
    render: ({ url }, { column: { size } }) => (<Tooltip title={url}>{truncate(url, size * 0.113)}</Tooltip>),
  },
  value: {
    label: 'Value',
    flexSize: 22,
    isSortable: false,
    render: (node, { column: { size } }) => {
      const value = getMainRepresentative(node);
      return (<Tooltip title={value}>{truncate(value, size * 0.113)}</Tooltip>);
    },
  },
  x_mitre_id: {
    label: 'ID',
    flexSize: 10,
    isSortable: true,
    render: ({ x_mitre_id }) => <code>{emptyFilled(x_mitre_id)}</code>,
  },
  x_opencti_negative: {
    label: 'Qualification',
    flexSize: 15,
    isSortable: true,
    render: ({ x_opencti_negative }, { t_i18n }) => {
      const classes = useStyles();
      return (
        <Chip
          classes={{
            root: x_opencti_negative
              ? classes.negative
              : classes.positive,
          }}
          label={
            x_opencti_negative
              ? t_i18n('False positive')
              : t_i18n('True positive')
          }
        />
      );
    },
  },
  x_opencti_cvss_base_severity: {
    label: 'CVSS3 - Severity',
    flexSize: 15,
    isSortable: true,
    render: ({ x_opencti_cvss_base_severity }) => (<Tooltip title={x_opencti_cvss_base_severity}>{x_opencti_cvss_base_severity}</Tooltip>),
  },
  x_opencti_organization_type: {
    label: 'Type',
    flexSize: 15,
    isSortable: true,
    render: ({ x_opencti_organization_type }) => {
      const classes = useStyles();
      return (
        <Chip
          classes={{ root: classes.chipInList }}
          color="primary"
          variant="outlined"
          label={x_opencti_organization_type ?? 'Unknown'}
        />
      );
    },
  },
  x_opencti_workflow_id: {
    label: 'Status',
    flexSize: 8,
    isSortable: true,
    render: ({ status, workflowEnabled }, { variant }) => (
      <ItemStatus
        status={status}
        variant={variant === DataTableVariant.default ? 'inList' : 'inLine'}
        disabled={!workflowEnabled}
      />
    ),
  },
};

export const defaultColumnsMap = new Map<string, Partial<DataTableColumn>>(Object.entries(defaultColumns));
