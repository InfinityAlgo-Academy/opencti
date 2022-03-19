import { RELATION_LOCATED_AT } from '../../schema/stixCoreRelationship';

const id = 'localization_of_targets';
const name = 'Location of targets';
const description = 'If **entity A** `targets` **entity B** through **relation X**, and **relation X** is `located-at` **entity C**,'
  + ' then **entity A** `targets` **entity C**.';

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
