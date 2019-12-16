import { addIndicator, findAll, findById, observableRefs, clear } from '../domain/indicator';
import {
  stixDomainEntityAddRelation,
  stixDomainEntityCleanContext,
  stixDomainEntityDelete,
  stixDomainEntityDeleteRelation,
  stixDomainEntityEditContext,
  stixDomainEntityEditField
} from '../domain/stixDomainEntity';
import { REL_INDEX_PREFIX } from '../database/elasticSearch';

const indicatorResolvers = {
  Query: {
    indicator: (_, { id }) => findById(id),
    indicators: (_, args) => findAll(args)
  },
  IndicatorsOrdering: {
    markingDefinitions: `${REL_INDEX_PREFIX}object_marking_refs.definition`,
    tags: `${REL_INDEX_PREFIX}tagged.value`,
  },
  IndicatorsFilter: {
    observablesContains: `${REL_INDEX_PREFIX}observable_refs.internal_id_key`
  },
  Indicator: {
    observableRefs: report => observableRefs(report.id)
  },
  Mutation: {
    indicatorsClear: () => clear(),
    indicatorEdit: (_, { id }, { user }) => ({
      delete: () => stixDomainEntityDelete(id),
      fieldPatch: ({ input }) => stixDomainEntityEditField(user, id, input),
      contextPatch: ({ input }) => stixDomainEntityEditContext(user, id, input),
      contextClean: () => stixDomainEntityCleanContext(user, id),
      relationAdd: ({ input }) => stixDomainEntityAddRelation(user, id, input),
      relationDelete: ({ relationId }) => stixDomainEntityDeleteRelation(user, id, relationId)
    }),
    indicatorAdd: (_, { input }, { user }) => addIndicator(user, input)
  }
};

export default indicatorResolvers;