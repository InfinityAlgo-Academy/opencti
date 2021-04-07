/* eslint-disable no-underscore-dangle */
import { generateAliasesId, normalizeName } from '../../../src/schema/identifier';
import { cleanStixIds } from '../../../src/database/stix';
import { relationTypeToInputName } from '../../../src/database/utils';

test('should name correctly normalize', () => {
  let normalize = normalizeName('My data %test     ');
  expect(normalize).toEqual('my data %test');
  normalize = normalizeName('My ♫̟  data  test ');
  expect(normalize).toEqual('my ♫̟  data  test');
  normalize = normalizeName('SnowFlake');
  expect(normalize).toEqual('snowflake');
});

test('should aliases generated with normalization', () => {
  const ids = generateAliasesId(['APT-28', 'SnowFlake']);
  expect(ids).toEqual([
    'aliases--d8ac97ba-19f1-5fa1-8cd6-e956915f4edd',
    'aliases--7312795f-839a-5733-b5f4-c6010ced7a2e',
  ]);
});

test('should stix id v5 always added', () => {
  const _2020_09_03T22_41_18 = 'v1--951c8756-ee36-11ea-adc1-0242ac120002';
  const _2020_09_03T22_41_32 = 'v1--9db69b68-ee36-11ea-adc1-0242ac120002';
  const _2020_09_04T08_00_00 = 'v1--a20665b0-ee84-11ea-adc1-0242ac120002';
  const _2020_09_04T08_00_43 = 'v1--bb896578-ee84-11ea-adc1-0242ac120002';
  const _2020_09_04T11_58_50 = 'v1--ff12cf7a-eea5-11ea-adc1-0242ac120002';
  const ids = cleanStixIds(
    [
      'indicator--a2f7504a-ea0d-48ed-a18d-cbf352fae6cf',
      'threat-actor--077b66a5-e64f-53df-bb22-03787ea16815',
      _2020_09_03T22_41_18,
      _2020_09_03T22_41_32,
      _2020_09_04T08_00_00,
      'marking-definition--78ca4366-f5b8-4764-83f7-34ce38198e27',
      _2020_09_04T08_00_43,
      'indicator--51640662-9c78-4402-932f-1d4531624723',
      _2020_09_04T11_58_50,
    ],
    5
  );
  expect(ids.length).toEqual(9);
  expect(ids.includes(_2020_09_03T22_41_18)).toBeTruthy();
  expect(ids.includes('indicator--a2f7504a-ea0d-48ed-a18d-cbf352fae6cf')).toBeTruthy();
});

test('should stix id not added if existing', () => {
  // v1 to add
  const _2020_09_03T22_41_18 = 'v1--951c8756-ee36-11ea-adc1-0242ac120002';
  const ids = cleanStixIds(['indicator--a2f7504a-ea0d-48ed-a18d-cbf352fae6cf', _2020_09_03T22_41_18], 5);
  expect(ids.length).toEqual(2);
  expect(ids.includes(_2020_09_03T22_41_18)).toBeTruthy();
  expect(ids.includes('indicator--a2f7504a-ea0d-48ed-a18d-cbf352fae6cf')).toBeTruthy();
});

