import * as R from 'ramda';
import {
  batchListThroughGetTo,
  deleteElementById,
  distributionRelations,
  timeSeriesRelations
} from '../database/middleware';
import {
  ABSTRACT_STIX_CORE_OBJECT,
  ABSTRACT_STIX_RELATIONSHIP,
  ENTITY_TYPE_IDENTITY
} from '../schema/general';
import { buildEntityFilters, listEntities, listRelations, storeLoadById } from '../database/middleware-loader';
import {
  isNotEmptyField,
  READ_INDEX_INFERRED_RELATIONSHIPS,
  READ_INDEX_STIX_CORE_RELATIONSHIPS, READ_INDEX_STIX_SIGHTING_RELATIONSHIPS
} from '../database/utils';
import { elCount } from '../database/engine';
import { RELATION_CREATED_BY, RELATION_OBJECT_MARKING } from '../schema/stixRefRelationship';
import { ENTITY_TYPE_MARKING_DEFINITION } from '../schema/stixMetaObject';
import { STIX_SPEC_VERSION, stixCoreRelationshipsMapping } from '../database/stix';
import { UnsupportedError } from '../config/errors';
import { schemaTypesDefinition } from '../schema/schema-types';

export const findAll = async (context, user, args) => {
  return listRelations(context, user, R.propOr(ABSTRACT_STIX_RELATIONSHIP, 'relationship_type', args), args);
};

export const findById = (context, user, stixRelationshipId) => {
  return storeLoadById(context, user, stixRelationshipId, ABSTRACT_STIX_RELATIONSHIP);
};

export const stixRelationshipDelete = async (context, user, stixRelationshipId) => {
  await deleteElementById(context, user, stixRelationshipId, ABSTRACT_STIX_RELATIONSHIP);
  return stixRelationshipId;
};

// region stats
export const stixRelationshipsDistribution = async (context, user, args) => {
  const { dynamicFrom, dynamicTo } = args;
  let finalArgs = args;
  if (isNotEmptyField(dynamicFrom)) {
    const fromArgs = { connectionFormat: false, first: 500, filters: dynamicFrom };
    const fromIds = await listEntities(context, user, [ABSTRACT_STIX_CORE_OBJECT], fromArgs)
      .then((result) => result.map((n) => n.id));
    if (fromIds.length > 0) {
      finalArgs = { ...finalArgs, fromId: args.fromId ? [...fromIds, args.fromId] : fromIds };
    }
  }
  if (isNotEmptyField(dynamicTo)) {
    const toArgs = { connectionFormat: false, first: 500, filters: dynamicTo };
    const toIds = await listEntities(context, user, [ABSTRACT_STIX_CORE_OBJECT], toArgs)
      .then((result) => result.map((n) => n.id));
    if (toIds.length > 0) {
      finalArgs = { ...finalArgs, toId: args.toId ? [...toIds, args.toId] : toIds };
    }
  }
  return distributionRelations(context, context.user, finalArgs);
};
export const stixRelationshipsNumber = async (context, user, args) => {
  const { relationship_type = [ABSTRACT_STIX_RELATIONSHIP], dynamicFrom, dynamicTo } = args;
  let finalArgs = args;
  if (isNotEmptyField(dynamicFrom)) {
    const fromArgs = { connectionFormat: false, first: 500, filters: dynamicFrom };
    const fromIds = await listEntities(context, user, [ABSTRACT_STIX_CORE_OBJECT], fromArgs)
      .then((result) => result.map((n) => n.id));
    if (fromIds.length > 0) {
      finalArgs = { ...finalArgs, fromId: args.fromId ? [...fromIds, args.fromId] : fromIds };
    }
  }
  if (isNotEmptyField(dynamicTo)) {
    const toArgs = { connectionFormat: false, first: 500, filters: dynamicTo };
    const toIds = await listEntities(context, user, [ABSTRACT_STIX_CORE_OBJECT], toArgs)
      .then((result) => result.map((n) => n.id));
    if (toIds.length > 0) {
      finalArgs = { ...finalArgs, toId: args.toId ? [...toIds, args.toId] : toIds };
    }
  }
  const numberArgs = buildEntityFilters({ ...finalArgs, types: relationship_type });
  // eslint-disable-next-line max-len
  const indices = args.onlyInferred ? [READ_INDEX_INFERRED_RELATIONSHIPS] : [READ_INDEX_STIX_CORE_RELATIONSHIPS, READ_INDEX_STIX_SIGHTING_RELATIONSHIPS, READ_INDEX_INFERRED_RELATIONSHIPS];
  return {
    count: elCount(context, user, indices, numberArgs),
    total: elCount(context, user, indices, R.dissoc('endDate', numberArgs)),
  };
};
export const stixRelationshipsMultiTimeSeries = async (context, user, args) => {
  return Promise.all(args.timeSeriesParameters.map(async (timeSeriesParameter) => {
    const { dynamicFrom, dynamicTo } = timeSeriesParameter;
    let finalTimeSeriesParameter = timeSeriesParameter;
    if (isNotEmptyField(dynamicFrom)) {
      const fromArgs = { connectionFormat: false, first: 500, filters: dynamicFrom };
      const fromIds = await listEntities(context, user, [ABSTRACT_STIX_CORE_OBJECT], fromArgs)
        .then((result) => result.map((n) => n.id));
      if (fromIds.length > 0) {
        finalTimeSeriesParameter = { ...finalTimeSeriesParameter, fromId: args.fromId ? [...fromIds, args.fromId] : fromIds };
      }
    }
    if (isNotEmptyField(dynamicTo)) {
      const toArgs = { connectionFormat: false, first: 500, filters: dynamicTo };
      const toIds = await listEntities(context, user, [ABSTRACT_STIX_CORE_OBJECT], toArgs)
        .then((result) => result.map((n) => n.id));
      if (toIds.length > 0) {
        finalTimeSeriesParameter = { ...finalTimeSeriesParameter, toId: args.toId ? [...toIds, args.toId] : toIds };
      }
    }
    return { data: timeSeriesRelations(context, user, { ...args, ...finalTimeSeriesParameter }) };
  }));
};
// endregion

