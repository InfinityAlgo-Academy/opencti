import { schemaRelationsRefDefinition } from '../schema/schema-relationsRef';
import { STIX_CORE_RELATIONSHIPS } from '../schema/stixCoreRelationship';
import { specialFilterKeysWhoseValueToResolve } from '../utils/filtering/filtering-constants';
import { extractFilterGroupValues } from '../utils/filtering/filtering-utils';
import { storeLoadByIds } from '../database/middleware-loader';
import { ABSTRACT_BASIC_OBJECT } from '../schema/general';
import type { AuthContext, AuthUser } from '../types/user';
import type { FilterGroup } from '../generated/graphql';
import { extractEntityRepresentativeName } from '../database/entity-representative';
import { findById as findStatusById } from './status';
import { schemaAttributesDefinition } from '../schema/schema-attributes';
import type { BasicStoreEntity } from '../types/store';

interface FilterRepresentative {
  id: string
  value: string
  entity_type: string | null
  color: string | null
}

// region filters representatives
// return an array of the value of the ids existing in inputFilters:
// the entity representative for entities, null for deleted or restricted entities, the id for ids not corresponding to an entity
export const findFiltersRepresentatives = async (context: AuthContext, user: AuthUser, inputFilters: FilterGroup) => {
  const filtersRepresentatives: FilterRepresentative[] = [];
  // extract the ids to resolve from inputFilters
  const keysToResolve = schemaRelationsRefDefinition.getAllInputNames()
    .concat(STIX_CORE_RELATIONSHIPS)
    .concat(schemaAttributesDefinition.getIdAttributeNames())
    .concat(specialFilterKeysWhoseValueToResolve);
  const idsToResolve = extractFilterGroupValues(inputFilters, keysToResolve);
  const otherIds = extractFilterGroupValues(inputFilters, keysToResolve, true);
  // resolve the ids
  const resolvedEntities = await storeLoadByIds<BasicStoreEntity>(context, user, idsToResolve, ABSTRACT_BASIC_OBJECT);
  // resolve status ids differently
  for (let index = 0; index < resolvedEntities.length; index += 1) {
    let entity = resolvedEntities[index];
    if (entity?.entity_type === 'Status') {
      // complete the result with the cache for statuses to have all the infos to fetch the representative
      entity = await findStatusById(context, user, entity.id);
    }
    // add the entity representative in 'value', or null for deleted/restricted entities
    filtersRepresentatives.push({
      id: idsToResolve[index],
      value: (entity ? extractEntityRepresentativeName(entity) : null),
      entity_type: entity?.entity_type ?? null,
      color: entity?.color || entity?.x_opencti_color || null
    });
  }
  // add ids that don't require a resolution
  return filtersRepresentatives.concat(otherIds.map((id) => ({
    id,
    value: id,
    entity_type: null,
    color: null
  })));
};
// endregion