test('should stix id v1 correctly max sized', () => {
  // v1 to add
  const _2020_09_04T14_18_43 = 'v1--b709816c-eea8-11ea-adc1-0242ac120002';
  // existing v1 elements
  const _2020_09_03T22_41_18 = 'v1--951c8756-ee36-11ea-adc1-0242ac120002';
  const _2020_09_03T22_41_32 = 'v1--9db69b68-ee36-11ea-adc1-0242ac120002';
  const _2020_09_04T08_00_00 = 'v1--a20665b0-ee84-11ea-adc1-0242ac120002';
  const _2020_09_04T08_00_43 = 'v1--bb896578-ee84-11ea-adc1-0242ac120002';
  const _2020_09_04T11_58_50 = 'v1--ff12cf7a-eea5-11ea-adc1-0242ac120002';
  // 01. test add
  let ids = cleanStixIds(
    [
      _2020_09_04T14_18_43,
      'threat-actor--077b66a5-e64f-53df-bb22-03787ea16815',
      'marking-definition--78ca4366-f5b8-4764-83f7-34ce38198e27',
      'indicator--51640662-9c78-4402-932f-1d4531624723',
      _2020_09_04T08_00_43,
      _2020_09_04T11_58_50,
    ],
    2
  );
  expect(ids.length).toEqual(5);
  expect(ids.includes('threat-actor--077b66a5-e64f-53df-bb22-03787ea16815')).toBeTruthy();
  expect(ids.includes(_2020_09_04T08_00_43)).toBeFalsy();
  expect(ids.includes(_2020_09_04T11_58_50)).toBeTruthy();
  expect(ids.includes(_2020_09_04T14_18_43)).toBeTruthy();
  // 02. test max 5
  ids = cleanStixIds(
    [
      _2020_09_04T14_18_43,
      'threat-actor--077b66a5-e64f-53df-bb22-03787ea16815',
      _2020_09_03T22_41_18,
      _2020_09_03T22_41_32,
      _2020_09_04T08_00_00,
      'marking-definition--78ca4366-f5b8-4764-83f7-34ce38198e27',
      _2020_09_04T08_00_43,
      'indicator--51640662-9c78-4402-932f-1d4531624723',
      _2020_09_04T11_58_50,
    ],
    5
  );
  expect(ids.length).toEqual(8);
  expect(ids.includes('threat-actor--077b66a5-e64f-53df-bb22-03787ea16815')).toBeTruthy();
  expect(ids.includes('marking-definition--78ca4366-f5b8-4764-83f7-34ce38198e27')).toBeTruthy();
  expect(ids.includes('indicator--51640662-9c78-4402-932f-1d4531624723')).toBeTruthy();
  expect(ids.includes(_2020_09_03T22_41_18)).toBeFalsy(); // Oldest removed
  expect(ids.includes(_2020_09_03T22_41_32)).toBeTruthy();
  expect(ids.includes(_2020_09_04T08_00_00)).toBeTruthy();
  expect(ids.includes(_2020_09_04T08_00_43)).toBeTruthy();
  expect(ids.includes(_2020_09_04T14_18_43)).toBeTruthy();
  expect(ids.includes(_2020_09_04T11_58_50)).toBeTruthy();
});

test('should multi stix id correctly max sized', () => {
  // v1 to add
  const _2020_09_04T14_18_43 = 'v1--b709816c-eea8-11ea-adc1-0242ac120002';
  const _2020_09_04T14_39_43 = 'v1--b07d23fa-eeab-11ea-adc1-0242ac120002';
  // existing v1 elements
  const _2020_09_03T22_41_18 = 'v1--951c8756-ee36-11ea-adc1-0242ac120002';
  const _2020_09_03T22_41_32 = 'v1--9db69b68-ee36-11ea-adc1-0242ac120002';
  const _2020_09_04T08_00_00 = 'v1--a20665b0-ee84-11ea-adc1-0242ac120002';
  const _2020_09_04T08_00_43 = 'v1--bb896578-ee84-11ea-adc1-0242ac120002';
  const _2020_09_04T11_58_50 = 'v1--ff12cf7a-eea5-11ea-adc1-0242ac120002';
  // 01. test add
  const ids = cleanStixIds(
    [
      _2020_09_04T14_18_43,
      _2020_09_04T14_39_43,
      'threat-actor--077b66a5-e64f-53df-bb22-03787ea16815',
      'marking-definition--78ca4366-f5b8-4764-83f7-34ce38198e27',
      'indicator--51640662-9c78-4402-932f-1d4531624723',
      _2020_09_03T22_41_18,
      _2020_09_03T22_41_32,
      _2020_09_04T08_00_00,
      _2020_09_04T08_00_43,
      _2020_09_04T11_58_50,
    ],
    5
  );
  expect(ids.length).toEqual(8);
  expect(ids.includes(_2020_09_04T14_18_43)).toBeTruthy();
  expect(ids.includes(_2020_09_04T14_39_43)).toBeTruthy();
  expect(ids.includes(_2020_09_03T22_41_18)).toBeFalsy();
  expect(ids.includes(_2020_09_03T22_41_32)).toBeFalsy();
});

test('should relation to input name', () => {
  const name = relationTypeToInputName('object-marking');
  expect(name).toEqual('objectMarking');
});
