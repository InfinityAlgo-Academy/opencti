import uuid from 'uuid/v4';
import { map } from 'ramda';
import {
  escapeString,
  deleteEntityById,
  getById,
  dayFormat,
  monthFormat,
  yearFormat,
  notify,
  now,
  paginate,
  takeWriteTx,
  commitWriteTx
} from '../database/grakn';
import { BUS_TOPICS } from '../config/conf';

export const findAll = args =>
  paginate(
    `match $g isa Group ${
      args.search
        ? `; $g has name $name;
   $g has description $description;
   { $name contains "${escapeString(args.search)}"; } or
   { $description contains "${escapeString(args.search)}"; }`
        : ''
    }`,
    args
  );

export const findById = groupId => getById(groupId);

export const members = (groupId, args) =>
  paginate(
    `match $user isa User; 
    $rel((member:$user, grouping:$g) isa membership; 
    $g has internal_id "${escapeString(groupId)}"`,
    args
  );

export const permissions = (groupId, args) =>
  paginate(
    `match $marking isa Marking-Definition; 
    $rel(allow:$marking, allowed:$g) isa permission; 
    $g has internal_id "${escapeString(groupId)}"`,
    args
  );

export const addGroup = async (user, group) => {
  const wTx = await takeWriteTx();
  const internalId = group.internal_id
    ? escapeString(group.internal_id)
    : uuid();
  const groupIterator = await wTx.tx.query(`insert $group isa Group,
    has internal_id "${internalId}",
    has entity_type "group",
    has name "${escapeString(group.name)}",
    has description "${escapeString(group.description)}",
    has created_at ${now()},
    has created_at_day "${dayFormat(now())}",
    has created_at_month "${monthFormat(now())}",
    has created_at_year "${yearFormat(now())}",  
    has updated_at ${now()};
  `);
  const createGroup = await groupIterator.next();
  const createdGroupId = await createGroup.map().get('group').id;

  if (group.createdByRef) {
    await wTx.tx.query(
      `match $from id ${createdGroupId};
      $to has internal_id "${escapeString(group.createdByRef)}";
      insert (so: $from, creator: $to)
      isa created_by_ref, has internal_id "${uuid()}";`
    );
  }

  if (group.markingDefinitions) {
    const createMarkingDefinition = markingDefinition =>
      wTx.tx.query(
        `match $from id ${createdGroupId}; 
        $to has internal_id "${escapeString(markingDefinition)}";
        insert (so: $from, marking: $to) isa object_marking_refs, has internal_id "${uuid()}";`
      );
    const markingDefinitionsPromises = map(
      createMarkingDefinition,
      group.markingDefinitions
    );
    await Promise.all(markingDefinitionsPromises);
  }

  await commitWriteTx(wTx);

  return getById(internalId).then(created =>
    notify(BUS_TOPICS.StixDomainEntity.ADDED_TOPIC, created, user)
  );
};

export const groupDelete = groupId => deleteEntityById(groupId);
