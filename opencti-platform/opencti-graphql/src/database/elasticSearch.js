/* eslint-disable no-underscore-dangle */
import { Client } from '@elastic/elasticsearch';
import { cursorToOffset } from 'graphql-relay/lib/connection/arrayconnection';
import {
  append,
  assoc,
  concat,
  dissoc,
  filter,
  find as Rfind,
  flatten,
  groupBy,
  head,
  includes,
  join,
  last,
  map,
  mergeAll,
  pipe,
  toPairs,
  uniq,
} from 'ramda';
import {
  buildPagination,
  INDEX_INTERNAL_OBJECTS,
  INDEX_STIX_META_OBJECTS,
  INDEX_STIX_DOMAIN_OBJECTS,
  INDEX_STIX_CYBER_OBSERVABLES,
  INDEX_INTERNAL_RELATIONSHIPS,
  INDEX_STIX_CORE_RELATIONSHIPS,
  INDEX_STIX_SIGHTING_RELATIONSHIPS,
  INDEX_STIX_CYBER_OBSERVABLE_RELATIONSHIPS,
  INDEX_STIX_META_RELATIONSHIPS,
  inferIndexFromConceptType,
  pascalize,
} from './utils';
import conf, { logger } from '../config/conf';
import { ConfigurationError, DatabaseError, FunctionalError } from '../config/errors';
import {
  RELATION_CREATED_BY,
  RELATION_KILL_CHAIN_PHASE,
  RELATION_OBJECT_LABEL,
  RELATION_OBJECT_MARKING,
} from '../schema/stixMetaRelationship';
import { BASE_TYPE_RELATION, isAbstract } from '../schema/general';
import { dictReconstruction } from '../schema/fieldDataAdapter';
import { getParentTypes } from '../schema/schemaUtils';

const dateFields = [
  'created',
  'modified',
  'created_at',
  'created_at_day',
  'created_at_month',
  'updated_at',
  'first_seen',
  'first_seen_day',
  'first_seen_month',
  'last_seen',
  'last_seen_day',
  'last_seen_month',
  'start_time',
  'start_time_day',
  'start_time_month',
  'stop_time',
  'stop_time_day',
  'stop_time_month',
  'published',
  'published_day',
  'published_month',
  'valid_from',
  'valid_from_day',
  'valid_from_month',
  'valid_until',
  'valid_until_day',
  'valid_until_month',
  'observable_date',
  'event_date',
];
const numericOrBooleanFields = [
  'object_status',
  'level',
  'attribute_order',
  'base_score',
  'confidence',
  'is_family',
  'number',
  'negative',
  'default_assignation',
  'x_opencti_detection',
  'x_opencti_order',
];

export const REL_INDEX_PREFIX = 'rel_';
export const INDEX_JOBS = 'opencti_jobs';
export const INDEX_HISTORY = 'opencti_history';
const UNIMPACTED_ENTITIES_ROLE = [
  `${RELATION_CREATED_BY}_to`,
  `${RELATION_OBJECT_MARKING}_to`,
  `${RELATION_OBJECT_LABEL}_to`,
  `${RELATION_KILL_CHAIN_PHASE}_to`,
];
export const DATA_INDICES = [
  INDEX_INTERNAL_OBJECTS,
  INDEX_STIX_META_OBJECTS,
  INDEX_STIX_DOMAIN_OBJECTS,
  INDEX_STIX_CYBER_OBSERVABLES,
  INDEX_INTERNAL_RELATIONSHIPS,
  INDEX_STIX_CORE_RELATIONSHIPS,
  INDEX_STIX_SIGHTING_RELATIONSHIPS,
  INDEX_STIX_CYBER_OBSERVABLE_RELATIONSHIPS,
  INDEX_STIX_META_RELATIONSHIPS,
  INDEX_JOBS,
];
export const PLATFORM_INDICES = [INDEX_HISTORY, ...DATA_INDICES];
export const ENTITIES_INDICES = [
  INDEX_INTERNAL_OBJECTS,
  INDEX_STIX_META_OBJECTS,
  INDEX_STIX_DOMAIN_OBJECTS,
  INDEX_STIX_CYBER_OBSERVABLES,
];
export const RELATIONSHIPS_INDICES = [
  INDEX_INTERNAL_RELATIONSHIPS,
  INDEX_STIX_CORE_RELATIONSHIPS,
  INDEX_STIX_SIGHTING_RELATIONSHIPS,
  INDEX_STIX_CYBER_OBSERVABLE_RELATIONSHIPS,
  INDEX_STIX_META_RELATIONSHIPS,
];

