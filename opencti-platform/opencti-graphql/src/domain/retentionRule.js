import { deleteElementById, updateAttribute } from '../database/middleware';
import { listEntities, storeLoadById } from '../database/middleware-loader';
import { ENTITY_TYPE_RETENTION_RULE } from '../schema/internalObject';
import { generateInternalId, generateStandardId } from '../schema/identifier';
import { elIndex, elPaginate } from '../database/engine';
import { INDEX_INTERNAL_OBJECTS, READ_DATA_INDICES_WITHOUT_INFERRED } from '../database/utils';
import { UnsupportedError } from '../config/errors';
import { utcDate } from '../utils/format';
import { RETENTION_MANAGER_USER } from '../utils/access';
import { convertFiltersToQueryOptions } from '../utils/filtering/filtering-resolution';
import { publishUserAction } from '../listener/UserActionListener';

export const checkRetentionRule = async (context, input) => {
  const { filters, max_retention: maxDays } = input;
  const jsonFilters = filters ? JSON.parse(filters) : null;
  const before = utcDate().subtract(maxDays, 'days');
  const queryOptions = await convertFiltersToQueryOptions(context, RETENTION_MANAGER_USER, jsonFilters, { before });
  const result = await elPaginate(context, RETENTION_MANAGER_USER, READ_DATA_INDICES_WITHOUT_INFERRED, queryOptions);
  return result.pageInfo.globalCount;
};

// input { name, filters }
export const createRetentionRule = async (context, user, input) => {
  // filters must be a valid json
  const { filters } = input;
  try {
    JSON.parse(filters);
  } catch {
    throw UnsupportedError('Retention rule must have valid filters');
  }
  // create the retention rule
  const retentionRuleId = generateInternalId();
  const retentionRule = {
    id: retentionRuleId,
    internal_id: retentionRuleId,
    standard_id: generateStandardId(ENTITY_TYPE_RETENTION_RULE, input),
    entity_type: ENTITY_TYPE_RETENTION_RULE,
    last_execution_date: null,
    last_deleted_count: null,
    remaining_count: null,
    ...input,
  };
  await elIndex(INDEX_INTERNAL_OBJECTS, retentionRule);
  await publishUserAction({
    user,
    event_type: 'mutation',
    event_scope: 'create',
    event_access: 'administration',
    message: `creates retention rule \`${retentionRule.name}\``,
    context_data: { id: retentionRuleId, entity_type: ENTITY_TYPE_RETENTION_RULE, input }
  });
  return retentionRule;
};

export const retentionRuleEditField = async (context, user, retentionRuleId, input) => {
  const { element } = await updateAttribute(context, user, retentionRuleId, ENTITY_TYPE_RETENTION_RULE, input);
  await publishUserAction({
    user,
    event_type: 'mutation',
    event_scope: 'update',
    event_access: 'administration',
    message: `updates \`${input.map((i) => i.key).join(', ')}\` for retention rule \`${element.name}\``,
    context_data: { id: retentionRuleId, entity_type: ENTITY_TYPE_RETENTION_RULE, input }
  });
  return element;
};

export const deleteRetentionRule = async (context, user, retentionRuleId) => {
  const deleted = await deleteElementById(context, user, retentionRuleId, ENTITY_TYPE_RETENTION_RULE);
  await publishUserAction({
    user,
    event_type: 'mutation',
    event_scope: 'delete',
    event_access: 'administration',
    message: `deletes retention rule \`${deleted.name}\``,
    context_data: { id: retentionRuleId, entity_type: ENTITY_TYPE_RETENTION_RULE, input: deleted }
  });
  return retentionRuleId;
};

export const findById = async (context, user, retentionRuleId) => {
  return storeLoadById(context, user, retentionRuleId, ENTITY_TYPE_RETENTION_RULE);
};

export const findAll = (context, user, args) => {
  return listEntities(context, user, [ENTITY_TYPE_RETENTION_RULE], args);
};
