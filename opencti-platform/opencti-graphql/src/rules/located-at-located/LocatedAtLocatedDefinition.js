import { RELATION_LOCATED_AT } from '../../schema/stixCoreRelationship';

const id = 'location_location';
const name = 'Location via location';
const description = 'If **entity A** is `located-at` **entity B** and **entity B** '
  + 'is `located-at` **entity C**, then **entity A** is `located-at` **entity C**.';

// For rescan
const scan = { types: [RELATION_LOCATED_AT] };

// For live
const filters = { types: [RELATION_LOCATED_AT] };
const attributes = [
  { name: 'start_time' },
  { name: 'stop_time' },
  { name: 'confidence' },
  { name: 'object_marking_refs' },
];
const scopes = [{ filters, attributes }];

const definition = { id, name, description, scan, scopes };
export default definition;
