import { buildKillChainPhases, buildMITREExtensions, buildStixDomain, cleanObject, convertToStixDate } from '../../database/stix-converter';
import { STIX_EXT_MITRE, STIX_EXT_OCTI } from '../../types/stix-extensions';
import type { StixIndicator, StoreEntityIndicator } from './indicator-types';

const convertIndicatorToStix = (instance: StoreEntityIndicator): StixIndicator => {
  const indicator = buildStixDomain(instance);
  return {
    ...indicator,
    name: instance.name,
    description: instance.description,
    indicator_types: instance.indicator_types,
    pattern: instance.pattern,
    pattern_type: instance.pattern_type,
    pattern_version: instance.pattern_version,
    valid_from: convertToStixDate(instance.valid_from),
    valid_until: convertToStixDate(instance.valid_until),
    kill_chain_phases: buildKillChainPhases(instance),
    extensions: {
      [STIX_EXT_OCTI]: cleanObject({
        ...indicator.extensions[STIX_EXT_OCTI],
        detection: instance.x_opencti_detection,
        score: instance.x_opencti_score,
        main_observable_type: instance.x_opencti_main_observable_type
      }),
      [STIX_EXT_MITRE]: buildMITREExtensions(instance)
    }
  } as StixIndicator;
};

export default convertIndicatorToStix;