export const useCache = (args = {}) => {
  const { noCache = false, infer = false } = args;
  return !infer && !noCache && !conf.get('elasticsearch:noQueryCache');
};
export const el = new Client({ node: conf.get('elasticsearch:url') });

export const elIsAlive = async () => {
  return el
    .info()
    .then((info) => {
      /* istanbul ignore if */
      if (info.meta.connection.status !== 'alive') {
        throw ConfigurationError('ElasticSearch seems down');
      }
      return true;
    })
    .catch(
      /* istanbul ignore next */ () => {
        throw ConfigurationError('ElasticSearch seems down');
      }
    );
};
export const elVersion = () => {
  return el
    .info()
    .then((info) => info.body.version.number)
    .catch(
      /* istanbul ignore next */ () => {
        return 'Disconnected';
      }
    );
};
export const elIndexExists = async (indexName) => {
  const existIndex = await el.indices.exists({ index: indexName });
  return existIndex.body === true;
};
export const elCreateIndexes = async (indexesToCreate = PLATFORM_INDICES) => {
  return Promise.all(
    indexesToCreate.map((index) => {
      return el.indices.exists({ index }).then((result) => {
        if (result.body === false) {
          return el.indices.create({
            index,
            body: {
              settings: {
                index: {
                  max_result_window: 100000,
                },
                analysis: {
                  normalizer: {
                    string_normalizer: {
                      type: 'custom',
                      filter: ['lowercase', 'asciifolding'],
                    },
                  },
                },
              },
              mappings: {
                dynamic_templates: [
                  {
                    integers: {
                      match_mapping_type: 'long',
                      mapping: {
                        type: 'integer',
                      },
                    },
                  },
                  {
                    strings: {
                      match_mapping_type: 'string',
                      mapping: {
                        type: 'text',
                        fields: {
                          keyword: {
                            type: 'keyword',
                            normalizer: 'string_normalizer',
                            ignore_above: 512,
                          },
                        },
                      },
                    },
                  },
                ],
                properties: {
                  confidence: {
                    type: 'integer',
                  },
                  x_opencti_report_status: {
                    type: 'integer',
                  },
                },
              },
            },
          });
        }
        /* istanbul ignore next */
        return result;
      });
    })
  );
};
export const elDeleteIndexes = async (indexesToDelete = DATA_INDICES) => {
  return Promise.all(
    indexesToDelete.map((index) => {
      return el.indices.delete({ index }).catch((err) => {
        /* istanbul ignore next */
        if (err.meta.body && err.meta.body.error.type !== 'index_not_found_exception') {
          logger.error(`[ELASTICSEARCH] Delete indices fail`, { error: err });
        }
      });
    })
  );
};

