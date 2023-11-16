import {
  ASSIGNEE_FILTER,
  CREATED_BY_FILTER,
  INDICATOR_FILTER, LABEL_FILTER, MARKING_FILTER, OBJECT_CONTAINS_FILTER,
  PARTICIPANT_FILTER,
  RELATION_FROM,
  RELATION_TO,
} from '../filtering';
import { FILTER_KEY_TESTERS_MAP } from './stix-testers';
import { testFilterGroup } from './boolean-logic-engine';
import { isUserCanAccessStixElement, SYSTEM_USER } from '../access';
import type { AuthContext, AuthUser } from '../../types/user';
import { getEntitiesMapFromCache } from '../../database/cache';
import type { StixObject } from '../../types/stix-common';
import { ENTITY_TYPE_RESOLVED_FILTERS } from '../../schema/stixDomainObject';
import type { Filter, FilterGroup } from '../../generated/graphql';
import type { ActivityStreamEvent } from '../../manager/activityListener';
import { FILTER_WITH_EVENTS_KEY_TESTERS_MAP } from './event-testers';

//----------------------------------------------------------------------------------------------------------------------

/**
 * Pass through all individual filters and throws an error if it cannot be handled properly.
 * This is very aggressive but will allow us to detect rapidly any corner-case.
 */
export const validateFilterForStixMatch = (filter: Filter) => {
  if (filter.key.length !== 1) {
    throw Error(`Stix filtering can only be executed on a unique filter key - got ${JSON.stringify(filter.key)}`);
  }
  if (FILTER_KEY_TESTERS_MAP[filter.key[0]] === undefined) {
    throw Error(`Stix filtering is not compatible with the provided filter key ${JSON.stringify(filter.key)} - available filter keys: ${JSON.stringify(Object.keys(FILTER_KEY_TESTERS_MAP))}`);
  }
};

export const validateFilterForEventMatch = (filter: Filter) => {
  if (filter.key.length !== 1) {
    throw Error(`Stix filtering can only be executed on a unique filter key - got ${JSON.stringify(filter.key)}`);
  }
  if (FILTER_WITH_EVENTS_KEY_TESTERS_MAP[filter.key[0]] === undefined) {
    throw Error(`Stix filtering is not compatible with the provided filter key ${JSON.stringify(filter.key)} - available filter keys: ${JSON.stringify(Object.keys(FILTER_WITH_EVENTS_KEY_TESTERS_MAP))}`);
  }
};

/**
 * Recursively call validateFilter inside a FilterGroup
 */
export const validateFilterGroupForStixMatch = (filterGroup: FilterGroup) => {
  if (!filterGroup?.filterGroups || !filterGroup?.filters) {
    throw Error('Unrecognized filter format; expecting FilterGroup');
  }
  filterGroup.filters.forEach((f) => validateFilterForStixMatch(f));
  filterGroup.filterGroups.forEach((fg) => validateFilterGroupForStixMatch(fg));
};

export const validateFilterGroupForEventMatch = (filterGroup: FilterGroup) => {
  if (!filterGroup?.filterGroups || !filterGroup?.filters) {
    throw Error('Unrecognized filter format; expecting FilterGroup');
  }
  filterGroup.filters.forEach((f) => validateFilterForEventMatch(f));
  filterGroup.filterGroups.forEach((fg) => validateFilterGroupForEventMatch(fg));
};

//----------------------------------------------------------------------------------------------------------------------

/**
 * Resolve some of the filter values according to a resolution map.
 * This concerns attributes that are not directly compared with a stix attribute due to modelization differences.
 * For instance, labels are entities internally, and filter.values would contain these entities ids.
 * In Stix, the labels are stored in plain text: we need to replace the ids in filter.values with their resolution.
 */
export const resolveFilter = (filter: Filter, resolutionMap: FilterResolutionMap): Filter => {
  const newFilterValues: string [] = [];
  filter.values.forEach((v) => {
    const resolution = resolutionMap.get(v);
    if (resolution) {
      newFilterValues.push(resolution);
    } else {
      newFilterValues.push(v);
    }
  });

  return {
    ...filter,
    values: newFilterValues
  };
};

/**
 * Recursively call resolveFilter inside a filter group
 */
export const resolveFilterGroup = (filterGroup: FilterGroup, resolutionMap: FilterResolutionMap): FilterGroup => {
  return {
    ...filterGroup,
    filters: filterGroup.filters.map((f) => resolveFilter(f, resolutionMap)),
    filterGroups: filterGroup.filterGroups.map((fg) => resolveFilterGroup(fg, resolutionMap))
  };
};

//----------------------------------------------------------------------------------------------------------------------

type FilterResolutionMap = Map<string, string>;

// We use '.' for compound paths
const RESOLUTION_MAP_PATHS: Record<string, string> = {
  [ASSIGNEE_FILTER]: 'id', // assignee --> resolve with the standard id (which is the stix.id)
  [CREATED_BY_FILTER]: 'id', // created by --> resolve with the standard id (which is the stix.id)
  [LABEL_FILTER]: 'value', // labels --> resolve id to stix.name
  [INDICATOR_FILTER]: 'type', // indicator types --> resolve id to stix.type
  [MARKING_FILTER]: 'id', // marking --> resolve id to standard id (which is the stix.id)
  [OBJECT_CONTAINS_FILTER]: 'id',
  [PARTICIPANT_FILTER]: 'id', // participant --> resolve with the standard id (which is the stix.id)
  [RELATION_FROM]: 'id',
  [RELATION_TO]: 'id',
};

