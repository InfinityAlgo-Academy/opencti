import { withFilter } from 'graphql-subscriptions';
import { BUS_TOPICS } from '../config/conf';
import {
  addStixCoreRelationship,
  findAll,
  findById,
  stixCoreRelationshipAddRelation,
  stixCoreRelationshipCleanContext,
  stixCoreRelationshipDelete,
  stixCoreRelationshipDeleteByFromAndTo,
  stixCoreRelationshipDeleteRelation,
  stixCoreRelationshipEditContext,
  stixCoreRelationshipEditField,
  stixCoreRelationshipsNumber,
  batchCreatedBy,
  batchKillChainPhases,
  batchExternalReferences,
  batchLabels,
  batchMarkingDefinitions,
  batchNotes,
  batchOpinions,
  batchReports,
} from '../domain/stixCoreRelationship';
import { fetchEditContext, pubsub } from '../database/redis';
import withCancel from '../graphql/subscriptionWrapper';
import { distributionRelations, timeSeriesRelations, REL_CONNECTED_SUFFIX, batchLoader } from '../database/middleware';
import { convertDataToStix } from '../database/stix';
import { creator } from '../domain/log';
import { RELATION_CREATED_BY, RELATION_OBJECT_LABEL, RELATION_OBJECT_MARKING } from '../schema/stixMetaRelationship';
import { ABSTRACT_STIX_CORE_RELATIONSHIP, REL_INDEX_PREFIX } from '../schema/general';
import { elBatchIds } from '../database/elasticSearch';

const loadByIdLoader = batchLoader(elBatchIds);
const createdByLoader = batchLoader(batchCreatedBy);
const markingDefinitionsLoader = batchLoader(batchMarkingDefinitions);
const labelsLoader = batchLoader(batchLabels);
const externalReferencesLoader = batchLoader(batchExternalReferences);
const killChainPhasesLoader = batchLoader(batchKillChainPhases);
const notesLoader = batchLoader(batchNotes);
const opinionsLoader = batchLoader(batchOpinions);
const reportsLoader = batchLoader(batchReports);

const stixCoreRelationshipResolvers = {
  Query: {
    stixCoreRelationship: (_, { id }, { user }) => findById(user, id),
    stixCoreRelationships: (_, args, { user }) => findAll(user, args),
    stixCoreRelationshipsTimeSeries: (_, args, { user }) => timeSeriesRelations(user, args),
    stixCoreRelationshipsDistribution: (_, args, { user }) => distributionRelations(user, args),
    stixCoreRelationshipsNumber: (_, args, { user }) => stixCoreRelationshipsNumber(user, args),
  },
  StixCoreRelationshipsOrdering: {
    toName: `${REL_INDEX_PREFIX}${REL_CONNECTED_SUFFIX}to.name`,
  },
  StixCoreRelationshipsFilter: {
    createdBy: `${REL_INDEX_PREFIX}${RELATION_CREATED_BY}.internal_id`,
    markedBy: `${REL_INDEX_PREFIX}${RELATION_OBJECT_MARKING}.internal_id`,
    labelledBy: `${REL_INDEX_PREFIX}${RELATION_OBJECT_LABEL}.internal_id`,
    toName: `${REL_INDEX_PREFIX}${REL_CONNECTED_SUFFIX}to.name`,
    toCreatedAt: `${REL_INDEX_PREFIX}${REL_CONNECTED_SUFFIX}to.created_at`,
    toPatternType: `${REL_INDEX_PREFIX}${REL_CONNECTED_SUFFIX}to.pattern_type`,
    toMainObservableType: `${REL_INDEX_PREFIX}${REL_CONNECTED_SUFFIX}to.x_opencti_main_observable_type`,
  },
  StixCoreRelationship: {
    from: (rel, _, { user }) => loadByIdLoader.load(rel.fromId, user),
    to: (rel, _, { user }) => loadByIdLoader.load(rel.toId, user),
    toStix: (rel) => JSON.stringify(convertDataToStix(rel)),
    creator: (rel, _, { user }) => creator(user, rel.id),
    createdBy: (rel, _, { user }) => createdByLoader.load(rel.id, user),
    objectMarking: (rel, _, { user }) => markingDefinitionsLoader.load(rel.id, user),
    objectLabel: (rel, _, { user }) => labelsLoader.load(rel.id, user),
    externalReferences: (rel, _, { user }) => externalReferencesLoader.load(rel.id, user),
    killChainPhases: (rel, _, { user }) => killChainPhasesLoader.load(rel.id, user),
    reports: (rel, _, { user }) => reportsLoader.load(rel.id, user),
    notes: (rel, _, { user }) => notesLoader.load(rel.id, user),
    opinions: (rel, _, { user }) => opinionsLoader.load(rel.id, user),
    editContext: (rel) => fetchEditContext(rel.id),
  },
  Mutation: {
    stixCoreRelationshipEdit: (_, { id }, { user }) => ({
      delete: () => stixCoreRelationshipDelete(user, id),
      fieldPatch: ({ input }) => stixCoreRelationshipEditField(user, id, input),
      contextPatch: ({ input }) => stixCoreRelationshipEditContext(user, id, input),
      contextClean: () => stixCoreRelationshipCleanContext(user, id),
      relationAdd: ({ input }) => stixCoreRelationshipAddRelation(user, id, input),
      relationDelete: ({ toId, relationship_type: relationshipType }) =>
        stixCoreRelationshipDeleteRelation(user, id, toId, relationshipType),
    }),
    stixCoreRelationshipAdd: (_, { input }, { user }) => addStixCoreRelationship(user, input),
    stixCoreRelationshipDelete: (_, { fromId, toId, relationship_type: relationshipType }, { user }) =>
      stixCoreRelationshipDeleteByFromAndTo(user, fromId, toId, relationshipType),
  },
  Subscription: {
    stixCoreRelationship: {
      resolve: /* istanbul ignore next */ (payload) => payload.instance,
      subscribe: /* istanbul ignore next */ (_, { id }, { user }) => {
        stixCoreRelationshipEditContext(user, id);
        const filtering = withFilter(
          () => pubsub.asyncIterator(BUS_TOPICS[ABSTRACT_STIX_CORE_RELATIONSHIP].EDIT_TOPIC),
          (payload) => {
            if (!payload) return false; // When disconnect, an empty payload is dispatched.
            return payload.user.id !== user.id && payload.instance.id === id;
          }
        )(_, { id }, { user });
        return withCancel(filtering, () => {
          stixCoreRelationshipCleanContext(user, id);
        });
      },
    },
  },
};

export default stixCoreRelationshipResolvers;