export const elCount = (indexName, options = {}) => {
  const { endDate = null, types = null, relationshipType = null, fromId = null } = options;
  let must = [];
  if (endDate !== null) {
    must = append(
      {
        range: {
          created_at: {
            format: 'strict_date_optional_time',
            lt: endDate,
          },
        },
      },
      must
    );
  }
  if (types !== null && types.length > 0) {
    const should = types.map((typeValue) => {
      return {
        bool: {
          should: [
            { match_phrase: { 'entity_type.keyword': typeValue } },
            { match_phrase: { 'parent_types.keyword': typeValue } },
          ],
          minimum_should_match: 1,
        },
      };
    });
    must = append(
      {
        bool: {
          should,
          minimum_should_match: 1,
        },
      },
      must
    );
  }
  if (relationshipType !== null) {
    must = append(
      {
        bool: {
          should: {
            match_phrase: { 'relationship_type.keyword': relationshipType },
          },
        },
      },
      must
    );
  }
  if (fromId !== null) {
    must = append(
      {
        bool: {
          should: {
            match_phrase: { 'connections.internal_id': fromId },
          },
          minimum_should_match: 1,
        },
      },
      must
    );
  }
  const query = {
    index: indexName,
    body: {
      query: {
        bool: {
          must,
        },
      },
    },
  };
  logger.debug(`[ELASTICSEARCH] countEntities`, { query });
  return el.count(query).then((data) => {
    return data.body.count;
  });
};
export const elAggregationCount = (type, aggregationField, start, end, filters) => {
  const haveRange = start && end;
  const dateFilter = [];
  if (haveRange) {
    dateFilter.push({
      range: {
        created_at: {
          gte: start,
          lte: end,
        },
      },
    });
  }
  const histoFilters = map((f) => {
    const key = f.isRelation ? `${REL_INDEX_PREFIX}*.internal_id.keyword` : `${f.type}.keyword`;
    return {
      multi_match: {
        fields: [key],
        type: 'phrase',
        query: f.value,
      },
    };
  }, filters);
  const query = {
    index: PLATFORM_INDICES,
    body: {
      size: 10000,
      query: {
        bool: {
          must: concat(dateFilter, histoFilters),
          should: [
            { match_phrase: { 'entity_type.keyword': type } },
            { match_phrase: { 'parent_types.keyword': type } },
          ],
          minimum_should_match: 1,
        },
      },
      aggs: {
        genres: {
          terms: {
            field: `${aggregationField}.keyword`,
            size: 100,
          },
        },
      },
    },
  };
  logger.debug(`[ELASTICSEARCH] aggregationCount`, { query });
  return el.search(query).then((data) => {
    const { buckets } = data.body.aggregations.genres;
    return map((b) => ({ label: pascalize(b.key), value: b.doc_count }), buckets);
  });
};
export const elAggregationRelationsCount = (type, start, end, toTypes, fromId) => {
  const haveRange = start && end;
  const filters = [];
  if (haveRange) {
    filters.push({
      range: {
        start_time: {
          gte: start,
          lte: end,
        },
      },
    });
  }
  filters.push({
    match_phrase: { 'connections.internal_id': fromId },
  });
  for (let index = 0; index < toTypes.length; index += 1) {
    filters.push({
      match_phrase: { 'connections.types': toTypes[index] },
    });
  }
  const query = {
    index: RELATIONSHIPS_INDICES,
    body: {
      size: 10000,
      query: {
        bool: {
          must: concat(
            [
              {
                bool: {
                  should: [
                    { match_phrase: { 'entity_type.keyword': type } },
                    { match_phrase: { 'parent_types.keyword': type } },
                  ],
                  minimum_should_match: 1,
                },
              },
            ],
            filters
          ),
        },
      },
      aggs: {
        genres: {
          terms: {
            field: `connections.types.keyword`,
            size: 100,
          },
        },
      },
    },
  };
  logger.debug(`[ELASTICSEARCH] aggregationRelationsCount`, { query });
  return el.search(query).then((data) => {
    // First need to find all types relations to the fromId
    const types = pipe(
      map((h) => h._source.connections),
      flatten(),
      filter((c) => c.internal_id !== fromId),
      filter((c) => toTypes.length === 0 || includes(head(toTypes), c.types)),
      map((e) => e.types),
      flatten(),
      uniq(),
      filter((f) => !isAbstract(f)),
      map((u) => u.toLowerCase())
    )(data.body.hits.hits);
    const { buckets } = data.body.aggregations.genres;
    const filteredBuckets = filter((b) => includes(b.key, types), buckets);
    return map((b) => ({ label: pascalize(b.key), value: b.doc_count }), filteredBuckets);
  });
};
export const elHistogramCount = async (type, field, interval, start, end, filters) => {
  // const tzStart = moment.parseZone(start).format('Z');
  const histoFilters = map((f) => {
    // eslint-disable-next-line no-nested-ternary
    const key = f.isRelation
      ? f.type
        ? `${REL_INDEX_PREFIX}${f.type}.internal_id`
        : `${REL_INDEX_PREFIX}*.internal_id`
      : `${f.type}.keyword`;
    return {
      multi_match: {
        fields: [key],
        type: 'phrase',
        query: f.value,
      },
    };
  }, filters);
  let dateFormat;
  switch (interval) {
    case 'year':
      dateFormat = 'yyyy';
      break;
    case 'month':
      dateFormat = 'yyyy-MM';
      break;
    case 'day':
      dateFormat = 'yyyy-MM-dd';
      break;
    default:
      throw FunctionalError('Unsupported interval, please choose between year, month or day', interval);
  }
  const query = {
    index: PLATFORM_INDICES,
    _source_excludes: '*', // Dont need to get anything
    body: {
      query: {
        bool: {
          must: concat(
            [
              {
                bool: {
                  should: [
                    { match_phrase: { 'entity_type.keyword': type } },
                    { match_phrase: { 'parent_types.keyword': type } },
                  ],
                  minimum_should_match: 1,
                },
              },
              {
                range: {
                  [field]: {
                    gte: start,
                    lte: end,
                  },
                },
              },
            ],
            histoFilters
          ),
        },
      },
      aggs: {
        count_over_time: {
          date_histogram: {
            field,
            calendar_interval: interval,
            // time_zone: tzStart,
            format: dateFormat,
            keyed: true,
          },
        },
      },
    },
  };
  logger.debug(`[ELASTICSEARCH] histogramCount`, { query });
  return el.search(query).then((data) => {
    const { buckets } = data.body.aggregations.count_over_time;
    const dataToPairs = toPairs(buckets);
    return map((b) => ({ date: head(b), value: last(b).doc_count }), dataToPairs);
  });
};

