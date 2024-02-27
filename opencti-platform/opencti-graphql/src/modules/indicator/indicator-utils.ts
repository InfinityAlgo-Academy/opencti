import type { Moment } from 'moment';
import { MARKING_TLP_AMBER, MARKING_TLP_AMBER_STRICT, MARKING_TLP_CLEAR, MARKING_TLP_GREEN, MARKING_TLP_RED, STATIC_MARKING_IDS } from '../../schema/identifier';
import { getEntitiesMapFromCache } from '../../database/cache';
import { ENTITY_TYPE_MARKING_DEFINITION } from '../../schema/stixMetaObject';
import type { AuthContext, AuthUser } from '../../types/user';
import type { IndicatorAddInput } from '../../generated/graphql';
import type { BasicStoreEntity } from '../../types/store';
import { isEmptyField, isNotEmptyField } from '../../database/utils';
import { utcDate } from '../../utils/format';

interface TTL_DEFINITION {
  target: Array<string>;
  definition?: Record<string, number>;
  default: number;
}

export const DEFAULT_INDICATOR_TTL = 365;
const INDICATOR_TTL_DEFINITION: Array<TTL_DEFINITION> = [
  {
    target: ['IPv4-Addr', 'IPv6-Addr'],
    definition: {
      [MARKING_TLP_CLEAR]: 30,
      [MARKING_TLP_GREEN]: 30,
      [MARKING_TLP_AMBER]: 30,
      [MARKING_TLP_AMBER_STRICT]: 60,
      [MARKING_TLP_RED]: 60,
    },
    default: 60
  },
  {
    target: ['File'],
    default: DEFAULT_INDICATOR_TTL
  },
  {
    target: ['Url'],
    definition: {
      [MARKING_TLP_CLEAR]: 60,
      [MARKING_TLP_GREEN]: 60,
      [MARKING_TLP_AMBER]: 180,
      [MARKING_TLP_AMBER_STRICT]: 180,
      [MARKING_TLP_RED]: 180,
    },
    default: 180
  },
];

export const computeValidTTL = async (context: AuthContext, user: AuthUser, indicator: IndicatorAddInput) => {
  const observableType = indicator.x_opencti_main_observable_type;
  if (observableType) {
    const data = INDICATOR_TTL_DEFINITION.find((ttl) => ttl.target.includes(observableType));
    if (data) {
      if (data.definition && indicator.objectMarking && indicator.objectMarking.length > 0) {
        // Resolve the markings and get the higher rank for TLP
        const markingsMap = await getEntitiesMapFromCache<BasicStoreEntity>(context, user, ENTITY_TYPE_MARKING_DEFINITION);
        const topTlpMarking = indicator.objectMarking
          .map((id) => markingsMap.get(id))
          .filter((marking): marking is BasicStoreEntity => marking !== null && marking !== undefined)
          .filter((marking) => STATIC_MARKING_IDS.includes(marking.standard_id))
          .sort((a, b) => b.x_opencti_order - a.x_opencti_order)
          .at(0);
        if (topTlpMarking) {
          return data.definition[topTlpMarking.standard_id];
        }
      }
      return data.default;
    }
  }
  return DEFAULT_INDICATOR_TTL;
};

const computeValidFrom = (indicator: IndicatorAddInput): Moment => {
  if (isNotEmptyField(indicator.valid_from)) {
    return utcDate(indicator.valid_from);
  }
  if (isNotEmptyField(indicator.created)) {
    return utcDate(indicator.created);
  }
  return utcDate();
};

const computeValidUntil = (indicator: IndicatorAddInput, validFrom: Moment, lifetimeInDays: number): Moment => {
  if (indicator.revoked && isEmptyField(indicator.valid_until)) {
    // If indicator is explicitly revoked and not valid_until is specified
    // Ensure the valid_until will be revoked by the time computation.
    return validFrom;
  }
  if (isNotEmptyField(indicator.valid_until)) {
    return utcDate(indicator.valid_until);
  }
  return validFrom.clone().add(lifetimeInDays, 'days');
};

export const computeValidPeriod = async (indicator: IndicatorAddInput, lifetimeInDays: number) => {
  const validFrom = computeValidFrom(indicator);
  const validUntil = computeValidUntil(indicator, validFrom, lifetimeInDays);
  return {
    validFrom,
    validUntil,
    revoked: validUntil.isSameOrBefore(utcDate()),
    validPeriod: validFrom.isSameOrBefore(validUntil)
  };
};
