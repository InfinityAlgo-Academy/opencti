import { findAll, logsWorkerConfig } from '../domain/log';
import { findById } from '../domain/user';

const logResolvers = {
  Query: {
    logs: (_, args) => findAll(args),
    logsWorkerConfig: () => logsWorkerConfig(),
  },
  Log: {
    event_user: (log) => findById(log.event_user),
  },
  LogsFilter: {
    entity_id: 'event_data.id',
    connection_id: 'event_data.*_ref',
  },
};

export default logResolvers;
