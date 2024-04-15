import { describe, expect, it } from 'vitest';
import {
  adaptUpdateInputsConfidence,
  computeUserEffectiveConfidenceLevel,
  controlCreateInputWithUserConfidence,
  controlUpsertInputWithUserConfidence,
  controlUserConfidenceAgainstElement
} from '../../../src/utils/confidence-level';
import type { AuthUser } from '../../../src/types/user';
import { BYPASS } from '../../../src/utils/access';

const makeUser = (confidence: number | null) => ({
  id: `user_${confidence}`,
  effective_confidence_level: confidence ? { max_confidence: confidence } : null
} as AuthUser);

const makeGroup = (confidence: number | null) => ({
  id: `group_${confidence}`,
  group_confidence_level: confidence ? { max_confidence: confidence, overrides: [] } : null
});

const makeGroupWithOverrides = (confidence: number | null, overrideReport: number | null) => ({
  id: `group_${confidence}`,
  group_confidence_level: confidence ? { max_confidence: confidence, overrides: [{ entity_type: 'Report', max_confidence: overrideReport }] } : null
});

const makeUserWithOverrides = (confidence: number | null, overrideReport: number | null) => ({
  id: `user_${confidence}`,
  effective_confidence_level: confidence ? { max_confidence: confidence, overrides: overrideReport ? [{ entity_type: 'Report', max_confidence: overrideReport }] : [] } : null
} as AuthUser);

const makeReport = (confidence?: number | null) => ({
  id: `object_${confidence}`,
  entity_type: 'Report',
  confidence,
});

describe('Confidence level utilities', () => {
  it('computeUserEffectiveConfidenceLevel should correctly compute the effective level', async () => {
    const group70 = makeGroup(70);
    const group80 = makeGroup(80);
    const group40 = makeGroupWithOverrides(40, 90);
    const groupNull = makeGroup(null);

    // minimal subset of a real User
    const userA = {
      id: 'userA',
      user_confidence_level: {
        max_confidence: 30,
        overrides: [{ entity_type: 'Malware', max_confidence: 70 }],
      },
      groups: [group70, group80],
      capabilities: [],
    };
    expect(computeUserEffectiveConfidenceLevel(userA as unknown as AuthUser)).toEqual({
      max_confidence: 30,
      overrides: [{ entity_type: 'Malware', max_confidence: 70 }],
      source: { type: 'User', object: userA },
    });

    const userB = {
      id: 'userB',
      user_confidence_level: null,
      groups: [group70, group80],
      capabilities: [],
    };
    expect(computeUserEffectiveConfidenceLevel(userB as unknown as AuthUser)).toEqual({
      max_confidence: 80,
      overrides: [],
      source: { type: 'Group', object: group80 },
    });

    const userC = {
      user_confidence_level: null,
      groups: [groupNull, group70, groupNull],
      capabilities: [],
    };
    expect(computeUserEffectiveConfidenceLevel(userC as unknown as AuthUser)).toEqual({
      max_confidence: 70,
      overrides: [],
      source: { type: 'Group', object: group70 },
    });

    const userD = {
      user_confidence_level: null,
      groups: [groupNull, groupNull],
      capabilities: [],
    };
    expect(computeUserEffectiveConfidenceLevel(userD as unknown as AuthUser)).toBeNull();

    const userE = {
      user_confidence_level: null,
      groups: [],
      capabilities: [],
    };
    expect(computeUserEffectiveConfidenceLevel(userE as unknown as AuthUser)).toBeNull();

    const userF = {
      user_confidence_level: {
        max_confidence: 30,
        overrides: [],
      },
      groups: [group70],
      capabilities: [{ name: BYPASS }],
    };
    expect(computeUserEffectiveConfidenceLevel(userF as unknown as AuthUser)).toEqual({
      max_confidence: 100,
      overrides: [],
      source: { type: 'Bypass' },
    });

    const userG = {
      user_confidence_level: null,
      groups: [group70, group80],
      capabilities: [{ name: BYPASS }],
    };
    expect(computeUserEffectiveConfidenceLevel(userG as unknown as AuthUser)).toEqual({
      max_confidence: 100,
      overrides: [],
      source: { type: 'Bypass' },
    });
    const userH = {
      user_confidence_level: null,
      groups: [group40],
      capabilities: []
    };
    expect(computeUserEffectiveConfidenceLevel(userH as unknown as AuthUser)).toEqual({
      max_confidence: 40,
      overrides: [{ entity_type: 'Report', max_confidence: 90 }],
      source: { type: 'Group', object: group40 },
    });
  });
});

