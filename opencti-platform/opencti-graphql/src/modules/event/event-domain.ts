import type { AuthUser, AuthContext } from '../../types/user';
import { createEntity, storeLoadById } from '../../database/middleware';
import { notify } from '../../database/redis';
import { BUS_TOPICS } from '../../config/conf';
import { ABSTRACT_STIX_DOMAIN_OBJECT } from '../../schema/general';
import type { EventAddInput, QueryEventsArgs } from '../../generated/graphql';
import { listEntitiesPaginated } from '../../database/middleware-loader';
import { BasicStoreEntityEvent, ENTITY_TYPE_EVENT } from './event-types';

export const findById = (context: AuthContext, user: AuthUser, channelId: string): BasicStoreEntityEvent => {
  return storeLoadById(context, user, channelId, ENTITY_TYPE_EVENT) as unknown as BasicStoreEntityEvent;
};

export const findAll = (context: AuthContext, user: AuthUser, opts: QueryEventsArgs) => {
  return listEntitiesPaginated<BasicStoreEntityEvent>(context, user, [ENTITY_TYPE_EVENT], opts);
};

export const addEvent = async (context: AuthContext, user: AuthUser, channel: EventAddInput) => {
  const created = await createEntity(context, user, channel, ENTITY_TYPE_EVENT);
  return notify(BUS_TOPICS[ABSTRACT_STIX_DOMAIN_OBJECT].ADDED_TOPIC, created, user);
};
