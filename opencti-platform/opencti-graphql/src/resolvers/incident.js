import {
  addIncident,
  batchParticipants,
  findAll,
  findById,
  incidentsTimeSeries,
  incidentsTimeSeriesByEntity
} from '../domain/incident';
import {
  stixDomainObjectAddRelation,
  stixDomainObjectCleanContext,
  stixDomainObjectDelete,
  stixDomainObjectDeleteRelation,
  stixDomainObjectEditContext,
  stixDomainObjectEditField,
} from '../domain/stixDomainObject';
import { RELATION_OBJECT_ASSIGNEE } from '../schema/stixRefRelationship';
import { buildRefRelationKey } from '../schema/general';
import { batchLoader } from '../database/middleware';

const participantLoader = batchLoader(batchParticipants);

const incidentResolvers = {
  Query: {
    incident: (_, { id }, context) => findById(context, context.user, id),
    incidents: (_, args, context) => findAll(context, context.user, args),
    incidentsTimeSeries: (_, args, context) => {
      if (args.objectId && args.objectId.length > 0) {
        return incidentsTimeSeriesByEntity(context, context.user, args);
      }
      return incidentsTimeSeries(context, context.user, args);
    },
  },
  Incident: {
    objectParticipant: (current, _, context) => participantLoader.load(current.id, context, context.user),
  },
  IncidentsOrdering: {
    objectAssignee: buildRefRelationKey(RELATION_OBJECT_ASSIGNEE),
  },
  Mutation: {
    incidentEdit: (_, { id }, context) => ({
      delete: () => stixDomainObjectDelete(context, context.user, id),
      fieldPatch: ({ input, commitMessage, references }) => stixDomainObjectEditField(context, context.user, id, input, { commitMessage, references }),
      contextPatch: ({ input }) => stixDomainObjectEditContext(context, context.user, id, input),
      contextClean: () => stixDomainObjectCleanContext(context, context.user, id),
      relationAdd: ({ input }) => stixDomainObjectAddRelation(context, context.user, id, input),
      relationDelete: ({ toId, relationship_type: relationshipType }) => stixDomainObjectDeleteRelation(context, context.user, id, toId, relationshipType),
    }),
    incidentAdd: (_, { input }, context) => addIncident(context, context.user, input),
  },
};

export default incidentResolvers;
