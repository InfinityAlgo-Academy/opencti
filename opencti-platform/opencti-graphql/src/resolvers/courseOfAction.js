import { addCourseOfAction, findAll, findById, attackPatterns } from '../domain/courseOfAction';
import {
  stixDomainEntityAddRelation,
  stixDomainEntityCleanContext,
  stixDomainEntityDelete,
  stixDomainEntityDeleteRelation,
  stixDomainEntityEditContext,
  stixDomainEntityEditField
} from '../domain/stixDomainEntity';
import { REL_INDEX_PREFIX } from '../database/elasticSearch';

const courseOfActionResolvers = {
  Query: {
    courseOfAction: (_, { id }) => findById(id),
    coursesOfAction: (_, args) => findAll(args)
  },
  CourseOfAction: {
    attackPatterns: (courseOfAction, args) => attackPatterns(courseOfAction.id, args)
  },
  CoursesOfActionOrdering: {
    tags: `${REL_INDEX_PREFIX}tagged.value`,
    markingDefinitions: `${REL_INDEX_PREFIX}object_marking_refs.definition`
  },
  CoursesOfActionFilter: {
    tags: `${REL_INDEX_PREFIX}tagged.internal_id_key`,
    mitigateBy: `${REL_INDEX_PREFIX}mitigates.internal_id_key`
  },
  Mutation: {
    courseOfActionEdit: (_, { id }, { user }) => ({
      delete: () => stixDomainEntityDelete(id),
      fieldPatch: ({ input }) => stixDomainEntityEditField(user, id, input),
      contextPatch: ({ input }) => stixDomainEntityEditContext(user, id, input),
      contextClean: () => stixDomainEntityCleanContext(user, id),
      relationAdd: ({ input }) => stixDomainEntityAddRelation(user, id, input),
      relationDelete: ({ relationId }) => stixDomainEntityDeleteRelation(user, id, relationId)
    }),
    courseOfActionAdd: (_, { input }, { user }) => addCourseOfAction(user, input)
  }
};

export default courseOfActionResolvers;
