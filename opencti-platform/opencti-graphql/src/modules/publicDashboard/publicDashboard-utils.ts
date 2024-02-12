import { getEntitiesMapFromCache, getEntitiesListFromCache } from '../../database/cache';
import { SYSTEM_USER } from '../../utils/access';
import { ENTITY_TYPE_PUBLIC_DASHBOARD, type PublicDashboardCached } from './publicDashboard-types';
import { ENTITY_TYPE_USER } from '../../schema/internalObject';
import type { AuthContext, AuthUser, UserCapability } from '../../types/user';
import { UnsupportedError } from '../../config/errors';
import { computeAvailableMarkings } from '../../domain/user';
import type { StoreMarkingDefinition } from '../../types/store';
import { ENTITY_TYPE_MARKING_DEFINITION } from '../../schema/stixMetaObject';
import { elLoadById } from '../../database/engine';

interface WidgetArguments {
  user: AuthUser,
  dateAttribute?: string,
  config: any,
  filters?: any,
  timeSeriesParameters?: any
}

export const getWidgetArguments = async (
  context: AuthContext,
  uriKey: string,
  widgetId: string,
  multiTime = false,
): Promise<WidgetArguments> => {
  // Get publicDashboard from cache
  const publicDashboardsMapByUriKey = await getEntitiesMapFromCache<PublicDashboardCached>(context, SYSTEM_USER, ENTITY_TYPE_PUBLIC_DASHBOARD);
  const publicDashboard = publicDashboardsMapByUriKey.get(uriKey);
  if (!publicDashboard) {
    throw UnsupportedError('Dashboard not found');
  }

  const { user_id, private_manifest, allowed_markings }: PublicDashboardCached = publicDashboard;

  // Get user from cache
  const platformUsersMap = await getEntitiesMapFromCache<AuthUser>(context, SYSTEM_USER, ENTITY_TYPE_USER);
  const plateformUser = platformUsersMap.get(user_id);
  if (!plateformUser) {
    throw UnsupportedError('User not found');
  }

  // replace User markings by publicDashboard allowed_markings
  const allMarkings = await getEntitiesListFromCache<StoreMarkingDefinition>(context, SYSTEM_USER, ENTITY_TYPE_MARKING_DEFINITION);

  // replace User capabilities by KNOWLEDGE capability
  const accessKnowledgeCapability: UserCapability = await elLoadById(context, SYSTEM_USER, 'capability--cbc68f4b-1d0c-51f6-a1b9-10344503b493') as unknown as UserCapability;

  const user = {
    ...plateformUser,
    origin: { user_id: plateformUser.id, referer: 'public-dashboard' },
    allowed_marking: computeAvailableMarkings(allowed_markings, allMarkings), // TODO what if user is downgraded ??
    capabilities: [accessKnowledgeCapability]
  };

  // Get widget query configuration
  const { widgets, config } = private_manifest;

  // if multiTimeSerie
  if (multiTime) {
    const { dataSelection } = widgets[widgetId];
    const timeSeriesParameters = dataSelection.map((selection: { filters: any; date_attribute: any; }) => {
      const filters = {
        filterGroups: [selection.filters],
        filters: [],
        mode: 'and'
      };
      return {
        field: selection.date_attribute,
        filters,
      };
    });

    return { user, config, timeSeriesParameters };
  }

  const widgetConfig = widgets[widgetId].dataSelection[0];
  const filters = {
    filterGroups: [widgetConfig.filters],
    filters: [],
    mode: 'and'
  };

  return {
    user,
    config,
    filters,
    dateAttribute: widgetConfig.date_attribute
  };
};
