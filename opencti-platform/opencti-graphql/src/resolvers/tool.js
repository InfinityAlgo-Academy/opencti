import { addTool, findAll, findById } from '../domain/tool';
import {
  stixDomainEntityAddRelation,
  stixDomainEntityCleanContext,
  stixDomainEntityDelete,
  stixDomainEntityDeleteRelation,
  stixDomainEntityEditContext,
  stixDomainEntityEditField
} from '../domain/stixDomainEntity';
import { killChainPhases } from '../domain/stixEntity';
import { REL_INDEX_PREFIX } from '../database/elasticSearch';

const toolResolvers = {
  Query: {
    tool: (_, { id }) => findById(id),
    tools: (_, args) => findAll(args)
  },
  ToolsOrdering: {
    markingDefinitions: `${REL_INDEX_PREFIX}object_marking_refs.definition`,
    tags: `${REL_INDEX_PREFIX}tagged.value`
  },
  Tool: {
    killChainPhases: tool => killChainPhases(tool.id)
  },
  Mutation: {
    toolEdit: (_, { id }, { user }) => ({
      delete: () => stixDomainEntityDelete(id),
      fieldPatch: ({ input }) => stixDomainEntityEditField(user, id, input),
      contextPatch: ({ input }) => stixDomainEntityEditContext(user, id, input),
      contextClean: () => stixDomainEntityCleanContext(user, id),
      relationAdd: ({ input }) => stixDomainEntityAddRelation(user, id, input),
      relationDelete: ({ relationId }) => stixDomainEntityDeleteRelation(user, id, relationId)
    }),
    toolAdd: (_, { input }, { user }) => addTool(user, input)
  }
};

export default toolResolvers;
