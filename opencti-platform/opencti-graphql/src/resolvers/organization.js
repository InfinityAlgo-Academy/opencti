import { addOrganization, findAll, findById } from '../domain/organization';
import {
  createdByRef,
  markingDefinitions,
  reports,
  stixRelations,
  stixDomainEntityEditContext,
  stixDomainEntityCleanContext,
  stixDomainEntityEditField,
  stixDomainEntityAddRelation,
  stixDomainEntityDeleteRelation,
  stixDomainEntityDelete
} from '../domain/stixDomainEntity';
import { fetchEditContext } from '../database/redis';

const organizationResolvers = {
  Query: {
    organization: (_, { id }) => findById(id),
    organizations: (_, args) => findAll(args)
  },
  Organization: {
    createdByRef: organization => createdByRef(organization.id),
    markingDefinitions: (organization, args) =>
      markingDefinitions(organization.id, args),
    reports: (organization, args) => reports(organization.id, args),
    stixRelations: (organization, args) => stixRelations(organization.id, args),
    editContext: organization => fetchEditContext(organization.id)
  },
  Mutation: {
    organizationEdit: (_, { id }, { user }) => ({
      delete: () => stixDomainEntityDelete(id),
      fieldPatch: ({ input }) => stixDomainEntityEditField(user, id, input),
      contextPatch: ({ input }) => stixDomainEntityEditContext(user, id, input),
      contextClean: () => stixDomainEntityCleanContext(user, id),
      relationAdd: ({ input }) => stixDomainEntityAddRelation(user, id, input),
      relationDelete: ({ relationId }) =>
        stixDomainEntityDeleteRelation(user, id, relationId)
    }),
    organizationAdd: (_, { input }, { user }) => addOrganization(user, input)
  }
};

export default organizationResolvers;
