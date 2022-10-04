import { findById, findAll, findTemplateById, findAllTemplates } from '../domain/status';
import type { Resolvers } from '../generated/graphql';

const statusResolvers: Resolvers = {
  Query: {
    statusTemplate: (_, { id }, context) => findTemplateById(context, context.user, id),
    statusTemplates: (_, args, context) => findAllTemplates(context, context.user, args),
    status: (_, { id }, context) => findById(context, context.user, id),
    statuses: (_, args, context) => findAll(context, context.user, args),
  },
  Status: {
    template: (current, _, context) => findTemplateById(context, context.user, current.template_id),
  },
};

export default statusResolvers;
