import type { Resolvers } from '../../generated/graphql';
import {
  addNarrative,
  batchIsSubNarrative,
  batchParentNarratives,
  batchSubNarratives,
  findAll,
  findById
} from './narrative-domain';
import {
  stixDomainObjectAddRelation,
  stixDomainObjectCleanContext,
  stixDomainObjectDelete,
  stixDomainObjectDeleteRelation,
  stixDomainObjectEditContext,
  stixDomainObjectEditField
} from '../../domain/stixDomainObject';
import { batchLoader } from '../../database/middleware';

const parentNarrativesLoader = batchLoader(batchParentNarratives);
const subNarrativesLoader = batchLoader(batchSubNarratives);
const isSubNarrativeLoader = batchLoader(batchIsSubNarrative);

const narrativeResolvers: Resolvers = {
  Query: {
    narrative: (_, { id }, context) => findById(context, context.user, id),
    narratives: (_, args, context) => findAll(context, context.user, args),
  },
  Narrative: {
    parentNarratives: (narrative, _, context) => parentNarrativesLoader.load(narrative.id, context, context.user),
    subNarratives: (narrative, _, context) => subNarrativesLoader.load(narrative.id, context, context.user),
    isSubNarrative: (narrative, _, context) => isSubNarrativeLoader.load(narrative.id, context, context.user),
  },
  Mutation: {
    narrativeAdd: (_, { input }, context) => {
      return addNarrative(context, context.user, input);
    },
    narrativeDelete: (_, { id }, context) => {
      return stixDomainObjectDelete(context, context.user, id);
    },
    narrativeFieldPatch: (_, { id, input, commitMessage, references }, context) => {
      return stixDomainObjectEditField(context, context.user, id, input, { commitMessage, references });
    },
    narrativeContextPatch: (_, { id, input }, context) => {
      return stixDomainObjectEditContext(context, context.user, id, input);
    },
    narrativeContextClean: (_, { id }, context) => {
      return stixDomainObjectCleanContext(context, context.user, id);
    },
    narrativeRelationAdd: (_, { id, input }, context) => {
      return stixDomainObjectAddRelation(context, context.user, id, input);
    },
    narrativeRelationDelete: (_, { id, toId, relationship_type: relationshipType }, context) => {
      return stixDomainObjectDeleteRelation(context, context.user, id, toId, relationshipType);
    },
  },
};

export default narrativeResolvers;
