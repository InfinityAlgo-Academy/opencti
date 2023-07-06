import { elUpdateByQueryForMigration } from '../database/engine';
import { READ_INDEX_INTERNAL_OBJECTS } from '../database/utils';
import { DatabaseError } from '../config/errors';
import { convertTypeToStixType } from '../database/stix-converter';

const entityTypeChange = (fromType, toType, indices) => {
  const updateQuery = {
    script: {
      params: { toType, prefix: convertTypeToStixType(toType) },
      source: "ctx._source.entity_type = params.toType; ctx._source.standard_id = (params.prefix + '--' + ctx._source.standard_id.splitOnToken('--')[1]);",
    },
    query: {
      bool: {
        must: [
          { term: { 'entity_type.keyword': { value: fromType } } },
        ],
      },
    },
  };
  const message = `[MIGRATION] Rewriting entity type from ${fromType} to ${toType}`;
  return elUpdateByQueryForMigration(message, indices, updateQuery).catch((err) => {
    throw DatabaseError('Error updating elastic', { error: err });
  });
};

export const up = async (next) => {
  // Change Task entity types to BackgroundTask
  await entityTypeChange('Task', 'BackgroundTask', READ_INDEX_INTERNAL_OBJECTS);
  next();
};

export const down = async (next) => {
  next();
};
