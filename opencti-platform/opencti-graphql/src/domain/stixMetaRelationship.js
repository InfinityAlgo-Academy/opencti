import { assoc, dissoc } from 'ramda';
import { elCount } from '../database/elasticSearch';
import { ABSTRACT_STIX_META_RELATIONSHIP } from '../schema/general';
import { isStixMetaRelationship } from '../schema/stixMetaRelationship';
import { READ_INDEX_STIX_META_RELATIONSHIPS } from '../database/utils';

const stixMetaRelationshipsNumber = (user, args) => {
  const types = [];
  if (args.type) {
    if (isStixMetaRelationship(args.type)) {
      types.push(args.type);
    }
  }
  if (types.length === 0) {
    types.push(ABSTRACT_STIX_META_RELATIONSHIP);
  }
  const finalArgs = assoc('types', types, args);
  return {
    count: elCount(user, READ_INDEX_STIX_META_RELATIONSHIPS, finalArgs),
    total: elCount(user, READ_INDEX_STIX_META_RELATIONSHIPS, dissoc('endDate', finalArgs)),
  };
};

export default stixMetaRelationshipsNumber;
