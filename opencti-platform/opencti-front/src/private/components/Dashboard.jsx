import { DescriptionOutlined } from '@mui/icons-material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Slide from '@mui/material/Slide';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { makeStyles, useTheme } from '@mui/styles';
import {
  Database,
  GraphOutline,
  HexagonMultipleOutline,
} from 'mdi-material-ui';
import { assoc, head, last, map, pathOr, pluck } from 'ramda';
import React, { Suspense } from 'react';
import { graphql, useFragment, usePreloadedQuery } from 'react-relay';
import { Link } from 'react-router-dom';
import { useFormatter } from '../../components/i18n';
import ItemIcon from '../../components/ItemIcon';
import ItemMarkings from '../../components/ItemMarkings';
import ItemNumberDifference from '../../components/ItemNumberDifference';
import Loader, { LoaderVariant } from '../../components/Loader';
import { areaChartOptions, polarAreaChartOptions } from '../../utils/Charts';
import { hexToRGB } from '../../utils/Colors';
import { resolveLink } from '../../utils/Entity';
import { defaultValue } from '../../utils/Graph';
import useAuth, { UserContext } from '../../utils/hooks/useAuth';
import { EXPLORE, KNOWLEDGE } from '../../utils/hooks/useGranted';
import { usePaginationLocalStorage } from '../../utils/hooks/useLocalStorage';
import { computeLevel, simpleNumberFormat } from '../../utils/Number';
import Security from '../../utils/Security';
import { truncate } from '../../utils/String';
import { dayAgo, monthsAgo, yearsAgo } from '../../utils/Time';
import Chart from './common/charts/Chart';
import LocationMiniMapTargets from './common/location/LocationMiniMapTargets';
import StixRelationshipsHorizontalBars from './common/stix_relationships/StixRelationshipsHorizontalBars';
import DashboardView from './workspaces/dashboards/Dashboard';
import useQueryLoading from '../../utils/hooks/useQueryLoading';

// region styles
const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  card: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 6,
    position: 'relative',
  },
  paper: {
    margin: '10px 0 0 0',
    padding: 0,
    overflow: 'hidden',
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
    paddingRight: 24,
  },
  number: {
    marginTop: 10,
    float: 'left',
    fontSize: 30,
  },
  title: {
    marginTop: 5,
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
  icon: {
    position: 'absolute',
    color: theme.palette.primary.main,
    top: 35,
    right: 20,
  },
  graphContainer: {
    width: '100%',
    padding: 0,
    overflow: 'hidden',
  },
  labelsCloud: {
    width: '100%',
    height: 300,
  },
  label: {
    width: '100%',
    height: 100,
    padding: 15,
  },
  labelNumber: {
    fontSize: '1.6rem',
    fontWeight: 500,
  },
  labelValue: {
    fontSize: 15,
  },
  itemAuthor: {
    width: 160,
    minWidth: 160,
    maxWidth: 160,
    paddingRight: 24,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'left',
  },
  itemCreator: {
    width: 160,
    minWidth: 160,
    maxWidth: 160,
    paddingRight: 24,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'left',
  },
  itemType: {
    width: 150,
    minWidth: 150,
    maxWidth: 150,
    paddingRight: 24,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'left',
  },
  itemDate: {
    width: 120,
    minWidth: 120,
    maxWidth: 120,
    paddingRight: 24,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'left',
  },
  chipInList: {
    fontSize: 12,
    height: 20,
    float: 'left',
    width: 120,
  },
}));
// endregion

// region inner components
const NoTableElement = () => {
  const { t } = useFormatter();
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
};