describe('Control confidence', () => {
  it('on any element', () => {
    expect(() => controlUserConfidenceAgainstElement(makeUser(50), makeReport(30)))
      .not.toThrowError();
    expect(() => controlUserConfidenceAgainstElement(makeUser(30), makeReport(50)))
      .toThrowError('User effective max confidence level is insufficient to update this element');
    expect(() => controlUserConfidenceAgainstElement(makeUser(50), makeReport(null)))
      .not.toThrowError();
    expect(() => controlUserConfidenceAgainstElement(makeUser(null), makeReport(30)))
      .toThrowError('User has no effective max confidence level and cannot update this element');
    expect(() => controlUserConfidenceAgainstElement(makeUser(50), {
      id: 'object_no_confidence',
      entity_type: 'Artifact',
    })).not.toThrowError();
    expect(() => controlUserConfidenceAgainstElement(makeUser(null), {
      id: 'object_no_confidence',
      entity_type: 'Artifact',
    })).not.toThrowError(); // existence of user level is not even checked
    expect(() => controlUserConfidenceAgainstElement(makeUserWithOverrides(40, 90), makeReport(80)));
    expect(() => controlUserConfidenceAgainstElement(makeUserWithOverrides(40, null), makeReport(100)))
      .toThrowError('User effective max confidence level is insufficient to update this element');
  });
  it('on any element (noThrow)', () => {
    expect(controlUserConfidenceAgainstElement(makeUser(50), makeReport(30), true)).toEqual(true);
    expect(controlUserConfidenceAgainstElement(makeUser(30), makeReport(50), true)).toEqual(false);
    expect(controlUserConfidenceAgainstElement(makeUser(50), makeReport(null), true)).toEqual(true);
    expect(controlUserConfidenceAgainstElement(makeUser(null), makeReport(30), true)).toEqual(false);
    expect(controlUserConfidenceAgainstElement(makeUser(50), { id: 'object_no_confidence', entity_type: 'Artifact' }, true)).toEqual(true);
    expect(controlUserConfidenceAgainstElement(makeUser(null), { id: 'object_no_confidence', entity_type: 'Artifact' }, true)).toEqual(true);
  });
  it('on create input', () => {
    expect(controlCreateInputWithUserConfidence(makeUser(50), makeReport(30))).toEqual({
      confidenceLevelToApply: 30,
    });
    expect(controlCreateInputWithUserConfidence(makeUser(30), makeReport(50))).toEqual({
      confidenceLevelToApply: 30,
    });
    expect(controlCreateInputWithUserConfidence(makeUser(30), makeReport(null))).toEqual({
      confidenceLevelToApply: 30,
    });
    expect(controlCreateInputWithUserConfidence(makeUserWithOverrides(40, 90), makeReport(null), 'Report')).toEqual({
      confidenceLevelToApply: 90,
    });
    expect(() => controlCreateInputWithUserConfidence(makeUser(null), makeReport(50)))
      .toThrowError('User has no effective max confidence level and cannot create this element');
  });
  it('on upsert input', () => {
    expect(controlUpsertInputWithUserConfidence(makeUser(50), makeReport(30), makeReport(10)))
      .toEqual({
        isConfidenceMatch: true,
        confidenceLevelToApply: 30,
        isConfidenceUpper: true,
      });
    expect(controlUpsertInputWithUserConfidence(makeUser(50), makeReport(10), makeReport(30)))
      .toEqual({
        isConfidenceMatch: false,
        confidenceLevelToApply: 10,
        isConfidenceUpper: false,
      });
    expect(controlUpsertInputWithUserConfidence(makeUser(30), makeReport(50), makeReport(10)))
      .toEqual({
        isConfidenceMatch: true,
        confidenceLevelToApply: 30,
        isConfidenceUpper: true,
      });
    expect(controlUpsertInputWithUserConfidence(makeUser(30), makeReport(10), makeReport(50)))
      .toEqual({
        isConfidenceMatch: false,
        confidenceLevelToApply: 10,
        isConfidenceUpper: false,
      });
    expect(controlUpsertInputWithUserConfidence(makeUser(10), makeReport(50), makeReport(30)))
      .toEqual({
        isConfidenceMatch: false,
        confidenceLevelToApply: 10,
        isConfidenceUpper: false,
      });
    expect(controlUpsertInputWithUserConfidence(makeUser(10), makeReport(30), makeReport(50)))
      .toEqual({
        isConfidenceMatch: false,
        confidenceLevelToApply: 10,
        isConfidenceUpper: false,
      });
    expect(controlUpsertInputWithUserConfidence(makeUser(50), makeReport(null), makeReport(30)))
      .toEqual({
        isConfidenceMatch: true,
        confidenceLevelToApply: 50,
        isConfidenceUpper: true,
      });
    expect(controlUpsertInputWithUserConfidence(makeUser(30), makeReport(null), makeReport(50)))
      .toEqual({
        isConfidenceMatch: false,
        confidenceLevelToApply: 30,
        isConfidenceUpper: false,
      });
    expect(controlUpsertInputWithUserConfidence(makeUser(50), makeReport(30), makeReport(null)))
      .toEqual({
        isConfidenceMatch: true,
        confidenceLevelToApply: 30,
        isConfidenceUpper: true,
      });
    expect(controlUpsertInputWithUserConfidence(makeUser(30), makeReport(50), makeReport(null)))
      .toEqual({
        isConfidenceMatch: true,
        confidenceLevelToApply: 30,
        isConfidenceUpper: true,
      });
    expect(controlUpsertInputWithUserConfidence(makeUser(30), makeReport(null), makeReport(null)))
      .toEqual({
        isConfidenceMatch: true,
        confidenceLevelToApply: 30,
        isConfidenceUpper: true,
      });
    expect(() => controlUpsertInputWithUserConfidence(makeUser(null), makeReport(30), makeReport(50)))
      .toThrowError('User has no effective max confidence level and cannot upsert this element');
  });
});

