import { v4 as uuidv4 } from 'uuid';
import * as R from 'ramda';
import type { StixBundle, StixObject } from '../types/stix-common';
import { STIX_SPEC_VERSION } from '../database/stix';

export class BundleBuilder {
  id: string;

  type: 'bundle';

  objects: StixObject[];

  constructor() {
    this.id = `bundle--${uuidv4()}`;
    this.type = 'bundle';
    this.objects = [];
  }

  addObject(object: StixObject) {
    this.objects.push(object);
    return this;
  }

  addObjects(objects: StixObject[]) {
    this.objects.push(...objects);
    return this;
  }

  ids() {
    return this.objects.map((o) => o.id);
  }

  build(): StixBundle {
    return {
      id: this.id,
      spec_version: STIX_SPEC_VERSION,
      type: this.type,
      objects: R.uniqBy(R.prop('id'), this.objects)
    };
  }
}