// TotalEntitiesCard
const dashboardStixDomainObjectsNumberQuery = graphql`
  query DashboardStixDomainObjectsNumberQuery(
    $types: [String]
    $endDate: DateTime
  ) {
    stixDomainObjectsNumber(types: $types, endDate: $endDate) {
      total
      count
    }
  }
`;
const TotalEntitiesCardComponent = ({ title, Icon, queryRef }) => {
  const classes = useStyles();
  const { t, n } = useFormatter();
  const data = usePreloadedQuery(
    dashboardStixDomainObjectsNumberQuery,
    queryRef,
  );
  const { total } = data.stixDomainObjectsNumber;
  const difference = total - data.stixDomainObjectsNumber.count;
  return (
    <CardContent>
      <div className={classes.title}>{t(title)}</div>
      <div className={classes.number}>{n(total)}</div>
      <ItemNumberDifference
        difference={difference}
        description={t('24 hours')}
      />
      <div className={classes.icon}>
        <Icon color="inherit" fontSize="large" />
      </div>
    </CardContent>
  );
};
const TotalEntitiesCard = ({ title, options, Icon }) => {
  const queryRef = useQueryLoading(
    dashboardStixDomainObjectsNumberQuery,
    options,
  );
  return (
    <>
      {queryRef && (
        <React.Suspense fallback={<Loader variant={LoaderVariant.inElement} />}>
          <TotalEntitiesCardComponent
            queryRef={queryRef}
            title={title}
            Icon={Icon}
          />
        </React.Suspense>
      )}
    </>
  );
};

// TotalRelationshipsCard
const dashboardStixCoreRelationshipsNumberQuery = graphql`
  query DashboardStixCoreRelationshipsNumberQuery(
    $relationship_type: [String]
    $endDate: DateTime
  ) {
    stixCoreRelationshipsNumber(
      relationship_type: $relationship_type
      endDate: $endDate
    ) {
      total
      count
    }
  }
`;
const TotalRelationshipsCardComponent = ({ title, Icon, queryRef }) => {
  const classes = useStyles();
  const { t, n } = useFormatter();
  const data = usePreloadedQuery(
    dashboardStixCoreRelationshipsNumberQuery,
    queryRef,
  );
  const { total } = data.stixCoreRelationshipsNumber;
  const difference = total - data.stixCoreRelationshipsNumber.count;
  return (
    <CardContent>
      <div className={classes.title}>{t(title)}</div>
      <div className={classes.number}>{n(total)}</div>
      <ItemNumberDifference
        difference={difference}
        description={t('24 hours')}
      />
      <div className={classes.icon}>
        <Icon color="inherit" fontSize="large" />
      </div>
    </CardContent>
  );
};
const TotalRelationshipsCard = ({ title, options, Icon }) => {
  const queryRef = useQueryLoading(
    dashboardStixCoreRelationshipsNumberQuery,
    options,
  );
  return (
    <>
      {queryRef && (
        <React.Suspense fallback={<Loader variant={LoaderVariant.inElement} />}>
          <TotalRelationshipsCardComponent
            queryRef={queryRef}
            title={title}
            Icon={Icon}
          />
        </React.Suspense>
      )}
    </>
  );
};

// TotalObservablesCard
const dashboardStixCyberObservablesNumberQuery = graphql`
  query DashboardStixCyberObservablesNumberQuery(
    $types: [String]
    $endDate: DateTime
  ) {
    stixCyberObservablesNumber(types: $types, endDate: $endDate) {
      total
      count
    }
  }
`;
const TotalObservablesCardComponent = ({ title, Icon, queryRef }) => {
  const classes = useStyles();
  const { t, n } = useFormatter();
  const data = usePreloadedQuery(
    dashboardStixCyberObservablesNumberQuery,
    queryRef,
  );
  const { total } = data.stixCyberObservablesNumber;
  const difference = total - data.stixCyberObservablesNumber.count;
  return (
    <CardContent>
      <div className={classes.title}>{t(title)}</div>
      <div className={classes.number}>{n(total)}</div>
      <ItemNumberDifference
        difference={difference}
        description={t('24 hours')}
      />
      <div className={classes.icon}>
        <Icon color="inherit" fontSize="large" />
      </div>
    </CardContent>
  );
};
const TotalObservablesCard = ({ title, options, Icon }) => {
  const queryRef = useQueryLoading(
    dashboardStixCyberObservablesNumberQuery,
    options,
  );
  return (
    <>
      {queryRef && (
        <React.Suspense fallback={<Loader variant={LoaderVariant.inElement} />}>
          <TotalObservablesCardComponent
            queryRef={queryRef}
            title={title}
            Icon={Icon}
          />
        </React.Suspense>
      )}
    </>
  );
};