it('adaptUpdateInputsConfidence should adapt correctly input payload', () => {
  const makeConfidenceInput = (confidence: number) => ({
    key: 'confidence',
    value: [confidence.toString()],
  });
  const otherInput = {
    key: 'description',
    value: ['some text'],
  };

  expect(adaptUpdateInputsConfidence(makeUser(50), makeConfidenceInput(30), makeReport(10)))
    .toEqual([{ key: 'confidence', value: ['30'] }]);
  expect(adaptUpdateInputsConfidence(makeUser(50), makeConfidenceInput(10), makeReport(30)))
    .toEqual([{ key: 'confidence', value: ['10'] }]);
  expect(adaptUpdateInputsConfidence(makeUser(30), makeConfidenceInput(50), makeReport(10)))
    .toEqual([{ key: 'confidence', value: ['30'] }]); // capped
  expect(adaptUpdateInputsConfidence(makeUser(30), makeConfidenceInput(10), makeReport(50)))
    .toEqual([{ key: 'confidence', value: ['10'] }]); // this function does not control against element!
  expect(adaptUpdateInputsConfidence(makeUser(10), makeConfidenceInput(50), makeReport(30)))
    .toEqual([{ key: 'confidence', value: ['10'] }]); // capped / this function does not control against element!
  expect(adaptUpdateInputsConfidence(makeUser(10), makeConfidenceInput(30), makeReport(50)))
    .toEqual([{ key: 'confidence', value: ['10'] }]); // capped / this function does not control against element!
  expect(adaptUpdateInputsConfidence(makeUser(10), otherInput, makeReport(50)))
    .toEqual([otherInput]); // no need to inject confidence
  expect(adaptUpdateInputsConfidence(makeUser(10), otherInput, makeReport(null)))
    .toEqual([otherInput, { key: 'confidence', value: ['10'] }]); // inject user's confidence
  expect(adaptUpdateInputsConfidence(makeUser(10), makeConfidenceInput(30), makeReport(null)))
    .toEqual([{ key: 'confidence', value: ['10'] }]); // capped / no need to inject user's confidence
});
