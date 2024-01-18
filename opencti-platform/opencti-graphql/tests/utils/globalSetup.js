// region static graphql modules, need to be imported before everything
import '../../src/modules/index';
// import managers
import '../../src/manager/index';
// endregion
import { platformStart, platformStop } from '../../src/boot';
import { deleteBucket } from '../../src/database/file-storage';
import { deleteQueues } from '../../src/domain/connector';
import { ADMIN_USER, createTestUsers, testContext } from './testQuery';
import { elDeleteIndices, elPlatformIndices } from '../../src/database/engine';
import { wait } from '../../src/database/utils';
import { createRedisClient } from '../../src/database/redis';

const platformClean = async () => {
  // Delete the bucket
  await deleteBucket();
  // Delete all rabbitmq queues
  await deleteQueues(testContext, ADMIN_USER);
  // Remove all elastic indices
  const indices = await elPlatformIndices();
  await elDeleteIndices(indices.map((i) => i.index));
  // Delete redis streams
  const testRedisClient = createRedisClient('reset');
  await testRedisClient.del('stream.opencti');
  testRedisClient.disconnect();
};

export async function setup() {
  // Platform cleanup before executing tests
  await platformClean();
  // Start the platform
  await platformStart();
  await wait(15000); // Wait 15 secs for complete platform start
  await createTestUsers();
}

export async function teardown() {
  // Stop the platform
  await platformStop();
}
