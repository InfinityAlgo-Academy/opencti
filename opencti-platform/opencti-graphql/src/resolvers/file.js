import { deleteFile, filesListing, loadFile } from '../database/file-storage';
import { askJobImport, uploadImport, uploadPending } from '../domain/file';
import { worksForSource } from '../domain/work';
import { stixCoreObjectImportDelete } from '../domain/stixCoreObject';
import { batchLoader } from '../database/middleware';
import { batchUsers } from '../domain/user';
import { batchStixDomainObjects } from '../domain/stixDomainObject';

const creatorLoader = batchLoader(batchUsers);
const domainLoader = batchLoader(batchStixDomainObjects);

const fileResolvers = {
  Query: {
    file: (_, { id }, context) => loadFile(context, context.user, id),
    importFiles: (_, { first }, context) => filesListing(context, context.user, first, 'import/global/'),
    pendingFiles: (_, { first }, context) => filesListing(context, context.user, first, 'import/pending/'),
  },
  File: {
    works: (file, _, context) => worksForSource(context, context.user, file.id),
  },
  FileMetadata: {
    entity: (metadata, _, context) => domainLoader.load(metadata.entity_id, context, context.user),
    creator: (metadata, _, context) => creatorLoader.load(metadata.creator_id, context, context.user),
  },
  Mutation: {
    uploadImport: (_, { file }, context) => uploadImport(context, context.user, file),
    uploadPending: (_, { file, entityId, labels, errorOnExisting }, context) => {
      return uploadPending(context, context.user, file, entityId, labels, errorOnExisting);
    },
    deleteImport: (_, { fileName }, context) => {
      // Imported file must be handle specifically
      // File deletion must publish a specific event
      // and update the updated_at field of the source entity
      if (fileName.startsWith('import') && !fileName.includes('global') && !fileName.includes('pending')) {
        return stixCoreObjectImportDelete(context, context.user, fileName);
      }
      // If not, a simple deletion is enough
      return deleteFile(context, context.user, fileName);
    },
    askJobImport: (_, args, context) => askJobImport(context, context.user, args),
  },
};

export default fileResolvers;