export const batchCreatedBy = async (context, user, stixCoreRelationshipIds) => {
  const batchCreators = await batchListThroughGetTo(
    context,
    user,
    stixCoreRelationshipIds,
    RELATION_CREATED_BY,
    ENTITY_TYPE_IDENTITY
  );
  return batchCreators.map((b) => (b.edges.length > 0 ? R.head(b.edges).node : null));
};

export const batchMarkingDefinitions = (context, user, stixCoreRelationshipIds) => {
  return batchListThroughGetTo(context, user, stixCoreRelationshipIds, RELATION_OBJECT_MARKING, ENTITY_TYPE_MARKING_DEFINITION);
};

export const getSpecVersionOrDefault = ({ spec_version }) => spec_version ?? STIX_SPEC_VERSION;

export const schemaRelationsTypesMapping = () => {
  const entries = Object.entries(stixCoreRelationshipsMapping);
  const flatEntries = [];
  entries.forEach(([key, values]) => {
    const [fromType, toType] = key.split('_');
    const generatedEntries = generateEntries(fromType, toType, values);
    flatEntries.push(...generatedEntries);
  });

  return mergedEntries(flatEntries.map(([key, values]) => {
    return {
      key,
      values: values.map((def) => def.name)
    };
  }));
};

const isParentType = (key) => {
  return schemaTypesDefinition.hasChildren(key);
};

const getChildren = (type) => {
  if (!isParentType(type)) {
    throw UnsupportedError(`${type} is not supported`);
  }

  return schemaTypesDefinition.get(type);
};

const generateEntries = (fromType, toType, values) => {
  if (!isParentType(fromType) && !isParentType(toType)) {
    return [[`${fromType}_${toType}`, values]];
  }

  const entries = [];

  if (isParentType(fromType) && !isParentType(toType)) {
    const children = getChildren(fromType);
    children.forEach((child) => {
      const newEntry = generateEntries(child, toType, values).flat();
      entries.push(newEntry);
    });
  }

  if (!isParentType(fromType) && isParentType(toType)) {
    const children = getChildren(toType);
    children.forEach((child) => {
      const newEntry = generateEntries(fromType, child, values).flat();
      entries.push(newEntry);
    });
  }

  if (isParentType(fromType) && isParentType(toType)) {
    const toTypeChildren = getChildren(toType);
    const fromTypeChildren = getChildren(fromType);

    fromTypeChildren.forEach((fromChild) => {
      toTypeChildren.forEach((toChild) => {
        const newEntry = generateEntries(fromChild, toChild, values).flat();
        entries.push(newEntry);
      });
    });
  }

  return entries;
};

const mergedEntries = (entries) => entries.reduce((result, currentItem) => {
  const existingItem = result.find((item) => item.key === currentItem.key);
  if (existingItem) {
    currentItem.values.forEach((value) => {
      if (!existingItem.values.includes(value)) {
        existingItem.values.push(value);
      }
    });
  } else {
    result.push({ ...currentItem });
  }
  return result;
}, []);
