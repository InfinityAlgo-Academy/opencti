import { withFilter } from 'graphql-subscriptions';
import { BUS_TOPICS } from '../config/conf';
import {
  addStixObservableRelation,
  findAll,
  findById,
  stixObservableRelationCleanContext,
  stixObservableRelationDelete,
  stixObservableRelationEditContext,
  stixObservableRelationEditField,
} from '../domain/stixObservableRelation';
import { pubsub } from '../database/redis';
import withCancel from '../graphql/subscriptionWrapper';
import { loadById } from '../database/grakn';

const stixObservableRelationResolvers = {
  Query: {
    stixObservableRelation: (_, { id }) => findById(id),
    stixObservableRelations: (_, args) => {
      if (args.stix_id && args.stix_id.length > 0) {
        return findById(args.stix_id);
      }
      return findAll(args);
    },
  },
  StixObservableRelation: {
    from: (rel) => loadById(rel.fromId, rel.fromType),
    to: (rel) => loadById(rel.toId, rel.toType),
  },
  Mutation: {
    stixObservableRelationEdit: (_, { id }, { user }) => ({
      delete: () => stixObservableRelationDelete(user, id),
      fieldPatch: ({ input }) => stixObservableRelationEditField(user, id, input),
      contextPatch: ({ input }) => stixObservableRelationEditContext(user, id, input),
      contextClean: () => stixObservableRelationCleanContext(user, id),
    }),
    stixObservableRelationAdd: (_, { input }, { user }) => addStixObservableRelation(user, input),
  },
  Subscription: {
    stixObservableRelation: {
      resolve: /* istanbul ignore next */ (payload) => payload.instance,
      subscribe: /* istanbul ignore next */ (_, { id }, { user }) => {
        stixObservableRelationEditContext(user, id);
        const filtering = withFilter(
          () => pubsub.asyncIterator(BUS_TOPICS.StixObservableRelation.EDIT_TOPIC),
          (payload) => {
            if (!payload) return false; // When disconnect, an empty payload is dispatched.
            return payload.user.id !== user.id && payload.instance.id === id;
          }
        )(_, { id }, { user });
        return withCancel(filtering, () => {
          stixObservableRelationCleanContext(user, id);
        });
      },
    },
  },
};

export default stixObservableRelationResolvers;