// region relation reconstruction
const elBuildRelation = (type, connection) => {
  return {
    [type]: null,
    [`${type}Id`]: connection.internal_id,
    [`${type}Role`]: connection.role,
    [`${type}Type`]: head(connection.types),
  };
};
const elMergeRelation = (concept, fromConnection, toConnection) => {
  if (!fromConnection || !toConnection) {
    throw DatabaseError(`[ELASTIC] Something fail in reconstruction of the relation`, concept.internal_id);
  }
  const from = elBuildRelation('from', fromConnection);
  const to = elBuildRelation('to', toConnection);
  return mergeAll([concept, from, to]);
};
export const elReconstructRelation = (concept) => {
  const { connections } = concept;
  const entityType = concept.entity_type;
  const fromConnection = Rfind((connection) => connection.role === `${entityType}_from`, connections);
  const toConnection = Rfind((connection) => connection.role === `${entityType}_to`, connections);
  return elMergeRelation(concept, fromConnection, toConnection);
};
// endregion

// region elastic common loader.
export const specialElasticCharsEscape = (query) => {
  return query.replace(/([+|\-*()~={}[\]:?\\])/g, '\\$1');
};
export const elPaginate = async (indexName, options = {}) => {
  const {
    first = 200,
    after,
    types = null,
    filters = [],
    search = null,
    orderBy = null,
    orderMode = 'asc',
    connectionFormat = true, // TODO @Julien Refactor that
  } = options;
  const offset = after ? cursorToOffset(after) : 0;
  let must = [];
  let mustnot = [];
  let ordering = [];
  if (search !== null && search.length > 0) {
    // Try to decode before search
    let decodedSearch;
    try {
      decodedSearch = decodeURIComponent(search);
    } catch (e) {
      decodedSearch = search;
    }
    const cleanSearch = specialElasticCharsEscape(decodedSearch.trim());
    let finalSearch;
    if (cleanSearch.startsWith('http\\://')) {
      finalSearch = `"*${cleanSearch.replace('http\\://', '')}*"`;
    } else if (cleanSearch.startsWith('https\\://')) {
      finalSearch = `"*${cleanSearch.replace('https\\://', '')}*"`;
    } else if (cleanSearch.startsWith('"')) {
      finalSearch = `${cleanSearch}`;
    } else {
      const splitSearch = cleanSearch.split(/[\s/]+/);
      finalSearch = pipe(
        map((n) => `*${n}*`),
        join(' ')
      )(splitSearch);
    }
    must = append(
      {
        query_string: {
          query: finalSearch,
          analyze_wildcard: true,
          fields: ['name^5', '*'],
        },
      },
      must
    );
  } else {
    must = append({ match_all: {} }, must);
  }
  if (types !== null && types.length > 0) {
    const should = flatten(
      types.map((typeValue) => {
        return [{ match_phrase: { entity_type: typeValue } }, { match_phrase: { parent_types: typeValue } }];
      })
    );
    must = append({ bool: { should, minimum_should_match: 1 } }, must);
  }
  const validFilters = filter((f) => f && f.values.length > 0, filters || []);
  if (validFilters.length > 0) {
    for (let index = 0; index < validFilters.length; index += 1) {
      const valuesFiltering = [];
      const { key, values, operator = 'eq' } = validFilters[index];
      for (let i = 0; i < values.length; i += 1) {
        if (values[i] === null) {
          mustnot = append({ exists: { field: key } }, mustnot);
        } else if (values[i] === 'EXISTS') {
          valuesFiltering.push({ exists: { field: key } });
        } else if (operator === 'eq') {
          const isDateOrNumber = dateFields.includes(key) || numericOrBooleanFields.includes(key);
          valuesFiltering.push({
            match_phrase: { [`${isDateOrNumber ? key : `${key}.keyword`}`]: values[i].toString() },
          });
        } else if (operator === 'match') {
          valuesFiltering.push({
            match_phrase: { [key]: values[i].toString() },
          });
        } else if (operator === 'wildcard') {
          valuesFiltering.push({
            query_string: {
              query: `"${values[i].toString()}"`,
              fields: [key],
            },
          });
        } else {
          valuesFiltering.push({ range: { [key]: { [operator]: values[i] } } });
        }
      }
      must = append({ bool: { should: valuesFiltering, minimum_should_match: 1 } }, must);
    }
  }
  if (orderBy !== null && orderBy.length > 0) {
    const order = {};
    const orderKeyword =
      dateFields.includes(orderBy) || numericOrBooleanFields.includes(orderBy) ? orderBy : `${orderBy}.keyword`;
    order[orderKeyword] = orderMode;
    ordering = append(order, ordering);
    must = append({ exists: { field: orderKeyword } }, must);
  }
  const query = {
    index: indexName,
    _source_excludes: `${REL_INDEX_PREFIX}*`,
    track_total_hits: true,
    body: {
      from: offset,
      size: first,
      sort: ordering,
      query: {
        bool: {
          must,
          must_not: mustnot,
        },
      },
    },
  };
  logger.debug(`[ELASTICSEARCH] paginate`, { query });
  return el
    .search(query)
    .then((data) => {
      const dataWithIds = map((n) => {
        const loadedElement = pipe(assoc('id', n._source.internal_id), assoc('_index', n._index))(n._source);
        if (loadedElement.base_type === BASE_TYPE_RELATION) {
          return elReconstructRelation(loadedElement);
        }
        if (loadedElement.event_data) {
          return assoc('event_data', JSON.stringify(loadedElement.event_data), loadedElement);
        }
        return loadedElement;
      }, data.body.hits.hits);
      if (connectionFormat) {
        const nodeHits = map((n) => ({ node: n }), dataWithIds);
        return buildPagination(first, offset, nodeHits, data.body.hits.total.value);
      }
      return dataWithIds;
    })
    .catch(
      /* istanbul ignore next */ (err) => {
        // Because we create the mapping at element creation
        // We log the error only if its not a mapping not found error
        const numberOfCauses = err.meta.body.error.root_cause.length;
        const invalidMappingCauses = pipe(
          map((r) => r.reason),
          filter((r) => includes('No mapping found for', r))
        )(err.meta.body.error.root_cause);
        // If uncontrolled error, log and propagate
        if (numberOfCauses > invalidMappingCauses.length) {
          logger.error(`[ELASTICSEARCH] Paginate fail`, { error: err });
          throw err;
        } else {
          return connectionFormat ? buildPagination(0, 0, [], 0) : [];
        }
      }
    );
};
const elInternalLoadById = async (id, type = null, elementTypes = ['internal_id'], indices = DATA_INDICES) => {
  const mustTerms = [];
  const idsTermsPerType = map((e) => ({ [`${e}.keyword`]: id }), elementTypes);
  const should = { bool: { should: map((term) => ({ term }), idsTermsPerType), minimum_should_match: 1 } };
  mustTerms.push(should);
  if (type) {
    const shouldType = {
      bool: {
        should: [{ match_phrase: { 'entity_type.keyword': type } }, { match_phrase: { 'parent_types.keyword': type } }],
        minimum_should_match: 1,
      },
    };
    mustTerms.push(shouldType);
  }
  const query = {
    index: indices,
    _source_excludes: `${REL_INDEX_PREFIX}*`,
    body: {
      query: {
        bool: {
          must: mustTerms,
        },
      },
    },
  };
  logger.debug(`[ELASTICSEARCH] elInternalLoadById`, { query });
  const data = await el.search(query);
  const total = data.body.hits.total.value;
  /* istanbul ignore if */
  if (total > 1) {
    const errorMeta = { id, elementTypes, hits: data.body.hits.hits };
    throw DatabaseError('Expect only one response', errorMeta);
  }
  const response = total === 1 ? head(data.body.hits.hits) : null;
  if (!response) return response;
  const loadedElement = assoc('_index', response._index, response._source);
  // Dictionary are stored in STIX json format, we need to recreate what is expected by graphql
  const transformedData = {};
  const dataKeys = Object.keys(loadedElement);
  for (let index = 0; index < dataKeys.length; index += 1) {
    const dataKey = dataKeys[index];
    const attributeValue = loadedElement[dataKey];
    transformedData[dataKey] = dictReconstruction(dataKey, attributeValue);
  }
  // Return the data and reconstruct the relation if needed
  if (transformedData.base_type === BASE_TYPE_RELATION) {
    return elReconstructRelation(transformedData);
  }
  return transformedData;
};
// endregion

