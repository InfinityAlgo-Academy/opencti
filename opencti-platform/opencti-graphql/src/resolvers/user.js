import {
  addUser,
  addPerson,
  findAll,
  findById,
  groups,
  token,
  login,
  logout,
  userEditField,
  meEditField,
  userRenewToken,
  setAuthenticationCookie,
  userDelete
} from '../domain/user';
import {
  createdByRef,
  markingDefinitions,
  reports,
  stixRelations,
  stixDomainEntityEditContext,
  stixDomainEntityCleanContext,
  stixDomainEntityAddRelation,
  stixDomainEntityDeleteRelation
} from '../domain/stixDomainEntity';
import { fetchEditContext } from '../database/redis';

const userResolvers = {
  Query: {
    user: (_, { id }) => findById(id),
    users: (_, args) => findAll(args),
    me: (_, args, { user }) => findById(user.id)
  },
  User: {
    createdByRef: user => createdByRef(user.id),
    groups: (user, args) => groups(user.id, args),
    token: (user, args, context) => token(user.id, args, context),
    markingDefinitions: (user, args) => markingDefinitions(user.id, args),
    reports: (user, args) => reports(user.id, args),
    stixRelations: (user, args) => stixRelations(user.id, args),
    editContext: user => fetchEditContext(user.id)
  },
  Mutation: {
    token: (_, { input }, context) =>
      login(input.email, input.password).then(tokenObject => {
        setAuthenticationCookie(tokenObject, context.res);
        return tokenObject.uuid;
      }),
    logout: (_, args, context) => logout(context.user, context.res),
    userEdit: (_, { id }, { user }) => ({
      delete: () => userDelete(id),
      fieldPatch: ({ input }) => userEditField(user, id, input),
      contextPatch: ({ input }) => stixDomainEntityEditContext(user, id, input),
      contextClean: () => stixDomainEntityCleanContext(user, id),
      tokenRenew: () => userRenewToken(id),
      relationAdd: ({ input }) => stixDomainEntityAddRelation(user, id, input),
      relationDelete: ({ relationId }) =>
        stixDomainEntityDeleteRelation(user, id, relationId)
    }),
    meEdit: (_, { input }, { user }) => meEditField(user, user.id, input),
    personAdd: (_, { input }, { user }) => addPerson(user, input),
    userAdd: (_, { input }, { user }) => addUser(user, input)
  }
};

export default userResolvers;
