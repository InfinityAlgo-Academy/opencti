import { assoc, propOr, pipe, dissoc } from 'ramda';
import { createEntity, distributionEntities, listEntities, loadById, timeSeriesEntities } from '../database/middleware';
import { BUS_TOPICS } from '../config/conf';
import { notify } from '../database/redis';
import { find as findAttribute, addAttribute } from './attribute';
import { ENTITY_TYPE_CONTAINER_REPORT } from '../schema/stixDomainObject';
import { RELATION_CREATED_BY, RELATION_OBJECT } from '../schema/stixMetaRelationship';
import { ABSTRACT_STIX_DOMAIN_OBJECT, REL_INDEX_PREFIX } from '../schema/general';
import { elCount } from '../database/elasticSearch';
import { READ_INDEX_STIX_DOMAIN_OBJECTS } from '../database/utils';

export const STATUS_STATUS_NEW = 0;
export const STATUS_STATUS_PROGRESS = 1;
export const STATUS_STATUS_ANALYZED = 2;
export const STATUS_STATUS_CLOSED = 3;

export const findById = (user, reportId) => {
  return loadById(user, reportId, ENTITY_TYPE_CONTAINER_REPORT);
};

export const findAll = async (user, args) => {
  return listEntities(user, [ENTITY_TYPE_CONTAINER_REPORT], args);
};

// Entities tab
export const reportContainsStixObjectOrStixRelationship = async (user, reportId, thingId) => {
  const args = {
    filters: [
      { key: 'internal_id', values: [reportId] },
      { key: `${REL_INDEX_PREFIX}${RELATION_OBJECT}.internal_id`, values: [thingId] },
    ],
  };
  const reportFound = await findAll(user, args);
  return reportFound.edges.length > 0;
};

// region series
export const reportsTimeSeries = (user, args) => {
  const { reportClass } = args;
  const filters = reportClass ? [{ isRelation: false, type: 'report_class', value: args.reportClass }] : [];
  return timeSeriesEntities(user, ENTITY_TYPE_CONTAINER_REPORT, filters, args);
};

export const reportsNumber = (user, args) => ({
  count: elCount(user, READ_INDEX_STIX_DOMAIN_OBJECTS, assoc('types', [ENTITY_TYPE_CONTAINER_REPORT], args)),
  total: elCount(
    user,
    READ_INDEX_STIX_DOMAIN_OBJECTS,
    pipe(assoc('types', [ENTITY_TYPE_CONTAINER_REPORT]), dissoc('endDate'))(args)
  ),
});

export const reportsTimeSeriesByEntity = (user, args) => {
  const filters = [{ isRelation: true, type: RELATION_OBJECT, value: args.objectId }];
  return timeSeriesEntities(user, ENTITY_TYPE_CONTAINER_REPORT, filters, args);
};

export const reportsTimeSeriesByAuthor = async (user, args) => {
  const { authorId, reportClass } = args;
  const filters = [{ isRelation: true, type: RELATION_CREATED_BY, value: authorId }];
  if (reportClass) filters.push({ isRelation: false, type: 'report_class', value: reportClass });
  return timeSeriesEntities(user, ENTITY_TYPE_CONTAINER_REPORT, filters, args);
};

export const reportsNumberByEntity = (user, args) => ({
  count: elCount(
    user,
    READ_INDEX_STIX_DOMAIN_OBJECTS,
    pipe(
      assoc('isMetaRelationship', true),
      assoc('types', [ENTITY_TYPE_CONTAINER_REPORT]),
      assoc('relationshipType', RELATION_OBJECT),
      assoc('fromId', args.objectId)
    )(args)
  ),
  total: elCount(
    user,
    READ_INDEX_STIX_DOMAIN_OBJECTS,
    pipe(
      assoc('isMetaRelationship', true),
      assoc('types', [ENTITY_TYPE_CONTAINER_REPORT]),
      assoc('relationshipType', RELATION_OBJECT),
      assoc('fromId', args.objectId),
      dissoc('endDate')
    )(args)
  ),
});

export const reportsNumberByAuthor = (user, args) => ({
  count: elCount(
    user,
    READ_INDEX_STIX_DOMAIN_OBJECTS,
    pipe(
      assoc('isMetaRelationship', true),
      assoc('types', [ENTITY_TYPE_CONTAINER_REPORT]),
      assoc('relationshipType', RELATION_CREATED_BY),
      assoc('fromId', args.authorId)
    )(args)
  ),
  total: elCount(
    user,
    READ_INDEX_STIX_DOMAIN_OBJECTS,
    pipe(
      assoc('isMetaRelationship', true),
      assoc('types', [ENTITY_TYPE_CONTAINER_REPORT]),
      assoc('relationshipType', RELATION_CREATED_BY),
      assoc('fromId', args.authorId),
      dissoc('endDate')
    )(args)
  ),
});

export const reportsDistributionByEntity = async (user, args) => {
  const { objectId } = args;
  const filters = [{ isRelation: true, type: RELATION_OBJECT, value: objectId }];
  return distributionEntities(user, ENTITY_TYPE_CONTAINER_REPORT, filters, args);
};
// endregion

// region mutations
export const addReport = async (user, report) => {
  if (report.report_types) {
    await Promise.all(
      report.report_types.map(async (reportType) => {
        const currentAttribute = await findAttribute(user, 'report_types', reportType);
        if (!currentAttribute) {
          await addAttribute(user, { key: 'report_types', value: reportType });
        }
        return true;
      })
    );
  }
  const finalReport = pipe(
    assoc('created', report.published),
    assoc('x_opencti_report_status', propOr(STATUS_STATUS_NEW, 'x_opencti_report_status', report))
  )(report);
  const created = await createEntity(user, finalReport, ENTITY_TYPE_CONTAINER_REPORT);
  return notify(BUS_TOPICS[ABSTRACT_STIX_DOMAIN_OBJECT].ADDED_TOPIC, created, user);
};
// endregion
