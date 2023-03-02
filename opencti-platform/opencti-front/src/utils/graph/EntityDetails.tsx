import React, { FunctionComponent } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { Link } from 'react-router-dom';
import { InfoOutlined } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import { graphql, PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { useFormatter } from '../../components/i18n';
import { resolveLink } from '../Entity';
import ItemAuthor from '../../components/ItemAuthor';
import useQueryLoading from '../hooks/useQueryLoading';
import Loader, { LoaderVariant } from '../../components/Loader';
import { EntityDetailsQuery } from './__generated__/EntityDetailsQuery.graphql';
import ExpandableMarkdown from '../../components/ExpandableMarkdown';
import ItemMarkings from '../../components/ItemMarkings';
import { truncate } from '../String';
import type { SelectedEntity } from './EntitiesDetailsRightBar';
import ErrorNotFound from '../../components/ErrorNotFound';

const useStyles = makeStyles(() => ({
  entity: {
    marginTop: '20px',
  },
  label: {
    marginTop: '20px',
  },
  nameLabel: {
    marginTop: '15px',
    marginBottom: -1,
  },
}));

const entityDetailsQuery = graphql`
  query EntityDetailsQuery($id: String!) {
    stixCoreObject(id: $id) {
      id
      entity_type
      parent_types
      created_at
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
      ... on StixDomainObject {
        created
      }
      ... on AttackPattern {
        name
        x_mitre_id
      }
      ... on Campaign {
        name
        first_seen
        last_seen
      }
      ... on CourseOfAction {
        name
      }
      ... on Note {
        attribute_abstract
        content
      }
      ... on ObservedData {
        name
      }
      ... on Opinion {
        opinion
      }
      ... on Report {
        name
        published
      }
      ... on Grouping {
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
        first_seen
        last_seen
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
        first_seen
        last_seen
        description
      }
      ... on ThreatActor {
        name
        first_seen
        last_seen
        description
      }
      ... on Tool {
        name
      }
      ... on Vulnerability {
        name
      }
      ... on Incident {
        name
        first_seen
        last_seen
        description
      }
      ... on StixCyberObservable {
        observable_value
      }
      ... on StixFile {
        observableName: name
      }
      ... on Event {
        name
      }
      ... on Case {
        name
      }
      ... on Narrative {
        name
      }
      ... on DataComponent {
        name
      }
      ... on DataSource {
        name
      }
      ... on Language {
        name
      }
    }
  }
`;

interface EntityDetailsComponentProps {
  queryRef: PreloadedQuery<EntityDetailsQuery>;
}

const EntityDetailsComponent: FunctionComponent<
EntityDetailsComponentProps
> = ({ queryRef }) => {
  const classes = useStyles();
  const { t, fldt } = useFormatter();

  const entity = usePreloadedQuery<EntityDetailsQuery>(
    entityDetailsQuery,
    queryRef,
  );
  const { stixCoreObject } = entity;

  if (!stixCoreObject) {
    return <ErrorNotFound />;
  }
  return (
    <div className={classes.entity}>
      <Typography
        variant="h3"
        gutterBottom={false}
        className={classes.nameLabel}
      >
        {t('Name')}
      </Typography>
      {stixCoreObject.name ? truncate(stixCoreObject.name, 30) : '-'}
      <Tooltip title={t('View the item')}>
          <span>
            <IconButton
              color="primary"
              component={Link}
              to={`${resolveLink(stixCoreObject.entity_type)}/${
                stixCoreObject.id
              }`}
              size="small"
            >
                <InfoOutlined/>
            </IconButton>
          </span>
      </Tooltip>
      <Typography
        variant="h3"
        gutterBottom={true}
        className={classes.label}
      >
        {t('Type')}
      </Typography>
      {stixCoreObject.entity_type}
      <Typography
        variant="h3"
        gutterBottom={true}
        className={classes.label}
      >
        {t('Description')}
      </Typography>
      {stixCoreObject.description ? (
        <ExpandableMarkdown
          source={stixCoreObject.description}
          limit={400}
        />
      ) : (
        '-'
      )
      }
      <Typography variant="h3"
                  gutterBottom={true}
                  className={classes.label}
      >
        {t('Creation date')}
      </Typography>
      {fldt(stixCoreObject.created_at)}
      <Typography variant="h3"
                  gutterBottom={true}
                  className={classes.label}
      >
        {t('Marking')}
      </Typography>
      {(stixCoreObject.objectMarking?.edges && stixCoreObject.objectMarking?.edges.length > 0) ? (
        <ItemMarkings
          markingDefinitionsEdges={stixCoreObject.objectMarking.edges}
          limit={2}
        />) : (
        '-'
      )
      }
      <Typography
        variant="h3"
        gutterBottom={true}
        className={classes.label}
      >
        {t('Author')}
      </Typography>
      <ItemAuthor
          createdBy={stixCoreObject.createdBy}
        />
    </div>
  );
};

interface EntityDetailsProps {
  entity: SelectedEntity;
  queryRef: PreloadedQuery<EntityDetailsQuery>;
}

const EntityDetails: FunctionComponent<
Omit<EntityDetailsProps, 'queryRef'>
> = ({ entity }) => {
  const queryRef = useQueryLoading<EntityDetailsQuery>(entityDetailsQuery, {
    id: entity.id,
  });
  return queryRef ? (
    <React.Suspense fallback={<Loader variant={LoaderVariant.inElement}/>}>
      <EntityDetailsComponent queryRef={queryRef}/>
    </React.Suspense>
  ) : (
    <Loader variant={LoaderVariant.inElement}/>
  );
};

export default EntityDetails;
