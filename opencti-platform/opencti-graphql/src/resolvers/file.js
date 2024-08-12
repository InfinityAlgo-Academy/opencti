import { loadFile } from '../database/file-storage';
import { askJobImport, batchFileMarkingDefinitions, deleteImport, filesMetrics, uploadImport, uploadPending } from '../domain/file';
import { worksForSource } from '../domain/work';
import { batchLoader } from '../database/middleware';
import { batchCreator } from '../domain/user';
import { batchStixDomainObjects } from '../domain/stixDomainObject';
import { paginatedForPathWithEnrichment } from '../modules/internal/document/document-domain';

const creatorLoader = batchLoader(batchCreator);
const domainLoader = batchLoader(batchStixDomainObjects);
const markingDefinitionsLoader = batchLoader(batchFileMarkingDefinitions);

const fileResolvers = {
  Query: {
    file: (_, { id }, context) => loadFile(context, context.user, id),
    importFiles: (_, opts, context) => {
      return paginatedForPathWithEnrichment(context, context.user, 'import/global', undefined, opts);
    },
    pendingFiles: (_, opts, context) => { // correspond to global workbenches (i.e. worbenches in Data > Import)
      return paginatedForPathWithEnrichment(context, context.user, 'import/pending', undefined, opts);
    },
    filesMetrics: (_, args, context) => filesMetrics(context, context.user),
  },
  File: {
    objectMarking: (rel, _, context) => markingDefinitionsLoader.load(rel, context, context.user),
    works: (file, _, context) => worksForSource(context, context.user, file.id),
  },
  FileMetadata: {
    entity: (metadata, _, context) => domainLoader.load(metadata.entity_id, context, context.user),
    creator: (metadata, _, context) => creatorLoader.load(metadata.creator_id, context, context.user),
  },
  Mutation: {
    uploadImport: (_, args, context) => uploadImport(context, context.user, args),
    uploadPending: (_, { file, entityId, labels, errorOnExisting, refreshEntity }, context) => {
      return uploadPending(context, context.user, file, entityId, labels, errorOnExisting, refreshEntity);
    },
    deleteImport: (_, { fileName }, context) => deleteImport(context, context.user, fileName),
    askJobImport: (_, args, context) => askJobImport(context, context.user, args),
  },
};

export default fileResolvers;