/**
 * Build a resolution map thanks to the cache
 * @param mutableMap
 * @param filter
 * @param cache
 */
const buildResolutionMapForFilter = async (mutableMap: FilterResolutionMap, filter: Filter, cache: Map<string, StixObject>) => {
  if (Object.keys(RESOLUTION_MAP_PATHS).includes(filter.key[0])) {
    filter.values.forEach((v) => {
      // manipulating proper stix objects typing requires a lot of refactoring at this point (typeguards, etc)
      // like with isStixMatchFilterGroup, let's use any to describe our stix objects in cache
      const cachedObject = cache.get(v) as any;
      const path = RESOLUTION_MAP_PATHS[filter.key[0]];
      if (cachedObject && path) {
        const cachedValue = cachedObject[path];
        if (typeof cachedValue === 'string') {
          mutableMap.set(v, cachedValue);
        }
      }
    });
  }
};

/**
 * recursively call buildResolutionMapForFilter inside a filter group
 */
export const buildResolutionMapForFilterGroup = async (mutableMap: FilterResolutionMap, filterGroup: FilterGroup, cache: Map<string, StixObject>) => {
  filterGroup.filters.forEach((f) => buildResolutionMapForFilter(mutableMap, f, cache));
  filterGroup.filterGroups.forEach((fg) => buildResolutionMapForFilterGroup(mutableMap, fg, cache));
};

//----------------------------------------------------------------------------------------------------------------------

/**
 * Middleware function that allow us to make unit tests by mocking the resolution map.
 * This is necessary because the map is built thanks to the cache, not available in unit tests.
 */
export const isStixMatchFilterGroup_MockableForUnitTests = async (
  context: AuthContext,
  user: AuthUser,
  stix: any,
  filterGroup: FilterGroup,
  resolutionMap: FilterResolutionMap
) : Promise<boolean> => {
  // we are limited to certain filter keys right now, so better throw an explicit error if a key is not compatible
  // Note that similar check is done when saving a filter in stream, taxii, feed, or playbook node.
  // This check should thus not fail here, theoretically.
  validateFilterGroupForStixMatch(filterGroup);

  // first check: user access right (according to markings, organization, etc.)
  const isUserHasAccessToElement = await isUserCanAccessStixElement(context, user, stix);
  if (!isUserHasAccessToElement) {
    return false;
  }

  const resolvedFilterGroup = resolveFilterGroup(filterGroup, resolutionMap);

  // then call our boolean engine on the filter group using the stix testers
  return testFilterGroup(stix, resolvedFilterGroup, FILTER_KEY_TESTERS_MAP);
};

export const isEventMatchFilterGroup_MockableForUnitTests = async (
  event: ActivityStreamEvent,
  filterGroup: FilterGroup,
  resolutionMap: FilterResolutionMap,
) : Promise<boolean> => {
  // we are limited to certain filter keys right now, so better throw an explicit error if a key is not compatible
  // Note that similar check is done when saving a filter in stream, taxii, feed, or playbook node.
  // This check should thus not fail here, theoretically.
  validateFilterGroupForEventMatch(filterGroup);

  // resolve filters to check accesses
  const resolvedFilterGroup = resolveFilterGroup(filterGroup, resolutionMap);

  // then call our boolean engine on the filter group using the event testers
  return testFilterGroup(event, resolvedFilterGroup, FILTER_WITH_EVENTS_KEY_TESTERS_MAP);
};

/**
 * Tells if a stix object matches a filter group given a certain context.
 * The input filter group is a stored filter (streams, triggers, playbooks), the stix object comes from the raw stream.
 *
 * This function will first check the user access rights to the stix object, then resolve parts of the filter groups if necessary,
 * prior to actually comparing the filter values with the stix values.
 * @param context
 * @param user
 * @param stix stix object from the raw event stream
 * @param filterGroup
 * @throws {Error} on invalid filter keys
 */
export const isStixMatchFilterGroup = async (context: AuthContext, user: AuthUser, stix: any, filterGroup: FilterGroup) : Promise<boolean> => {
  // resolve some of the ids as we filter on their corresponding values or standard-id for instance
  // the provided map contains replacements for filter values, if any.
  const map = new Map<string, string>();

  // we use the entities stored in cache for the "Resolved-Filters" (all the entities used by the saved filters - stream, trigger, playbooks)
  // see cacheManager.ts:platformResolvedFilters
  const cache = await getEntitiesMapFromCache<StixObject>(context, SYSTEM_USER, ENTITY_TYPE_RESOLVED_FILTERS);
  await buildResolutionMapForFilterGroup(map, filterGroup, cache);

  return isStixMatchFilterGroup_MockableForUnitTests(context, user, stix, filterGroup, map);
};

export const isEventMatchFilterGroup = async (context: AuthContext, event: ActivityStreamEvent, filterGroup: FilterGroup) : Promise<boolean> => {
  // resolve some of the ids as we filter on their corresponding values or standard-id for instance
  // the provided map contains replacements for filter values, if any.
  const map = new Map<string, string>();

  // we use the entities stored in cache for the "Resolved-Filters" (all the entities used by the saved filters - stream, trigger, playbooks)
  // see cacheManager.ts:platformResolvedFilters
  const cache = await getEntitiesMapFromCache<StixObject>(context, SYSTEM_USER, ENTITY_TYPE_RESOLVED_FILTERS);
  await buildResolutionMapForFilterGroup(map, filterGroup, cache);

  return isEventMatchFilterGroup_MockableForUnitTests(event, filterGroup, map);
};
