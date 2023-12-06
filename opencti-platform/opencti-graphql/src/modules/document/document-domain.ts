import * as R from 'ramda';
import { v4 as uuidv4 } from 'uuid';
import { generateFileIndexId } from '../../schema/identifier';
import { ENTITY_TYPE_INTERNAL_FILE } from '../../schema/internalObject';
import { elDeleteInstances, elIndex } from '../../database/engine';
import { INDEX_INTERNAL_OBJECTS, isEmptyField } from '../../database/utils';
import {
  type EntityOptions,
  type FilterGroupWithNested,
  internalLoadById,
  listEntitiesPaginated,
  storeLoadById
} from '../../database/middleware-loader';
import type { AuthContext, AuthUser } from '../../types/user';
import { type DomainFindById } from '../../domain/domainTypes';
import type { BasicStoreEntityDocument } from './document-types';
import type { BasicStoreCommon } from '../../types/store';
import { FilterMode, FilterOperator } from '../../generated/graphql';
import { loadExportWorksAsProgressFiles } from '../../domain/work';
import { UnsupportedError } from '../../config/errors';

export const indexFileToDocument = async (path: string, file: any) => {
  const standardId = generateFileIndexId(file.id);
  const fileData = R.dissoc('id', file);
  const data = {
    internal_id: file.id,
    standard_id: standardId,
    entity_type: ENTITY_TYPE_INTERNAL_FILE,
    file_path: path,
    ...fileData,
  };
  await elIndex(INDEX_INTERNAL_OBJECTS, data);
};

export const deleteDocumentIndex = async (context: AuthContext, user: AuthUser, id: string) => {
  const internalFile = await storeLoadById(context, user, id, ENTITY_TYPE_INTERNAL_FILE);
  if (internalFile) {
    await elDeleteInstances([internalFile]);
  }
};

export const findById: DomainFindById<BasicStoreEntityDocument> = (context: AuthContext, user: AuthUser, fileId: string) => {
  return storeLoadById<BasicStoreEntityDocument>(context, user, fileId, ENTITY_TYPE_INTERNAL_FILE);
};

export const findAll = (context: AuthContext, user: AuthUser, opts: EntityOptions<BasicStoreEntityDocument>) => {
  return listEntitiesPaginated<BasicStoreEntityDocument>(context, user, [ENTITY_TYPE_INTERNAL_FILE], opts);
};

interface PrefixOptions<T extends BasicStoreCommon> extends EntityOptions<T> {
  entity_id?: string
  modifiedSince?: string
  prefixMimeTypes?: string[]
  maxFileSize?: number
  excludedPaths?: string[]
}

export const findForPaths = async (context: AuthContext, user: AuthUser, paths: string[], opts?: PrefixOptions<BasicStoreEntityDocument>) => {
  const filters: FilterGroupWithNested = {
    mode: FilterMode.And,
    filters: [{ key: ['file_path'], values: paths, operator: FilterOperator.StartsWith }],
    filterGroups: []
  };
  if (opts?.excludedPaths && opts?.excludedPaths.length > 0) {
    filters.filters.push({ key: ['file_path'], values: opts.excludedPaths, operator: FilterOperator.NotStartsWith });
  }
  if (opts?.prefixMimeTypes && opts?.prefixMimeTypes.length > 0) {
    filters.filters.push({ key: ['metaData.mimetype'], values: opts.prefixMimeTypes, operator: FilterOperator.StartsWith });
  }
  if (opts?.modifiedSince) {
    filters.filters.push({ key: ['lastModified'], values: [opts.modifiedSince], operator: FilterOperator.Gt });
  }
  if (opts?.entity_id) {
    filters.filters.push({ key: ['metaData.entity_id'], values: [opts.entity_id] });
  }
  if (opts?.maxFileSize) {
    filters.filters.push({ key: ['size'], values: [String(opts.maxFileSize)], operator: FilterOperator.Lte });
  }
  const findOpts: EntityOptions<BasicStoreEntityDocument> = {
    filters,
    noFiltersChecking: true // No associated model
  };
  const listOptions = { ...opts, ...findOpts };
  const pagination = await listEntitiesPaginated<BasicStoreEntityDocument>(context, user, [ENTITY_TYPE_INTERNAL_FILE], listOptions);
  // region enrichment only possible for single path resolution
  // Enrich pagination for import images
  if (paths.length === 1 && paths[0].startsWith('import/') && opts?.entity_id) {
    const entity = await internalLoadById(context, user, opts.entity_id);
    if (isEmptyField(entity)) {
      // User has no access to this entity, files cannot be listed.
      throw UnsupportedError('FILES_LIST', { entity_id: opts.entity_id });
    }
    // Get files information to complete
    const internalFiles = entity?.x_opencti_files ?? [];
    if (internalFiles.length > 0) {
      const internalFilesMap = new Map(internalFiles.map((f) => [f.id, f]));
      for (let index = 0; index < pagination.edges.length; index += 1) {
        const edge = pagination.edges[index];
        const existingFile = internalFilesMap.get(edge.node.id);
        if (existingFile) {
          edge.node.metaData.order = existingFile.order;
          edge.node.metaData.description = existingFile.description;
          edge.node.metaData.inCarousel = existingFile.inCarousel;
        }
      }
    }
  }
  // Enrich pagination for ongoing exports
  if (paths.length === 1 && paths[0].startsWith('export/')) {
    const progressFiles = await loadExportWorksAsProgressFiles(context, user, paths[0]);
    pagination.edges = [...progressFiles.map((p: any) => ({ node: p, cursor: uuidv4() })), ...pagination.edges];
  }
  // endregion
  return pagination;
};
