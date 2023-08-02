import type { DomainFindById } from '../../domain/domainTypes';
import type { AuthContext, AuthUser } from '../../types/user';
import {
  EntityOptions, internalFindByIds, internalLoadById, listEntitiesPaginated, storeLoadById
} from '../../database/middleware-loader';
import { createEntity } from '../../database/middleware';
import { notify } from '../../database/redis';
import { BUS_TOPICS } from '../../config/conf';
import {
  ABSTRACT_STIX_DOMAIN_OBJECT,
  buildRefRelationKey,
} from '../../schema/general';
import { isStixId } from '../../schema/schemaUtils';
import { RELATION_OBJECT } from '../../schema/stixRefRelationship';
import {
  BasicStoreEntityThreatActorIndividual,
  ENTITY_TYPE_THREAT_ACTOR_INDIVIDUAL
} from './threatActorIndividual-types';
import type {
  ThreatActorIndividualAddInput
} from '../../generated/graphql';
import { buildPagination } from '../../database/utils';

export const findById: DomainFindById<BasicStoreEntityThreatActorIndividual> = (context: AuthContext, user: AuthUser, threatActorIndividualId: string) => {
  return storeLoadById<BasicStoreEntityThreatActorIndividual>(context, user, threatActorIndividualId, ENTITY_TYPE_THREAT_ACTOR_INDIVIDUAL);
};

export const findAll = (context: AuthContext, user: AuthUser, opts: EntityOptions<BasicStoreEntityThreatActorIndividual>) => {
  return listEntitiesPaginated<BasicStoreEntityThreatActorIndividual>(context, user, [ENTITY_TYPE_THREAT_ACTOR_INDIVIDUAL], opts);
};

export const addThreatActorIndividual = async (context: AuthContext, user: AuthUser, input: ThreatActorIndividualAddInput) => {
  const created = await createEntity(context, user, input, ENTITY_TYPE_THREAT_ACTOR_INDIVIDUAL);
  return notify(BUS_TOPICS[ABSTRACT_STIX_DOMAIN_OBJECT].ADDED_TOPIC, created, user);
};

export const threatActorIndividualContainsStixObjectOrStixRelationship = async (context: AuthContext, user: AuthUser, threatActorIndividualId: string, thingId: string) => {
  const resolvedThingId = isStixId(thingId) ? (await internalLoadById(context, user, thingId)).internal_id : thingId;
  const args = {
    filters: [
      { key: 'internal_id', values: [threatActorIndividualId] },
      { key: buildRefRelationKey(RELATION_OBJECT), values: [resolvedThingId] },
    ],
  };
  const threatActorIndividualFound = await findAll(context, user, args);
  return threatActorIndividualFound.edges.length > 0;
};

export const stixCoreObjectFromContainer = async (context: AuthContext, user: AuthUser, args: { fromId: string, entityType: string, containerType: string }) => {
  const { fromId, entityType, containerType } = args;
  // Retrieve entity type
  const threatActorIndividual = await internalLoadById<BasicStoreEntityThreatActorIndividual>(context, user, fromId, { type: ENTITY_TYPE_THREAT_ACTOR_INDIVIDUAL });
  // Get rel_object.internal_id from entity
  const containerIds = threatActorIndividual['rel_object.internal_id'];
  // Filter on container type
  const containers = await internalFindByIds(context, user, containerIds, { baseData: true })
  const containerTypeIds = containers.filter((o) => o.entity_type === containerType).map((r) => r.internal_id);
  if (containerTypeIds.length === 0) {
    return buildPagination(0, null, [], 0);
  }
  // Retrieve all entities with rel_object.internal_id contains at least one of containerTypeIds
  const opts = {
    filters: [
      { key: buildRefRelationKey(RELATION_OBJECT), values: containerTypeIds, operator: 'match' },
    ],
  };
  return listEntitiesPaginated<BasicStoreEntityThreatActorIndividual>(context, user, [entityType], opts);
}
