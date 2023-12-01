import {
  auditsDistribution,
  auditsMultiTimeSeries,
  auditsNumber,
  auditsTimeSeries,
  findAudits,
  findHistory,
  logsWorkerConfig,
} from '../domain/log';
import { batchCreator } from '../domain/user';
import { storeLoadById } from '../database/middleware-loader';
import { ENTITY_TYPE_EXTERNAL_REFERENCE } from '../schema/stixMetaObject';
import { batchLoader } from '../database/middleware';

const creatorLoader = batchLoader(batchCreator);

const logResolvers = {
  Query: {
    logs: (_, args, context) => findHistory(context, context.user, args),
    audits: (_, args, context) => findAudits(context, context.user, args),
    auditsNumber: (_, args, context) => auditsNumber(context, context.user, args),
    auditsTimeSeries: (_, args, context) => auditsTimeSeries(context, context.user, args),
    auditsMultiTimeSeries: (_, args, context) => auditsMultiTimeSeries(context, context.user, args),
    auditsDistribution: (_, args, context) => auditsDistribution(context, context.user, args),
    logsWorkerConfig: () => logsWorkerConfig(),
  },
  Log: {
    user: (log, _, context) => creatorLoader.load(log.applicant_id || log.user_id, context, context.user),
    context_data: (log, _) => (log.context_data?.id ? { ...log.context_data, entity_id: log.context_data.id } : log.context_data),
    raw_data: (log, _, __) => JSON.stringify(log, null, 2),
    context_uri: (log, _, __) => (log.context_data.id ? `/dashboard/id/${log.context_data.id}` : undefined),
    event_status: (log, _, __) => log.event_status ?? 'success',
    event_scope: (log, _, __) => log.event_scope ?? log.event_type, // Retro compatibility
  },
  // Backward compatibility
  ContextData: {
    external_references: (data, _, context) => {
      const refPromises = Promise.all(
        (data.references || []).map((id) => storeLoadById(context, context.user, id, ENTITY_TYPE_EXTERNAL_REFERENCE))
      ).then((refs) => refs.filter((element) => element !== undefined));
      return Promise.resolve(data.external_references ?? [])
        .then((externalReferences) => refPromises.then((refs) => externalReferences.concat(refs)));
    },
  },
};

export default logResolvers;