export const elLoadById = (id, type = null, indices = DATA_INDICES) => {
  return elInternalLoadById(id, type, ['internal_id'], indices);
};
export const elLoadByStandardId = (id, type = null, indices = DATA_INDICES) => {
  return elInternalLoadById(id, type, ['standard_id'], indices);
};
export const elLoadByStixId = (id, type = null, indices = DATA_INDICES) => {
  return elInternalLoadById(id, type, ['standard_id', 'stix_ids'], indices);
};
export const elBulk = async (args) => {
  return el.bulk(args);
};

/* istanbul ignore next */
export const elReindex = async (indices) => {
  return Promise.all(
    indices.map((indexMap) => {
      return el.reindex({
        timeout: '60m',
        body: {
          source: {
            index: indexMap.source,
          },
          dest: {
            index: indexMap.dest,
          },
        },
      });
    })
  );
};
export const elIndex = async (indexName, documentBody, refresh = true) => {
  const internalId = documentBody.internal_id;
  const entityType = documentBody.entity_type ? documentBody.entity_type : '';
  logger.debug(`[ELASTICSEARCH] index > ${entityType} ${internalId} in ${indexName}`, documentBody);
  await el
    .index({
      index: indexName,
      id: documentBody.internal_id,
      refresh,
      timeout: '60m',
      body: dissoc('_index', documentBody),
    })
    .catch((err) => {
      throw DatabaseError('Error indexing elastic', { error: err, body: documentBody });
    });
  return documentBody;
};
/* istanbul ignore next */
export const elUpdate = (indexName, documentId, documentBody, retry = 5) => {
  return el
    .update({
      id: documentId,
      index: indexName,
      retry_on_conflict: retry,
      timeout: '60m',
      refresh: true,
      body: dissoc('_index', documentBody),
    })
    .catch((err) => {
      throw DatabaseError('Error updating elastic', { error: err, documentId, body: documentBody });
    });
};

