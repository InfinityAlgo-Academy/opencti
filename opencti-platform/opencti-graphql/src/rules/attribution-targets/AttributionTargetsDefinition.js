import { RELATION_ATTRIBUTED_TO, RELATION_TARGETS } from '../../schema/stixCoreRelationship';

const id = 'attribution_targets';
const name = 'Targets via attribution';
const description =
  'If **entity A** `targets` **entity B** and **entity A** is ' +
  '`attributed-to` **entity C**, then **entity C** `targets` **entity B**.';

// For rescan
const scan = { types: [RELATION_ATTRIBUTED_TO] };

// For live
const filters = { types: [RELATION_TARGETS, RELATION_ATTRIBUTED_TO] };
const attributes = [
  { name: 'start_time' },
  { name: 'stop_time' },
  { name: 'confidence' },
  { name: 'object_marking_refs' },
];
const scopes = [{ filters, attributes }];

const definition = { id, name, description, scan, scopes };
export default definition;
