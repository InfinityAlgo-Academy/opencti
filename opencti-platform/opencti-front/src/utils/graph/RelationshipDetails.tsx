import React, { FunctionComponent } from 'react';
import { graphql, PreloadedQuery, usePreloadedQuery } from 'react-relay';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { Link } from 'react-router-dom';
import { InfoOutlined } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import useQueryLoading from '../hooks/useQueryLoading';
import Loader, { LoaderVariant } from '../../components/Loader';
import { useFormatter } from '../../components/i18n';
import { resolveLink } from '../Entity';
import ExpandableMarkdown from '../../components/ExpandableMarkdown';
import ItemMarkings from '../../components/ItemMarkings';
import ItemAuthor from '../../components/ItemAuthor';
import ItemConfidence from '../../components/ItemConfidence';
import { RelationshipDetailsQuery } from './__generated__/RelationshipDetailsQuery.graphql';
import type { SelectedEntity } from './EntitiesDetailsRightBar';
import ErrorNotFound from '../../components/ErrorNotFound';
import RelationShipFromAndTo from './RelationShipFromAndTo';

const useStyles = makeStyles(() => ({
  relation: {
    marginTop: '20px',
  },
  label: {
    marginTop: '20px',
  },
  relationTypeLabel: {
    marginTop: '15px',
    marginBottom: -1,
  },
}));

const relationshipDetailsQuery = graphql`
  query RelationshipDetailsQuery($id: String!) {
    stixCoreRelationship(id: $id) {
      id
      entity_type
      description
      parent_types
      start_time
      stop_time
      created
      created_at
            confidence
            relationship_type
            from {
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
                ... on StixCoreRelationship {
                    relationship_type
                }
            }
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
                ... on StixCoreRelationship {
                    relationship_type
                }
            }
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
        }
    }
`;

interface RelationshipDetailsComponentProps {
  queryRef: PreloadedQuery<RelationshipDetailsQuery>;
}

const RelationshipDetailsComponent: FunctionComponent<
RelationshipDetailsComponentProps
> = ({ queryRef }) => {
  const classes = useStyles();
  const { t, fldt } = useFormatter();

  const entity = usePreloadedQuery<RelationshipDetailsQuery>(
    relationshipDetailsQuery,
    queryRef,
  );
  const { stixCoreRelationship } = entity;

  if (!stixCoreRelationship) {
    return <ErrorNotFound />;
  }
  return (
    <div className={classes.relation}>
      <Typography
        variant="h3"
        gutterBottom={false}
        className={classes.relationTypeLabel}
      >
        {t('Relation type')}
      </Typography>
      {stixCoreRelationship.relationship_type}
      {stixCoreRelationship.from.entity_type && (
        <Tooltip title={t('View the item')}>
          <span>
            <IconButton
              color="primary"
              component={Link}
              to={`${resolveLink(stixCoreRelationship.from.entity_type)}/${
                stixCoreRelationship.from.id
              }/knowledge/relations/${stixCoreRelationship.id}`}
              size="small"
            >
              <InfoOutlined />
            </IconButton>
          </span>
        </Tooltip>}
      {!stixCoreRelationship.from.relationship_type && stixCoreRelationship.from.id
        && <RelationShipFromAndTo
          id={stixCoreRelationship.from.id}
          direction={'From'}
        />
      }
      {stixCoreRelationship.from.relationship_type && stixCoreRelationship.from.id
        && <div>
          <Typography
            variant="h3"
            gutterBottom={true}
            className={classes.label}
          >
            {t('From')}
          </Typography>
          {stixCoreRelationship.from.relationship_type}
        </div>
      }
      {!stixCoreRelationship.to.relationship_type && stixCoreRelationship.to.id
        && <RelationShipFromAndTo
          id={stixCoreRelationship.to.id}
          direction={'To'}
        />
      }
      {stixCoreRelationship.to.relationship_type && stixCoreRelationship.to.id
        && <div>
          <Typography
            variant="h3"
            gutterBottom={true}
            className={classes.label}
          >
            {t('To')}
          </Typography>
          {stixCoreRelationship.to.relationship_type}
        </div>
      }
      <Typography variant="h3"
                  gutterBottom={true}
                  className={classes.label}
      >
        {t('Creation date')}
      </Typography>
      {fldt(stixCoreRelationship.created_at)}
      <Typography
        variant="h3"
        gutterBottom={true}
        className={classes.label}
      >
        {t('First seen')}
      </Typography>
      {fldt(stixCoreRelationship.start_time)}
      <Typography
        variant="h3"
        gutterBottom={true}
        className={classes.label}
      >
        {t('Last seen')}
      </Typography>
      {fldt(stixCoreRelationship.stop_time)}
      <Typography
        variant="h3"
        gutterBottom={true}
        className={classes.label}
      >
        {t('Description')}
      </Typography>
      {stixCoreRelationship.description ? (
        <ExpandableMarkdown
          source={stixCoreRelationship.description}
          limit={400}
        />
      ) : (
        '-'
      )
      }
      <Typography
        variant="h3"
        gutterBottom={true}
        className={classes.label}
      >
        {t('Confidence level')}
      </Typography>
      {stixCoreRelationship.confidence ? (
        <ItemConfidence confidence={stixCoreRelationship.confidence}/>
      ) : (
        '-'
      ) }
      <Typography variant="h3"
                  gutterBottom={true}
                  className={classes.label}
      >
        {t('Marking')}
      </Typography>
      {(stixCoreRelationship.objectMarking && stixCoreRelationship.objectMarking.edges.length > 0) ? (
        <ItemMarkings
          markingDefinitionsEdges={stixCoreRelationship.objectMarking.edges}
          limit={2}
        />) : (
        '-'
      )
      }
      <Typography variant="h3" gutterBottom={true} className={classes.label}>
        {t('Author')}
      </Typography>
      <ItemAuthor createdBy={stixCoreRelationship.createdBy}/>
    </div>
  );
};

interface RelationshipDetailsProps {
  relation: SelectedEntity;
  queryRef: PreloadedQuery<RelationshipDetailsQuery>;
}

const RelationshipDetails: FunctionComponent<
Omit<RelationshipDetailsProps, 'queryRef'>
> = ({ relation }) => {
  const queryRef = useQueryLoading<RelationshipDetailsQuery>(
    relationshipDetailsQuery,
    { id: relation.id },
  );
  return queryRef ? (
    <React.Suspense fallback={<Loader variant={LoaderVariant.inElement}/>}>
      <RelationshipDetailsComponent queryRef={queryRef}/>
    </React.Suspense>
  ) : (
    <Loader variant={LoaderVariant.inElement}/>
  );
};

export default RelationshipDetails;
