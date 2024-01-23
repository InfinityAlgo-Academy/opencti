import { describe, expect, it } from 'vitest';
import { isEmptyField, isNotEmptyField, removeEmptyFields } from './utils';

/*
fonction retournant tous les tests cases dans un array d' l''actual arg et l'attendu pour expliciter la rédaction des tests parametrisés
const arg = {}; // Argument de la fonction
const expectedValue = {}; // Valeur attendu en retour
const mixedFields = [arg, expectedValue];

=> generateTestsCases([
  { arguments: arg, expectedValue: expectedVal },
  { arguments: arg1, expectedValue: expectedVal1 },
  { arguments: arg2, expectedValue: expectedVal2 },
])
*/
describe('Utils', () => {
  const filledUpFields = [
    'field',
    { label: 'Field', value: 'field' },
  ];

  const emptyFields = [
    '',
    null,
    undefined,
  ];

  describe('isNotEmptyField', () => {
    it.each(filledUpFields)('should return true, given a filled up field', <T>(filledUpField: T) => {
      expect(isNotEmptyField(filledUpField)).toBeTruthy();
    });

    it.each(emptyFields)('should return false, given an empty field', <T>(emptyField: T) => {
      expect(isNotEmptyField(emptyField)).toBeFalsy();
    });
  });

  describe('isEmptyField', () => {
    it.each(filledUpFields)('should return false, given a filled up field', <T>(filledUpField: T) => {
      expect(isEmptyField(filledUpField)).toBeFalsy();
    });

    it.each(emptyFields)('should return true, given an empty field', <T>(emptyField: T) => {
      expect(isEmptyField(emptyField)).toBeTruthy();
    });
  });

  describe('removeEmptyFields', () => {
    const mixedFields = [
      [{ field: {} }, {}],
      [
        {
          field: {
            value: 'field',
            label: null,
          },
        },
        {
          field: {
            value: 'field',
            label: null,
          },
        },
      ],
      [
        {
          field: {
            value: 'field',
            label: null,
          },
          emptyField: {},
        },
        {
          field: {
            value: 'field',
            label: null,
          },
        },
      ],
    ];
    it.each(mixedFields)('should return an empty object or filled up fields only, given an empty field', (mixedField: Record<string, any | undefined>, expectedReturnedValue: Record<string, any | undefined>) => {
      expect(removeEmptyFields(mixedField)).toStrictEqual(expectedReturnedValue);
    });
  });
});
