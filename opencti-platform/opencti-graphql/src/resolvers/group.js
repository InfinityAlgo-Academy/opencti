import { addGroup, groupDelete, findAll, findById, members, permissions, groupEditField } from '../domain/group';
import {
  stixDomainEntityEditContext,
  stixDomainEntityCleanContext,
  stixDomainEntityAddRelation,
  stixDomainEntityDeleteRelation
} from '../domain/stixDomainEntity';
import { fetchEditContext } from '../database/redis';

const groupResolvers = {
  Query: {
    group: (_, { id }) => findById(id),
    groups: (_, args) => findAll(args)
  },
  Group: {
    members: group => members(group.id),
    permissions: group => permissions(group.id),
    editContext: group => fetchEditContext(group.id)
  },
  Mutation: {
    groupEdit: (_, { id }, { user }) => ({
      delete: () => groupDelete(id),
      fieldPatch: ({ input }) => groupEditField(user, id, input),
      contextPatch: ({ input }) => stixDomainEntityEditContext(user, id, input),
      contextClean: () => stixDomainEntityCleanContext(user, id),
      relationAdd: ({ input }) => stixDomainEntityAddRelation(user, id, input),
      relationDelete: ({ relationId }) => stixDomainEntityDeleteRelation(user, id, relationId)
    }),
    groupAdd: (_, { input }, { user }) => addGroup(user, input)
  }
};

export default groupResolvers;