export const elDeleteByField = async (indexName, fieldName, value) => {
  const query = {
    match: { [fieldName]: value },
  };
  await el.deleteByQuery({
    index: indexName,
    refresh: true,
    body: { query },
  });
  return value;
};
export const elDeleteInstanceIds = async (ids, indexesToHandle = DATA_INDICES) => {
  logger.debug(`[ELASTICSEARCH] elDeleteInstanceIds`, { ids });
  const terms = map((id) => ({ term: { 'internal_id.keyword': id } }), ids);
  return el.deleteByQuery({
    index: indexesToHandle,
    refresh: true,
    body: {
      query: {
        bool: {
          should: terms,
        },
      },
    },
  });
};
export const elRemoveRelationConnection = async (relationId) => {
  const relation = await elLoadById(relationId);
  const from = await elLoadById(relation.fromId);
  const to = await elLoadById(relation.toId);
  const type = `${REL_INDEX_PREFIX + relation.entity_type}.internal_id`;
  // Update the from entity
  await elUpdate(from._index, relation.fromId, {
    script: {
      source: `if (ctx._source['${type}'] != null) ctx._source['${type}'].removeIf(rel -> rel == params.key);`,
      params: {
        key: relation.toId,
      },
    },
  });
  // Update to to entity
  await elUpdate(to._index, relation.toId, {
    script: {
      source: `if (ctx._source['${type}'] != null) ctx._source['${type}'].removeIf(rel -> rel == params.key);`,
      params: {
        key: relation.fromId,
      },
    },
  });
};

