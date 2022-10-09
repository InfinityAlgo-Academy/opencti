import { withFilter } from 'graphql-subscriptions';
import {
  addWorkspace,
  findAll,
  findById,
  objects,
  workspaceCleanContext,
  workspaceDelete,
  workspaceEditContext,
  workspaceEditField,
  workspaceAddRelation,
  workspaceAddRelations,
  workspaceDeleteRelation,
  workspaceDeleteRelations,
} from '../domain/workspace';
import { findById as findUserById } from '../domain/user';
import { fetchEditContext, pubsub } from '../database/redis';
import { BUS_TOPICS } from '../config/conf';
import { ENTITY_TYPE_WORKSPACE } from '../schema/internalObject';
import withCancel from '../graphql/subscriptionWrapper';
import { SYSTEM_USER } from '../utils/access';

const workspaceResolvers = {
  Query: {
    workspace: (_, { id }, context) => findById(context, context.user, id),
    workspaces: (_, args, context) => findAll(context, context.user, args),
  },
  Workspace: {
    owner: async (workspace, context) => {
      const findUser = await findUserById(context, context.user, workspace.owner);
      return findUser || SYSTEM_USER;
    },
    objects: (workspace, args, context) => objects(context, context.user, workspace.id, args),
    editContext: (workspace) => fetchEditContext(workspace.id),
  },
  Mutation: {
    workspaceEdit: (_, { id }, context) => ({
      delete: () => workspaceDelete(context, context.user, id),
      fieldPatch: ({ input }) => workspaceEditField(context, context.user, id, input),
      contextPatch: ({ input }) => workspaceEditContext(context, context.user, id, input),
      contextClean: () => workspaceCleanContext(context, context.user, id),
      relationAdd: ({ input }) => workspaceAddRelation(context, context.user, id, input),
      relationsAdd: ({ input }) => workspaceAddRelations(context, context.user, id, input),
      relationDelete: ({ toId, relationship_type: relationshipType }) => workspaceDeleteRelation(context, context.user, id, toId, relationshipType),
      relationsDelete: ({ toIds, relationship_type: relationshipType }) => workspaceDeleteRelations(context, context.user, id, toIds, relationshipType),
    }),
    workspaceAdd: (_, { input }, context) => addWorkspace(context, context.user, input),
  },
  Subscription: {
    workspace: {
      resolve: /* istanbul ignore next */ (payload) => payload.instance,
      subscribe: /* istanbul ignore next */ (_, { id }, context) => {
        workspaceEditContext(context, context.user, id);
        const filtering = withFilter(
          () => pubsub.asyncIterator(BUS_TOPICS[ENTITY_TYPE_WORKSPACE].EDIT_TOPIC),
          (payload) => {
            if (!payload) return false; // When disconnect, an empty payload is dispatched.
            return payload.user.id !== context.user.id && payload.instance.id === id;
          }
        )(_, { id }, context);
        return withCancel(filtering, () => {
          workspaceCleanContext(context, context.user, id);
        });
      },
    },
  },
};

export default workspaceResolvers;
