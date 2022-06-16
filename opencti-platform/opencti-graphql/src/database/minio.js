import * as Minio from 'minio';
import * as He from 'he';
import * as R from 'ramda';
import querystring from 'querystring';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import conf, { booleanConf, configureCA, logApp, logAudit } from '../config/conf';
import { buildPagination } from './utils';
import { loadExportWorksAsProgressFiles, deleteWorkForFile } from '../domain/work';
import { now, sinceNowInMinutes } from '../utils/format';
import { DatabaseError } from '../config/errors';
import { UPLOAD_ACTION } from '../config/audit';

const bucketName = conf.get('minio:bucket_name') || 'opencti-bucket';
const bucketRegion = conf.get('minio:bucket_region') || 'us-east-1';
const excludedFiles = conf.get('minio:excluded_files') || ['.DS_Store'];

const getMinioClient = async () => {
  const minioConfig = {
    endPoint: conf.get('minio:endpoint'),
    port: conf.get('minio:port') || 9000,
    useSSL: booleanConf('minio:use_ssl', false),
    accessKey: String(conf.get('minio:access_key')),
    secretKey: String(conf.get('minio:secret_key')),
    reqOptions: {
      ...configureCA(conf.get('minio:ca')),
      servername: conf.get('minio:endpoint'),
    },
  };

  // Attempt to fetch AWS role for authentication if enabled
  if (booleanConf('minio:use_aws_role', false)) {
    try {
      const credentialProvider = fromNodeProviderChain();
      const awsCredentials = await credentialProvider();

      minioConfig.accessKey = awsCredentials.accessKeyId;
      minioConfig.secretKey = awsCredentials.secretAccessKey;
      minioConfig.sessionToken = awsCredentials.sessionToken;
    } catch (e) {
      logApp.error('[MINIO] Failed to fetch AWS role credentials', { error: e });
    }
  }

  return new Minio.Client(minioConfig);
};

export const initializeMinioBucket = async () => {
  const minioClient = await getMinioClient();

  return new Promise((resolve, reject) => {
    try {
      minioClient.bucketExists(bucketName, (existErr, exists) => {
        if (existErr) {
          reject(existErr);
          return;
        }
        if (!exists) {
          minioClient.makeBucket(bucketName, bucketRegion, (createErr) => {
            if (createErr) reject(createErr);
            resolve(true);
          });
        }
        resolve(exists);
      });
    } catch (e) {
      reject(e);
    }
  });
};

export const isStorageAlive = () => {
  return initializeMinioBucket();
};

export const deleteFile = async (user, id) => {
  const minioClient = await getMinioClient();

  logApp.debug(`[MINIO] delete file ${id} by ${user.user_email}`);
  await minioClient.removeObject(bucketName, id);
  await deleteWorkForFile(user, id);
  return true;
};

export const deleteFiles = async (user, ids) => {
  logApp.debug(`[MINIO] delete files ${ids} by ${user.user_email}`);
  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i];
    await deleteFile(user, id);
  }
  return true;
};

export const downloadFile = async (id) => {
  const minioClient = await getMinioClient();

  try {
    return minioClient.getObject(bucketName, id);
  } catch (err) {
    logApp.info('[OPENCTI] Cannot retrieve file on MinIO', { error: err });
    return null;
  }
};

export const getFileContent = (id) => {
  return new Promise((resolve, reject) => {
    getMinioClient().then((minioClient) => {
      let str = '';

      minioClient.getObject(bucketName, id, (err, stream) => {
        stream.on('data', (data) => {
          str += data.toString('utf-8');
        });
        stream.on('end', () => {
          resolve(str);
        });
        stream.on('error', (error) => {
          reject(error);
        });
      });
    }).catch((err) => {
      reject(err);
    });
  });
};

export const storeFileConverter = (user, file) => {
  return {
    id: file.id,
    name: file.name,
    version: file.metaData.version,
    mime_type: file.metaData.mimetype,
  };
};

export const loadFile = async (user, filename) => {
  const minioClient = await getMinioClient();

  try {
    const stat = await minioClient.statObject(bucketName, filename);
    return {
      id: filename,
      name: querystring.unescape(stat.metaData.filename),
      size: stat.size,
      information: '',
      lastModified: stat.lastModified,
      lastModifiedSinceMin: sinceNowInMinutes(stat.lastModified),
      metaData: { ...stat.metaData, messages: [], errors: [] },
      uploadStatus: 'complete',
    };
  } catch (err) {
    throw DatabaseError('File not found', { user_id: user.id, filename });
  }
};

const isFileObjectExcluded = (id) => {
  const fileName = id.includes('/') ? R.last(id.split('/')) : id;
  return excludedFiles.map((e) => e.toLowerCase()).includes(fileName.toLowerCase());
};
export const rawFilesListing = (user, directory, recursive = false) => {
  return new Promise((resolve, reject) => {
    getMinioClient().then((minioClient) => {
      const files = [];
      const stream = minioClient.listObjectsV2(bucketName, directory, recursive);
      stream.on('data', async (obj) => {
        if (obj.name && !isFileObjectExcluded(obj.name)) {
          files.push(R.assoc('id', obj.name, obj));
        }
      });
      /* istanbul ignore next */
      stream.on('error', (e) => {
        logApp.error('[MINIO] Error listing files', { error: e });
        reject(e);
      });
      stream.on('end', () => resolve(files));
    }).catch((err) => {
      reject(err);
    });
  }).then((files) => {
    return Promise.all(
      R.map((elem) => {
        const filename = He.decode(elem.name);
        return loadFile(user, filename);
      }, files)
    );
  });
};

export const upload = async (user, path, fileUpload, metadata = {}) => {
  const minioClient = await getMinioClient();

  const { createReadStream, filename, mimetype, encoding = '', version = now() } = await fileUpload;
  logAudit.info(user, UPLOAD_ACTION, { path, filename, metadata });
  const escapeName = querystring.escape(filename);
  const internalMeta = { filename: escapeName, mimetype, encoding, version };
  const fileMeta = { ...metadata, ...internalMeta };
  const fileDirName = `${path}/${filename}`;
  logApp.debug(`[MINIO] Upload file ${fileDirName} by ${user.user_email}`);
  // Upload the file in the storage
  return new Promise((resolve, reject) => {
    const fileStream = createReadStream();
    minioClient.putObject(bucketName, fileDirName, fileStream, null, fileMeta, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve(loadFile(user, fileDirName));
    });
  });
};

export const filesListing = async (user, first, path, entityId = null) => {
  const files = await rawFilesListing(user, path);
  const inExport = await loadExportWorksAsProgressFiles(user, path);
  const allFiles = R.concat(inExport, files);
  const sortedFiles = R.sort((a, b) => b.lastModified - a.lastModified, allFiles);
  let fileNodes = R.map((f) => ({ node: f }), sortedFiles);
  if (entityId) {
    fileNodes = R.filter((n) => n.node.metaData.entity_id === entityId, fileNodes);
  }
  return buildPagination(first, null, fileNodes, allFiles.length);
};

export const deleteAllFiles = async (user, path) => {
  const files = await rawFilesListing(user, path);
  const inExport = await loadExportWorksAsProgressFiles(user, path);
  const allFiles = R.concat(inExport, files);
  return Promise.all(allFiles.map((file) => deleteFile(user, file.id)));
};
