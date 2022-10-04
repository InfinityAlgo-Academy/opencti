import { assoc, pipe } from 'ramda';
import { createEntity, storeLoadById, timeSeriesEntities } from '../database/middleware';
import { listEntities } from '../database/middleware-loader';
import { BUS_TOPICS } from '../config/conf';
import { notify } from '../database/redis';
import { ENTITY_TYPE_INCIDENT } from '../schema/stixDomainObject';
import { ABSTRACT_STIX_DOMAIN_OBJECT } from '../schema/general';
import { now } from '../utils/format';

export const findById = (context, user, incidentId) => {
  return storeLoadById(context, user, incidentId, ENTITY_TYPE_INCIDENT);
};

export const findAll = (context, user, args) => {
  return listEntities(context, user, [ENTITY_TYPE_INCIDENT], args);
};

// region time series
export const incidentsTimeSeriesByEntity = async (context, user, args) => {
  const filters = [{ isRelation: true, type: args.relationship_type, value: args.objectId }];
  return timeSeriesEntities(context, user, ENTITY_TYPE_INCIDENT, filters, args);
};

export const incidentsTimeSeries = (context, user, args) => {
  return timeSeriesEntities(context, user, ENTITY_TYPE_INCIDENT, [], args);
};
// endregion

export const addIncident = async (context, user, incident) => {
  const currentDate = now();
  const incidentToCreate = pipe(
    assoc('first_seen', incident.first_seen ? incident.first_seen : currentDate),
    assoc('last_seen', incident.last_seen ? incident.last_seen : currentDate)
  )(incident);
  const created = await createEntity(context, user, incidentToCreate, ENTITY_TYPE_INCIDENT);
  return notify(BUS_TOPICS[ABSTRACT_STIX_DOMAIN_OBJECT].ADDED_TOPIC, created, user);
};