const prepareIndexing = async (elements) => {
  return Promise.all(
    map(async (element) => {
      // Ensure empty list are not indexed
      const thing = {};
      Object.keys(element).forEach((key) => {
        const value = element[key];
        if (Array.isArray(value)) {
          const filteredArray = value.filter((i) => i);
          thing[key] = filteredArray.length > 0 ? filteredArray : [];
        } else {
          thing[key] = value;
        }
      });
      // For relation, index a list of connections.
      if (thing.base_type === BASE_TYPE_RELATION) {
        if (thing.fromRole === undefined || thing.toRole === undefined) {
          throw DatabaseError(
            `[ELASTIC] Cant index relation ${thing.internal_id} connections without from or to`,
            thing
          );
        }
        const connections = [];
        const [from, to] = await Promise.all([elLoadById(thing.fromId), elLoadById(thing.toId)]);
        connections.push({
          internal_id: from.internal_id,
          types: [thing.fromType, ...getParentTypes(thing.toType)],
          role: thing.fromRole,
        });
        connections.push({
          internal_id: to.internal_id,
          types: [thing.toType, ...getParentTypes(thing.toType)],
          role: thing.toRole,
        });
        return pipe(
          assoc('connections', connections),
          // Dissoc from
          dissoc('from'),
          dissoc('fromId'),
          dissoc('fromRole'),
          // Dissoc to
          dissoc('to'),
          dissoc('toId'),
          dissoc('toRole')
        )(thing);
      }
      return thing;
    }, elements)
  );
};
export const elIndexElements = async (elements, retry = 5) => {
  // 00. Relations must be transformed before indexing.
  const transformedElements = await prepareIndexing(elements);
  // 01. Bulk the indexing of row elements
  const body = transformedElements.flatMap((doc) => [
    { index: { _index: inferIndexFromConceptType(doc.entity_type), _id: doc.internal_id } },
    pipe(dissoc('_index'), dissoc('grakn_id'))(doc),
  ]);
  if (body.length > 0) {
    await elBulk({ refresh: true, body });
  }
  // 02. If relation, generate impacts for from and to sides
  const impactedEntities = pipe(
    filter((e) => e.base_type === BASE_TYPE_RELATION),
    map((e) => {
      const { fromRole, toRole } = e;
      const relationshipType = e.entity_type;
      const impacts = [];
      // We impact target entities of the relation only if not global entities like
      // MarkingDefinition (marking) / KillChainPhase (kill_chain_phase) / Label (tagging)
      if (!includes(fromRole, UNIMPACTED_ENTITIES_ROLE)) impacts.push({ from: e.fromId, relationshipType, to: e.toId });
      if (!includes(toRole, UNIMPACTED_ENTITIES_ROLE)) impacts.push({ from: e.toId, relationshipType, to: e.fromId });
      return impacts;
    }),
    flatten,
    groupBy((i) => i.from)
  )(elements);
  const elementsToUpdate = await Promise.all(
    // For each from, generate the
    map(async (entityId) => {
      const entity = await elLoadById(entityId);
      const targets = impactedEntities[entityId];
      // Build document fields to update ( per relation type )
      // rel_membership: [{ internal_id: ID, types: [] }]
      const targetsByRelation = groupBy((i) => i.relationshipType, targets);
      const targetsElements = await Promise.all(
        map(async (relType) => {
          const data = targetsByRelation[relType];
          const resolvedData = await Promise.all(
            map(async (d) => {
              const resolvedTarget = await elLoadById(d.to);
              return resolvedTarget.internal_id;
            }, data)
          );
          return { relation: relType, elements: resolvedData };
        }, Object.keys(targetsByRelation))
      );
      // Create params and scripted update
      const params = {};
      const sources = map((t) => {
        const field = `${REL_INDEX_PREFIX + t.relation}.internal_id`;
        const createIfNotExist = `if (ctx._source['${field}'] == null) ctx._source['${field}'] = [];`;
        const addAllElements = `ctx._source['${field}'].addAll(params['${field}'])`;
        return `${createIfNotExist} ${addAllElements}`;
      }, targetsElements);
      const source = sources.length > 1 ? join(';', sources) : `${head(sources)};`;
      for (let index = 0; index < targetsElements.length; index += 1) {
        const targetElement = targetsElements[index];
        params[`${REL_INDEX_PREFIX + targetElement.relation}.internal_id`] = targetElement.elements;
      }
      // eslint-disable-next-line no-underscore-dangle
      return { _index: entity._index, id: entityId, data: { script: { source, params } } };
    }, Object.keys(impactedEntities))
  );
  const bodyUpdate = elementsToUpdate.flatMap((doc) => [
    // eslint-disable-next-line no-underscore-dangle
    { update: { _index: doc._index, _id: doc.id, retry_on_conflict: retry } },
    dissoc('_index', doc.data),
  ]);
  if (bodyUpdate.length > 0) {
    await elBulk({ refresh: true, timeout: '60m', body: bodyUpdate });
  }
  return transformedElements.length;
};
