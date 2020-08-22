import { pipe, assoc } from 'ramda';
import {
  findAll as stixCoreRelationshipFindAll,
  stixCoreRelationshipCleanContext,
  stixCoreRelationshipEditContext,
} from './stixCoreRelationship';
import {
  createRelation,
  deleteRelationById,
  getRelationInferredById,
  loadRelationById,
  updateAttribute,
} from '../database/grakn';
import { BUS_TOPICS } from '../config/conf';
import { notify } from '../database/redis';
import { ABSTRACT_STIX_CYBER_OBSERVABLE, ABSTRACT_STIX_CYBER_OBSERVABLE_RELATIONSHIP } from '../schema/general';

export const findAll = (args) =>
  stixCoreRelationshipFindAll(
    args.relationship_type ? args : assoc('parent_type', ABSTRACT_STIX_CYBER_OBSERVABLE_RELATIONSHIP, args)
  );

export const findById = (stixCyberObservableRelationshipId) => {
  if (stixCyberObservableRelationshipId.length !== 36) {
    return getRelationInferredById(stixCyberObservableRelationshipId);
  }
  return loadRelationById(stixCyberObservableRelationshipId, ABSTRACT_STIX_CYBER_OBSERVABLE_RELATIONSHIP);
};

// region mutations
export const addStixCyberObservableRelationship = async (user, input) => {
  const finalInput = pipe(
    assoc('fromType', ABSTRACT_STIX_CYBER_OBSERVABLE),
    assoc('toType', ABSTRACT_STIX_CYBER_OBSERVABLE)
  )(input);
  const created = await createRelation(user, finalInput, { isStixCyberObservableRelationship: true, noLog: true });
  return notify(BUS_TOPICS.StixCyberObservableRelationship.ADDED_TOPIC, created, user);
};

export const stixCyberObservableRelationshipDelete = async (user, stixCyberObservableRelationshipId) => {
  return deleteRelationById(user, stixCyberObservableRelationshipId, ABSTRACT_STIX_CYBER_OBSERVABLE_RELATIONSHIP, {
    noLog: true,
  });
};

export const stixCyberObservableRelationshipCleanContext = (user, stixCyberObservableRelationshipId) =>
  stixCoreRelationshipCleanContext(user, stixCyberObservableRelationshipId);

export const stixCyberObservableRelationshipEditContext = (user, stixCyberObservableRelationshipId, input) =>
  stixCoreRelationshipEditContext(user, stixCyberObservableRelationshipId, input);

export const stixCyberObservableRelationshipEditField = async (user, relationshipId, input) => {
  const stixRelationship = await updateAttribute(user, relationshipId, ABSTRACT_STIX_CYBER_OBSERVABLE_RELATIONSHIP, input, {
    noLog: true,
  });
  return notify(BUS_TOPICS.StixCyberObservableRelationship.EDIT_TOPIC, stixRelationship, user);
};
// endregion
