import { assoc } from 'ramda';
import {
  findAll as stixRelationFindAll,
  findByStixId as stixRelationFindByStixId,
  search as searchStixRelations,
  findAllWithInferences as findAllWithInferencesStixRelations,
  findById as findByIdStixRelation,
  findByIdInferred as findByIdInferredStixRelation,
  stixRelationDelete,
  stixRelationCleanContext,
  stixRelationEditContext,
  stixRelationEditField,
  stixRelationAddRelation,
  stixRelationDeleteRelation
} from './stixRelation';
import { createRelation } from '../database/grakn';
import { BUS_TOPICS } from '../config/conf';
import { notify } from '../database/redis';

export const findAll = args =>
  stixRelationFindAll(args.relationType ? args : assoc('relationType', 'stix_observable_relation', args));

export const findByStixId = args => stixRelationFindByStixId(args);

export const search = args =>
  searchStixRelations(args.relationType ? args : assoc('relationType', 'stix_observable_relation', args));

export const findAllWithInferences = async args =>
  findAllWithInferencesStixRelations(
    args.relationType ? args : assoc('relationType', 'stix_observable_relation', args)
  );

export const findById = stixObservableRelationId => findByIdStixRelation(stixObservableRelationId);

export const findByIdInferred = stixObservableRelationId => {
  return findByIdInferredStixRelation(stixObservableRelationId);
};

// region mutations
export const addStixObservableRelation = async (user, stixObservableRelation, reversedReturn = false) => {
  const created = await createRelation(stixObservableRelation.fromId, stixObservableRelation, {
    reversedReturn,
    isStixObservableRelation: true
  });
  return notify(BUS_TOPICS.stixObservableRelation.ADDED_TOPIC, created, user);
};
export const stixObservableRelationDelete = async stixObservableRelationId =>
  stixRelationDelete(stixObservableRelationId);

export const stixObservableRelationCleanContext = (user, stixObservableRelationId) =>
  stixRelationCleanContext(user, stixObservableRelationId);

export const stixObservableRelationEditContext = (user, stixObservableRelationId, input) =>
  stixRelationEditContext(user, stixObservableRelationId, input);

export const stixObservableRelationEditField = (user, stixObservableRelationId, input) =>
  stixRelationEditField(user, stixObservableRelationId, input);

export const stixObservableRelationAddRelation = (user, stixObservableRelationId, input) =>
  stixRelationAddRelation(user, stixObservableRelationId, input);

export const stixObservableRelationDeleteRelation = (user, stixObservableRelationId, relationId) =>
  stixRelationDeleteRelation(user, stixObservableRelationId, relationId);
// endregion
