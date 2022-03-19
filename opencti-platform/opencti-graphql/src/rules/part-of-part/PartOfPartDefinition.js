import { RELATION_PART_OF } from '../../schema/stixCoreRelationship';

const id = 'part_part';
const name = 'Part of via Part of';
const description = 'If **entity A** is `part-of` **entity B** and **entity B** '
  + 'is `part-of` **entity C**, then **entity A** is `part-of` **entity C**.';

// For rescan
const scan = { types: [RELATION_PART_OF] };

// For live
const filters = { types: [RELATION_PART_OF] };
const attributes = [
  { name: 'start_time' },
  { name: 'stop_time' },
  { name: 'confidence' },
  { name: 'object_marking_refs' },
];
const scopes = [{ filters, attributes }];

const definition = { id, name, description, scan, scopes };
export default definition;
