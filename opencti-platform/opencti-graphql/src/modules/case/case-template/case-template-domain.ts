import { EntityOptions, listEntitiesPaginated, storeLoadById } from '../../../database/middleware-loader';
import { BasicStoreEntityCaseTemplate, ENTITY_TYPE_CASE_TEMPLATE } from './case-template-types';
import type { CaseTemplateAddInput, EditInput } from '../../../generated/graphql';
import type { DomainFindById } from '../../../domain/domainTypes';
import type { AuthContext, AuthUser } from '../../../types/user';
import { createEntity, deleteElementById, updateAttribute } from '../../../database/middleware';
import { notify } from '../../../database/redis';
import { BUS_TOPICS } from '../../../config/conf';
import { ABSTRACT_INTERNAL_OBJECT } from '../../../schema/general';
import { stixDomainObjectAddRelation } from '../../../domain/stixDomainObject';

export const findById: DomainFindById<BasicStoreEntityCaseTemplate> = (context: AuthContext, user: AuthUser, templateId: string) => {
  return storeLoadById(context, user, templateId, ENTITY_TYPE_CASE_TEMPLATE);
};

export const findAll = (context: AuthContext, user: AuthUser, opts: EntityOptions<BasicStoreEntityCaseTemplate>) => {
  return listEntitiesPaginated<BasicStoreEntityCaseTemplate>(context, user, [ENTITY_TYPE_CASE_TEMPLATE], opts);
};

export const caseTemplateAdd = async (context: AuthContext, user: AuthUser, input: CaseTemplateAddInput) => {
  const { tasks, ...templateInput } = input;
  const created = await createEntity(context, user, templateInput, ENTITY_TYPE_CASE_TEMPLATE);
  await Promise.all(tasks.map(async (task) => {
    await stixDomainObjectAddRelation(context, user, task, { relationship_type: 'object', toId: created.id });
  }));
  return notify(BUS_TOPICS[ABSTRACT_INTERNAL_OBJECT].ADDED_TOPIC, created, user);
};
export const caseTemplateDelete = async (context: AuthContext, user: AuthUser, id: string) => {
  const element = await deleteElementById(context, user, id, ENTITY_TYPE_CASE_TEMPLATE);
  await notify(BUS_TOPICS[ABSTRACT_INTERNAL_OBJECT].DELETE_TOPIC, element, user);
  return id;
};
export const caseTemplateEdit = async (context: AuthContext, user: AuthUser, id: string, input: EditInput[]) => {
  const { element: updatedElem } = await updateAttribute(context, user, id, ENTITY_TYPE_CASE_TEMPLATE, input);
  return notify(BUS_TOPICS[ABSTRACT_INTERNAL_OBJECT].EDIT_TOPIC, updatedElem, user);
};
