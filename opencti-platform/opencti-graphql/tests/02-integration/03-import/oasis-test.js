import platformInit from '../../../src/initialization';
import { FIVE_MINUTES, PYTHON_PATH, API_TOKEN, API_URI, testContext, ADMIN_USER } from '../../utils/testQuery';
import { execChildPython } from '../../../src/python/pythonBridge';
import { shutdownModules, startModules } from '../../../src/modules';

describe('Database provision', () => {
  const importOpts = [API_URI, API_TOKEN, './tests/data/poisonivy.json'];
  it(
    'should platform init',
    () => {
      return expect(platformInit()).resolves.toBe(true);
    },
    FIVE_MINUTES
  );
  it(
    'Should import creation succeed',
    async () => {
      await startModules();
      const execution = await execChildPython(testContext, ADMIN_USER, PYTHON_PATH, 'local_importer.py', importOpts);
      expect(execution).not.toBeNull();
      expect(execution.status).toEqual('success');
      await shutdownModules();
    },
    FIVE_MINUTES
  );
});
