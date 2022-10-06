import {
  checkIndicatorSyntax,
  checkPythonAvailability,
  createStixPattern,
  execTestingPython
} from '../../../src/python/pythonBridge';
import { ADMIN_USER, testContext } from '../../utils/testQuery';

test('Check if python is well configured', async () => {
  const check = await checkPythonAvailability(testContext, ADMIN_USER);
  expect(check).not.toBeNull();
  expect(check.status).toEqual('success');
  // noinspection ES6MissingAwait
  expect(execTestingPython(testContext, ADMIN_USER, '/missing')).rejects.toThrow('An unknown error has occurred');
  // noinspection ES6MissingAwait
  expect(createStixPattern(testContext, ADMIN_USER, 'fail')).resolves.toEqual(null);
});

test('Check createStixPattern bad pattern', async () => {
  let check = await createStixPattern(testContext, ADMIN_USER, 'TYPE', 'VALUE');
  expect(check).toBeNull();
  check = await createStixPattern(testContext, ADMIN_USER, 'File_shaa256', 'c2d6908fe0d2ad04713');
  expect(check).toBeNull();
});

test('Check createStixPattern hash', async () => {
  const check = await createStixPattern(
    testContext,
    ADMIN_USER,
    'File_sha256',
    'e9b45212395f4c2d6908fe0d2ad04713fae3dee8aaacfd52b3f89de7fdb54b88'
  );
  expect(check).toEqual("[file:hashes.'SHA-256' = 'e9b45212395f4c2d6908fe0d2ad04713fae3dee8aaacfd52b3f89de7fdb54b88']");
});

test('Check stix indicator syntax', async () => {
  const check = await checkIndicatorSyntax(testContext, ADMIN_USER, 'stix', '[ipv4-addr:value = \'195.206.105.217\']');
  expect(check).toEqual(true);
});

test('Check stix indicator bad pattern', async () => {
  const check = await checkIndicatorSyntax(testContext, ADMIN_USER, 'stix', '5.206.105.217');
  expect(check).toEqual(false);
});
