import { STIX_EXT_OCTI } from '../../types/stix-extensions';
import { buildStixDomain, cleanObject } from '../../database/stix-converter';
import type { StixEvent, StoreEntityEvent } from './event-types';

const convertEventToStix = (instance: StoreEntityEvent): StixEvent => {
  const stixDomainObject = buildStixDomain(instance);
  return {
    ...stixDomainObject,
    name: instance.name,
    description: instance.description,
    category: instance.category,
    aliases: instance.x_opencti_aliases ?? [],
    extensions: {
      [STIX_EXT_OCTI]: cleanObject({
        ...stixDomainObject.extensions[STIX_EXT_OCTI],
        extension_type: 'new-sdo',
      })
    }
  };
};

export default convertEventToStix;
