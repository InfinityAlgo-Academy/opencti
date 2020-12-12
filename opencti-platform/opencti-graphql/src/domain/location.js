import { pipe, assoc, dissoc, filter } from 'ramda';
import { createEntity, listEntities, loadById } from '../database/middleware';
import { BUS_TOPICS } from '../config/conf';
import { notify } from '../database/redis';
import { ABSTRACT_STIX_DOMAIN_OBJECT, ENTITY_TYPE_LOCATION } from '../schema/general';
import { isStixDomainObjectLocation } from '../schema/stixDomainObject';

export const findById = async (locationId) => {
  return loadById(locationId, ENTITY_TYPE_LOCATION);
};

export const findAll = async (args) => {
  let types = [];
  if (args.types && args.types.length > 0) {
    types = filter((type) => isStixDomainObjectLocation(type), args.types);
  }
  if (types.length === 0) {
    types.push(ENTITY_TYPE_LOCATION);
  }
  return listEntities(types, args);
};

export const addLocation = async (user, location) => {
  const locationToCreate = pipe(assoc('x_opencti_location_type', location.type), dissoc('type'))(location);
  const created = await createEntity(user, locationToCreate, location.type);
  return notify(BUS_TOPICS[ABSTRACT_STIX_DOMAIN_OBJECT].ADDED_TOPIC, created, user);
};
