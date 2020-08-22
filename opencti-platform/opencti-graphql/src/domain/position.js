import { assoc } from 'ramda';
import { createEntity, escapeString, listEntities, loadEntityById, load } from '../database/grakn';
import { BUS_TOPICS } from '../config/conf';
import { notify } from '../database/redis';
import { ENTITY_TYPE_LOCATION_CITY, ENTITY_TYPE_LOCATION_POSITION } from '../schema/stixDomainObject';
import { RELATION_LOCATED_AT } from '../schema/stixCoreRelationship';
import { ABSTRACT_STIX_DOMAIN_OBJECT } from '../schema/general';

export const findById = (positionId) => {
  return loadEntityById(positionId, ENTITY_TYPE_LOCATION_POSITION);
};

export const findAll = (args) => {
  return listEntities([ENTITY_TYPE_LOCATION_POSITION], ['name', 'description', 'x_opencti_aliases'], args);
};

export const city = async (positionId) => {
  const element = await load(
    `match $to isa ${ENTITY_TYPE_LOCATION_CITY}; 
    $rel(${RELATION_LOCATED_AT}_from:$from, ${RELATION_LOCATED_AT}_to:$to) isa ${RELATION_LOCATED_AT};
    $from has internal_id "${escapeString(positionId)}"; get;`,
    ['to']
  );
  return element && element.to;
};

export const addPosition = async (user, position) => {
  const created = await createEntity(
    user,
    assoc('x_opencti_location_type', ENTITY_TYPE_LOCATION_POSITION, position),
    ENTITY_TYPE_LOCATION_POSITION
  );
  return notify(BUS_TOPICS[ABSTRACT_STIX_DOMAIN_OBJECT].ADDED_TOPIC, created, user);
};
