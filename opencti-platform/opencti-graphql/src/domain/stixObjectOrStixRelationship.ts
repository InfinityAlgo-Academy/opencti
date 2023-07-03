import { elLoadById } from '../database/engine';
import { READ_PLATFORM_INDICES } from '../database/utils';
import { storeLoadById } from '../database/middleware-loader';
import { ABSTRACT_STIX_REF_RELATIONSHIP } from '../schema/general';
import { FunctionalError } from '../config/errors';
import { isStixRefRelationship } from '../schema/stixRefRelationship';
import { createRelation, createRelations, deleteRelationsByFromAndTo } from '../database/middleware';
import { notify } from '../database/redis';
import { BUS_TOPICS } from '../config/conf';
import type { AuthContext, AuthUser } from '../types/user';
import type { StixRefRelationshipAddInput, StixRefRelationshipsAddInput } from '../generated/graphql';

type BusTopicsKeyType = keyof typeof BUS_TOPICS;

export const findById = async (context: AuthContext, user: AuthUser, id: string) => {
  return elLoadById(context, user, id, { indices: READ_PLATFORM_INDICES });
};

export const stixObjectOrRelationshipAddRefRelation = async (
  context: AuthContext,
  user: AuthUser,
  stixObjectOrRelationshipId: string,
  input: StixRefRelationshipAddInput,
  type: string
) => {
  const stixObjectOrRelationship = await storeLoadById(context, user, stixObjectOrRelationshipId, type);
  if (!stixObjectOrRelationship) {
    throw FunctionalError('Cannot add the relation, Stix-Object or Stix-Relationship cannot be found.');
  }
  const finalInput = { ...input, fromId: stixObjectOrRelationshipId };
  if (!isStixRefRelationship(finalInput.relationship_type)) {
    throw FunctionalError(`Only ${ABSTRACT_STIX_REF_RELATIONSHIP} can be added through this method.`);
  }
  const relation = await createRelation(context, user, finalInput);
  await notify(BUS_TOPICS[type as BusTopicsKeyType].EDIT_TOPIC, relation.from, user);
  return relation;
};
export const stixObjectOrRelationshipAddRefRelations = async (
  context: AuthContext,
  user: AuthUser,
  stixObjectOrRelationshipId: string,
  input: StixRefRelationshipsAddInput,
  type: string,
  opts = {}
) => {
  const stixObjectOrRelationship = await storeLoadById(context, user, stixObjectOrRelationshipId, type);
  if (!stixObjectOrRelationship) {
    throw FunctionalError('Cannot add the relation, Stix-Object or Stix-Relationship cannot be found.');
  }
  if (!isStixRefRelationship(input.relationship_type)) {
    throw FunctionalError(`Only ${ABSTRACT_STIX_REF_RELATIONSHIP} can be added through this method.`);
  }
  const finalInput = input.toIds?.map(
    (n) => ({ fromId: stixObjectOrRelationshipId, toId: n, relationship_type: input.relationship_type })
  ) ?? [];
  await createRelations(context, user, finalInput, opts);
  const entity = await storeLoadById(context, user, stixObjectOrRelationshipId, type);
  await notify(BUS_TOPICS[type as BusTopicsKeyType].EDIT_TOPIC, entity, user);
  return entity;
};

export const stixObjectOrRelationshipDeleteRefRelation = async (
  context: AuthContext,
  user: AuthUser,
  stixObjectOrRelationshipId: string,
  toId: string,
  relationshipType: string,
  type: string,
  opts = {}
): Promise<any> => { // TODO remove any when all resolvers in ts
  const stixObjectOrRelationship = await storeLoadById(context, user, stixObjectOrRelationshipId, type);
  if (!stixObjectOrRelationship) {
    throw FunctionalError('Cannot delete the relation, Stix-Object or Stix-Relationship cannot be found.');
  }
  if (!isStixRefRelationship(relationshipType)) {
    throw FunctionalError(`Only ${ABSTRACT_STIX_REF_RELATIONSHIP} can be deleted through this method.`);
  }
  const { from, to } = await deleteRelationsByFromAndTo(context, user, stixObjectOrRelationshipId, toId, relationshipType, ABSTRACT_STIX_REF_RELATIONSHIP, opts);
  await notify((BUS_TOPICS[type as BusTopicsKeyType]).EDIT_TOPIC, from, user);
  return { ...stixObjectOrRelationship, from, to };
};
