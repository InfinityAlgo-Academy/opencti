import { map } from 'ramda';
import { loadFile, upload } from '../database/minio';
import { pushToConnector } from '../database/rabbitmq';
import { connectorsForImport } from './connector';
import { createWork } from './work';
import { logger } from '../config/conf';

const uploadJobImport = async (fileId, fileMime, context = null) => {
  const connectors = await connectorsForImport(fileMime, true);
  if (connectors.length > 0) {
    // Create job and send ask to broker
    const workList = await Promise.all(
      map(
        connector =>
<<<<<<< HEAD
          createWork(connector, null, null, context, fileId).then(({ work, job }) => ({
=======
          createWork(connector, null, null, null, fileId).then(({ work, job }) => ({
>>>>>>> 5ba7067697f91c862cd022a3ada7bd1cb945e2e2
            connector,
            work,
            job
          })),
        connectors
      )
    );
    // Send message to all correct connectors queues
    await Promise.all(
      map(data => {
        const { connector, work, job } = data;
        const message = {
          work_id: work.internal_id_key, // work(id)
          work_context: context,
          job_id: job.internal_id_key, // job(id)
          file_mime: fileMime, // Ex. application/json
          file_path: `/storage/get/${fileId}`, // Path to get the file
          update: true
        };
        return pushToConnector(connector, message);
      }, workList)
    );
  }
};

<<<<<<< HEAD
export const askJobImport = async (filename, context, user) => {
=======
export const askJobImport = async (filename, user) => {
>>>>>>> 5ba7067697f91c862cd022a3ada7bd1cb945e2e2
  logger.debug(`Job > ask import for file ${filename} by ${user.user_email}`);
  const file = await loadFile(filename);
  await uploadJobImport(file.id, file.metaData.mimetype, context);
  return file;
};

export const uploadImport = async (file, user) => {
  const up = await upload(user, 'import', file);
  await uploadJobImport(up.id, up.metaData.mimetype);
  return up;
};