// TopLabelsCard
const dashboardStixRefRelationshipsDistributionQuery = graphql`
  query DashboardStixRefRelationshipsDistributionQuery(
    $field: String!
    $operation: StatsOperation!
    $relationship_type: [String]
    $isTo: Boolean
    $toRole: String
    $toTypes: [String]
    $startDate: DateTime
    $endDate: DateTime
    $dateAttribute: String
    $limit: Int
  ) {
    stixRefRelationshipsDistribution(
      field: $field
      operation: $operation
      relationship_type: $relationship_type
      isTo: $isTo
      toRole: $toRole
      toTypes: $toTypes
      startDate: $startDate
      endDate: $endDate
      dateAttribute: $dateAttribute
      limit: $limit
    ) {
      label
      value
      entity {
        ... on BasicObject {
          entity_type
        }
        ... on Label {
          value
          color
        }
      }
    }
  }
`;
const TopLabelsCardCardComponent = ({ classes, queryRef }) => {
  const { n } = useFormatter();
  const data = usePreloadedQuery(
    dashboardStixRefRelationshipsDistributionQuery,
    queryRef,
  );
  const distribution = data.stixRefRelationshipsDistribution;
  if (distribution.length === 0) {
    return <NoTableElement />;
  }
  return (
    <div className={classes.labelsCloud}>
      <Grid container={true} spacing={0}>
        {distribution.map((line) => (
          <Grid key={line.label} item={true} xs={4} style={{ padding: 0 }}>
            <div
              className={classes.label}
              style={{
                color: line.entity.color,
                backgroundColor: hexToRGB(line.entity.color, 0.3),
              }}
            >
              <div className={classes.labelNumber}>{n(line.value)}</div>
              <div className={classes.labelValue}>
                {truncate(line.entity.value, 15)}
              </div>
            </div>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};
const TopLabelsCard = ({ classes }) => {
  const queryOptions = {
    field: 'internal_id',
    operation: 'count',
    relationship_type: 'object-label',
    isTo: true,
    toRole: 'object-label_to',
    toTypes: ['Label'],
    startDate: monthsAgo(3),
    limit: 9,
  };
  const queryRef = useQueryLoading(
    dashboardStixRefRelationshipsDistributionQuery,
    queryOptions,
  );
  return (
    <>
      {queryRef && (
        <React.Suspense fallback={<Loader variant={LoaderVariant.inElement} />}>
          <TopLabelsCardCardComponent queryRef={queryRef} classes={classes} />
        </React.Suspense>
      )}
    </>
  );
};

// IngestedEntitiesGraph
const dashboardStixDomainObjectsTimeSeriesQuery = graphql`
  query DashboardStixDomainObjectsTimeSeriesQuery(
    $field: String!
    $operation: StatsOperation!
    $startDate: DateTime!
    $endDate: DateTime
    $interval: String!
  ) {
    stixDomainObjectsTimeSeries(
      field: $field
      operation: $operation
      startDate: $startDate
      endDate: $endDate
      interval: $interval
    ) {
      date
      value
    }
  }
`;
const IngestedEntitiesGraphComponent = ({ queryRef }) => {
  const classes = useStyles();
  const theme = useTheme();
  const { md, t } = useFormatter();
  const data = usePreloadedQuery(
    dashboardStixDomainObjectsTimeSeriesQuery,
    queryRef,
  );
  const chartData = data.stixDomainObjectsTimeSeries.map((entry) => {
    const date = new Date(entry.date);
    date.setDate(date.getDate() + 15);
    return {
      x: date,
      y: entry.value,
    };
  });
  return (
    <div className={classes.graphContainer}>
      <Chart
        options={areaChartOptions(
          theme,
          true,
          md,
          simpleNumberFormat,
          'dataPoints',
        )}
        series={[
          {
            name: t('Ingested entities'),
            data: chartData,
          },
        ]}
        type="area"
        width="100%"
        height={280}
      />
    </div>
  );
};
const IngestedEntitiesGraph = () => {
  const queryOptions = {
    field: 'created_at',
    operation: 'count',
    startDate: yearsAgo(1),
    interval: 'month',
  };
  const queryRef = useQueryLoading(
    dashboardStixDomainObjectsTimeSeriesQuery,
    queryOptions,
  );
  return (
    <>
      {queryRef && (
        <React.Suspense fallback={<Loader variant={LoaderVariant.inElement} />}>
          <IngestedEntitiesGraphComponent queryRef={queryRef} />
        </React.Suspense>
      )}
    </>
  );
};

// TargetedCountries
const dashboardStixCoreRelationshipsDistributionQuery = graphql`
  query DashboardStixCoreRelationshipsDistributionQuery(
    $field: String!
    $operation: StatsOperation!
    $relationship_type: [String]
    $isTo: Boolean
    $toRole: String
    $toTypes: [String]
    $startDate: DateTime
    $endDate: DateTime
    $dateAttribute: String
    $limit: Int
  ) {
    stixCoreRelationshipsDistribution(
      field: $field
      operation: $operation
      relationship_type: $relationship_type
      isTo: $isTo
      toRole: $toRole
      toTypes: $toTypes
      startDate: $startDate
      endDate: $endDate
      dateAttribute: $dateAttribute
      limit: $limit
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
      }
    }
  }
`;
const TargetedCountriesComponent = ({ queryRef }) => {
  const data = usePreloadedQuery(
    dashboardStixCoreRelationshipsDistributionQuery,
    queryRef,
  );
  const values = pluck('value', data.stixCoreRelationshipsDistribution);
  const countries = map(
    (x) => assoc(
      'level',
      computeLevel(x.value, last(values), head(values) + 1),
      x.entity,
    ),
    data.stixCoreRelationshipsDistribution,
  );
  return (
    <LocationMiniMapTargets
      center={[48.8566969, 2.3514616]}
      countries={countries}
      zoom={2}
    />
  );
};
const TargetedCountries = ({ timeField }) => {
  const queryOptions = {
    field: 'internal_id',
    operation: 'count',
    relationship_type: 'targets',
    isTo: true,
    toRole: 'targets_to',
    toTypes: ['Country'],
    startDate: monthsAgo(3),
    dateAttribute: timeField === 'functional' ? 'start_time' : 'created_at',
    limit: 100,
  };
  const queryRef = useQueryLoading(
    dashboardStixCoreRelationshipsDistributionQuery,
    queryOptions,
  );
  return (
    <>
      {queryRef && (
        <React.Suspense fallback={<Loader variant={LoaderVariant.inElement} />}>
          <TargetedCountriesComponent queryRef={queryRef} />
        </React.Suspense>
      )}
    </>
  );
};

// LastIngestedAnalyses
const dashboardLastStixDomainObjectsQuery = graphql`
  query DashboardLastStixDomainObjectsQuery(
    $first: Int
    $orderBy: StixDomainObjectsOrdering
    $orderMode: OrderingMode
    $types: [String]
  ) {
    stixDomainObjects(
      first: $first
      orderBy: $orderBy
      orderMode: $orderMode
      types: $types
    ) {
      edges {
        node {
          id
          entity_type
          created_at
          ... on Report {
            name
            report_types
          }
          creators {
            id
            name
          }
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
                definition_type
                definition
                x_opencti_order
                x_opencti_color
              }
            }
          }
        }
      }
    }
  }
`;
const LastIngestedAnalysesComponent = ({ queryRef }) => {
  const classes = useStyles();
  const { t, fsd } = useFormatter();
  const data = usePreloadedQuery(dashboardLastStixDomainObjectsQuery, queryRef);
  const objects = data.stixDomainObjects;
  if (objects.edges.length === 0) {
    return <NoTableElement />;
  }
  return (
    <List>
      {objects.edges.map((stixDomainObjectEdge) => {
        const stixDomainObject = stixDomainObjectEdge.node;
        const stixDomainObjectLink = `${resolveLink(
          stixDomainObject.entity_type,
        )}/${stixDomainObject.id}`;
        return (
          <ListItem
            key={stixDomainObject.id}
            dense={true}
            button={true}
            classes={{ root: classes.item }}
            divider={true}
            component={Link}
            to={stixDomainObjectLink}
          >
            <ListItemIcon>
              <ItemIcon type={stixDomainObject.entity_type} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Tooltip title={defaultValue(stixDomainObject)}>
                  <div className={classes.itemText}>
                    {defaultValue(stixDomainObject)}
                  </div>
                </Tooltip>
              }
            />
            <div className={classes.itemType}>
              <Chip
                classes={{ root: classes.chipInList }}
                color="primary"
                variant="outlined"
                label={stixDomainObject.report_types?.at(0) ?? t('Unknown')}
              />
            </div>
            <div className={classes.itemAuthor}>
              {pathOr('', ['createdBy', 'name'], stixDomainObject)}
            </div>
            <div className={classes.itemCreator}>
              {(stixDomainObject.creators ?? []).map((c) => c?.name).join(', ')}
            </div>
            <div className={classes.itemDate}>
              {fsd(stixDomainObject.created_at)}
            </div>
            <div
              style={{
                width: 110,
                maxWidth: 110,
                minWidth: 110,
                paddingRight: 20,
              }}
            >
              <ItemMarkings
                markingDefinitionsEdges={
                  stixDomainObject.objectMarking.edges ?? []
                }
                limit={1}
                variant="inList"
              />
            </div>
          </ListItem>
        );
      })}
    </List>
  );
};
const LastIngestedAnalyses = () => {
  const queryOptions = {
    first: 8,
    orderBy: 'created_at',
    orderMode: 'desc',
    types: ['Report'],
  };
  const queryRef = useQueryLoading(
    dashboardLastStixDomainObjectsQuery,
    queryOptions,
  );
  return (
    <>
      {queryRef && (
        <React.Suspense fallback={<Loader variant={LoaderVariant.inElement} />}>
          <LastIngestedAnalysesComponent queryRef={queryRef} />
        </React.Suspense>
      )}
    </>
  );
};

// ObservablesDistribution
const dashboardStixCyberObservablesDistributionQuery = graphql`
  query DashboardStixCyberObservablesDistributionQuery(
    $field: String!
    $operation: String!
  ) {
    stixCyberObservablesDistribution(field: $field, operation: $operation) {
      label
      value
    }
  }
`;
const ObservablesDistributionComponent = ({ queryRef }) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useFormatter();
  const data = usePreloadedQuery(
    dashboardStixCyberObservablesDistributionQuery,
    queryRef,
  );
  const distribution = data.stixCyberObservablesDistribution.map(
    (n) => n.value,
  );
  if (distribution.length === 0) {
    return <NoTableElement />;
  }
  const labels = data.stixCyberObservablesDistribution.map((n) => t(`entity_${n.label}`));
  return (
    <div className={classes.graphContainer}>
      <Chart
        options={polarAreaChartOptions(theme, labels, simpleNumberFormat)}
        series={distribution}
        type="polarArea"
        width="100%"
        height={420}
      />
    </div>
  );
};
const ObservablesDistribution = () => {
  const queryOptions = { field: 'entity_type', operation: 'count' };
  const queryRef = useQueryLoading(
    dashboardStixCyberObservablesDistributionQuery,
    queryOptions,
  );
  return (
    <>
      {queryRef && (
        <React.Suspense fallback={<Loader variant={LoaderVariant.inElement} />}>
          <ObservablesDistributionComponent queryRef={queryRef} />
        </React.Suspense>
      )}
    </>
  );
};

// endregion

const DefaultDashboard = ({ timeField }) => {
  const { t } = useFormatter();
  const classes = useStyles();
  const theme = useTheme();
  return (
    <Security
      needs={[KNOWLEDGE]}
      placeholder={t(
        'You do not have any access to the knowledge of this OpenCTI instance.',
      )}
    >
      <Grid container={true} spacing={3}>
        <Grid item={true} xs={3}>
          <Card
            classes={{ root: classes.card }}
            style={{ height: 110 }}
            variant="outlined"
          >
            <Suspense fallback={<Loader variant="inElement" />}>
              <TotalEntitiesCard
                title={'Total entities'}
                options={{ endDate: dayAgo() }}
                Icon={Database}
                classes={classes}
              />
            </Suspense>
          </Card>
        </Grid>
        <Grid item={true} xs={3}>
          <Card
            classes={{ root: classes.card }}
            style={{ height: 110 }}
            variant="outlined"
          >
            <Suspense fallback={<Loader variant="inElement" />}>
              <TotalRelationshipsCard
                title={'Total relationships'}
                options={{
                  relationship_type: ['stix-core-relationship'],
                  endDate: dayAgo(),
                }}
                Icon={GraphOutline}
                classes={classes}
              />
            </Suspense>
          </Card>
        </Grid>
        <Grid item={true} xs={3}>
          <Card
            classes={{ root: classes.card }}
            style={{ height: 110 }}
            variant="outlined"
          >
            <Suspense fallback={<Loader variant="inElement" />}>
              <TotalEntitiesCard
                title={'Total reports'}
                options={{ types: ['report'], endDate: dayAgo() }}
                Icon={DescriptionOutlined}
                classes={classes}
              />
            </Suspense>
          </Card>
        </Grid>
        <Grid item={true} xs={3}>
          <Card
            classes={{ root: classes.card }}
            style={{ height: 110 }}
            variant="outlined"
          >
            <Suspense fallback={<Loader variant="inElement" />}>
              <TotalObservablesCard
                title={'Total observables'}
                options={{ endDate: dayAgo() }}
                Icon={HexagonMultipleOutline}
                classes={classes}
              />
            </Suspense>
          </Card>
        </Grid>
      </Grid>
      <Grid container={true} spacing={3} style={{ marginTop: -15 }}>
        <Grid item={true} xs={4}>
          <Typography variant="h4" gutterBottom={true}>
            {t('Top Labels (3 last months)')}
          </Typography>
          <Paper
            classes={{ root: classes.paper }}
            variant="outlined"
            style={{ height: 300 }}
          >
            <Suspense fallback={<Loader variant="inElement" />}>
              <TopLabelsCard classes={classes} />
            </Suspense>
          </Paper>
        </Grid>
        <Grid item={true} xs={8}>
          <Typography variant="h4" gutterBottom={true}>
            {t('Ingested entities')}
          </Typography>
          <Paper
            classes={{ root: classes.paper }}
            variant="outlined"
            style={{ height: 300 }}
          >
            <Suspense fallback={<Loader variant="inElement" />}>
              <IngestedEntitiesGraph />
            </Suspense>
          </Paper>
        </Grid>
      </Grid>
      <Grid container={true} spacing={3} style={{ marginTop: 5 }}>
        <Grid item={true} xs={6}>
          <StixRelationshipsHorizontalBars
            height={400}
            relationshipType="stix-core-relationship"
            toTypes={[
              'Threat-Actor',
              'Intrusion-Set',
              'Campaign',
              'Malware',
              'Tool',
              'Vulnerability',
              'Channel',
              'Narrative',
            ]}
            title={t('Top 10 active entities (3 last months)')}
            field="internal_id"
            startDate={monthsAgo(3)}
            dateAttribute={
              timeField === 'functional' ? 'start_time' : 'created_at'
            }
          />
        </Grid>
        <Grid item={true} xs={6}>
          <Typography variant="h4" gutterBottom={true}>
            {t('Targeted countries (3 last months)')}
          </Typography>
          <Paper
            classes={{ root: classes.paper }}
            variant="outlined"
            style={{ height: 400 }}
          >
            <Suspense
              fallback={
                <LocationMiniMapTargets
                  center={[48.8566969, 2.3514616]}
                  zoom={2}
                />
              }
            >
              <TargetedCountries timeField={timeField} />
            </Suspense>
          </Paper>
        </Grid>
      </Grid>
      <Grid container={true} spacing={3} style={{ marginTop: 5 }}>
        <Grid item={true} xs={8}>
          <Typography variant="h4" gutterBottom={true}>
            {t('Last ingested reports (creation date in the platform)')}
          </Typography>
          <Paper
            classes={{ root: classes.paper }}
            variant="outlined"
            style={{ height: 420 }}
          >
            <Suspense fallback={<Loader variant="inElement" />}>
              <LastIngestedAnalyses />
            </Suspense>
          </Paper>
        </Grid>
        <Grid item={true} xs={4}>
          <Typography variant="h4" gutterBottom={true}>
            {t('Observables distribution')}
          </Typography>
          <Paper
            classes={{ root: classes.paper }}
            variant="outlined"
            style={{ height: 420 }}
          >
            <Suspense fallback={<Loader variant="inElement" />}>
              <ObservablesDistribution classes={classes} theme={theme} />
            </Suspense>
          </Paper>
        </Grid>
      </Grid>
    </Security>
  );
};

const dashboardCustomDashboardQuery = graphql`
  query DashboardCustomDashboardQuery($id: String!) {
    workspace(id: $id) {
      id
      name
      ...Dashboard_workspace
    }
  }
`;
const WorkspaceDashboardComponent = ({ queryRef, timeField }) => {
  const data = usePreloadedQuery(dashboardCustomDashboardQuery, queryRef);
  if (data.workspace) {
    return (
      <DashboardView
        workspace={data.workspace}
        noToolbar={true}
        timeField={timeField}
      />
    );
  }
  return <DefaultDashboard timeField={timeField} />;
};
const WorkspaceDashboard = ({ dashboard, timeField }) => {
  const queryRef = useQueryLoading(dashboardCustomDashboardQuery, {
    id: dashboard,
  });
  return (
    <>
      {queryRef && (
        <React.Suspense fallback={<Loader variant={LoaderVariant.inElement} />}>
          <WorkspaceDashboardComponent
            timeField={timeField}
            queryRef={queryRef}
          />
        </React.Suspense>
      )}
    </>
  );
};
const CustomDashboard = ({ dashboard, timeField }) => {
  const { t } = useFormatter();
  return (
    <Security
      needs={[EXPLORE]}
      placeholder={t(
        'You do not have any access to the explore part of this OpenCTI instance.',
      )}
    >
      <Suspense fallback={<Loader />}>
        <WorkspaceDashboard dashboard={dashboard} timeField={timeField} />
      </Suspense>
    </Security>
  );
};

const dashboardQuery = graphql`
  query DashboardQuery {
    me {
      ...DashboardMeFragment
    }
  }
`;

const dashboardMeFragment = graphql`
  fragment DashboardMeFragment on MeUser {
    id
    default_dashboard {
      id
    }
    default_time_field
  }
`;

const LOCAL_STORAGE_KEY = 'dashboard';

const DashboardComponent = ({ queryRef }) => {
  const classes = useStyles();
  const { me: currentMe, ...context } = useAuth();
  const data = usePreloadedQuery(dashboardQuery, queryRef);
  const me = useFragment(dashboardMeFragment, data.me);
  const { default_dashboards: dashboards } = currentMe;
  const { default_time_field, default_dashboard } = me;
  const { viewStorage: localTimeFieldPreferences } = usePaginationLocalStorage(
    LOCAL_STORAGE_KEY,
    {},
  );
  const { dashboard } = localTimeFieldPreferences;

  let defaultDashboard = default_dashboard?.id;
  if (!defaultDashboard) {
    defaultDashboard = dashboards[0]?.id;
  } else if (dashboard && dashboard !== 'default') {
    // Handle old conf
    defaultDashboard = dashboard;
  }
  return (
    <UserContext.Provider value={{ me: { ...currentMe, ...me }, ...context }}>
      <div className={classes.root}>
        {defaultDashboard ? (
          <CustomDashboard
            dashboard={defaultDashboard}
            timeField={default_time_field}
          />
        ) : (
          <DefaultDashboard timeField={default_time_field} />
        )}
      </div>
    </UserContext.Provider>
  );
};

const Dashboard = () => {
  const queryRef = useQueryLoading(dashboardQuery, {});
  return (
    <>
      {queryRef && (
        <React.Suspense fallback={<div />}>
          <DashboardComponent queryRef={queryRef} />
        </React.Suspense>
      )}
    </>
  );
};

export default Dashboard;
