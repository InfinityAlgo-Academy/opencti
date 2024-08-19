import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import React, { FunctionComponent, useRef } from 'react';
import { useFragment } from 'react-relay';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import useHelper from 'src/utils/hooks/useHelper';
import { CaseUtils_case$key } from '@components/cases/__generated__/CaseUtils_case.graphql';
import { useFormatter } from '../../../../components/i18n';
import { convertMarkings } from '../../../../utils/edition';
import { KNOWLEDGE_KNUPDATE } from '../../../../utils/hooks/useGranted';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import Security from '../../../../utils/Security';
import StixCoreObjectExternalReferences from '../../analyses/external_references/StixCoreObjectExternalReferences';
import StixCoreObjectOrStixCoreRelationshipNotes from '../../analyses/notes/StixCoreObjectOrStixCoreRelationshipNotes';
import ContainerStixObjectsOrStixRelationships from '../../common/containers/ContainerStixObjectsOrStixRelationships';
import StixCoreObjectLatestHistory from '../../common/stix_core_objects/StixCoreObjectLatestHistory';
import StixDomainObjectOverview from '../../common/stix_domain_objects/StixDomainObjectOverview';
import { CaseTasksLinesQuery, CaseTasksLinesQuery$variables } from '../tasks/__generated__/CaseTasksLinesQuery.graphql';
import CaseTasksLines, { caseTasksLinesQuery } from '../tasks/CaseTasksLines';
import { caseFragment } from '../CaseUtils';
import CaseIncidentDetails from './CaseIncidentDetails';
import CaseIncidentEdition from './CaseIncidentEdition';
import { usePaginationLocalStorage } from '../../../../utils/hooks/useLocalStorage';
import { tasksDataColumns } from '../tasks/TasksLine';
import ListLines from '../../../../components/list_lines/ListLines';
import { CaseTasksLineDummy } from '../tasks/CaseTasksLine';
import { isFilterGroupNotEmpty, useRemoveIdAndIncorrectKeysFromFilterGroupObject } from '../../../../utils/filters/filtersUtils';
import { FilterGroup } from '../../../../utils/filters/filtersHelpers-types';
import { getCurrentUserAccessRight } from '../../../../utils/authorizedMembers';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles(() => ({
  gridContainer: {
    marginBottom: 20,
  },
  paper: {
    margin: '10px 0 0 0',
    padding: 0,
    borderRadius: 4,
  },
}));

interface CaseIncidentProps {
  data: CaseUtils_case$key;
  enableReferences: boolean;
}

const CaseIncidentComponent: FunctionComponent<CaseIncidentProps> = ({ data, enableReferences }) => {
  const classes = useStyles();
  const { t_i18n } = useFormatter();
  const ref = useRef(null);
  const caseIncidentData = useFragment(caseFragment, data);
  const { isFeatureEnable } = useHelper();
  const isFABReplaced = isFeatureEnable('FAB_REPLACEMENT');
  const { canEdit } = getCurrentUserAccessRight(caseIncidentData.currentUserAccessRight);

  const LOCAL_STORAGE_KEY_CASE_TASKS = `cases-${caseIncidentData.id}-caseTask`;

  const { viewStorage, helpers, paginationOptions } = usePaginationLocalStorage<CaseTasksLinesQuery$variables>(
    LOCAL_STORAGE_KEY_CASE_TASKS,
    {
      searchTerm: '',
      sortBy: 'created',
      orderAsc: false,
    },
  );
  const { sortBy, orderAsc, filters } = viewStorage;
  const userFilters = useRemoveIdAndIncorrectKeysFromFilterGroupObject(filters, ['Case-Incident']);
  const contextTaskFilters: FilterGroup = {
    mode: 'and',
    filters: [
      { key: 'entity_type', operator: 'eq', mode: 'or', values: ['Task'] },
      { key: 'objects', operator: 'eq', mode: 'or', values: [caseIncidentData.id] },
    ],
    filterGroups: userFilters && isFilterGroupNotEmpty(userFilters) ? [userFilters] : [],
  };
  const queryTaskPaginationOptions = {
    ...paginationOptions,
    filters: contextTaskFilters,
  } as unknown as CaseTasksLinesQuery$variables;
  const queryRef = useQueryLoading<CaseTasksLinesQuery>(
    caseTasksLinesQuery,
    queryTaskPaginationOptions,
  );

  return (
    <>
      <Grid
        container={true}
        spacing={3}
        classes={{ container: classes.gridContainer }}
      >
        <Grid item xs={6}>
          <CaseIncidentDetails caseIncidentData={caseIncidentData} />
        </Grid>
        <Grid item xs={6}>
          <StixDomainObjectOverview
            stixDomainObject={caseIncidentData}
            displayAssignees
            displayParticipants
          />
        </Grid>
        <Grid item xs={6} ref={ref}>
          {queryRef && (
            <React.Suspense
              fallback={
                <div style={{ height: '100%' }}>
                  <Typography
                    variant="h4"
                    gutterBottom={true}
                    style={{ marginBottom: 10 }}
                  >
                    {t_i18n('Tasks')}
                  </Typography>
                  <Paper classes={{ root: classes.paper }} variant="outlined">
                    <ListLines
                      sortBy={sortBy}
                      orderAsc={orderAsc}
                      handleSort={helpers.handleSort}
                      dataColumns={tasksDataColumns}
                      inline={true}
                      secondaryAction={true}
                    >
                      {Array(20)
                        .fill(0)
                        .map((_, idx) => (
                          <CaseTasksLineDummy key={idx} />
                        ))}
                    </ListLines>
                  </Paper>
                </div>
              }
            >
              <CaseTasksLines
                queryRef={queryRef}
                paginationOptions={queryTaskPaginationOptions}
                caseId={caseIncidentData.id}
                sortBy={sortBy}
                orderAsc={orderAsc}
                handleSort={helpers.handleSort}
                defaultMarkings={convertMarkings(caseIncidentData)}
                containerRef={ref}
                enableReferences={enableReferences}
              />
            </React.Suspense>
          )}
        </Grid>
        <Grid item xs={6}>
          <ContainerStixObjectsOrStixRelationships
            isSupportParticipation={false}
            container={caseIncidentData}
            types={['Incident', 'stix-sighting-relationship', 'Report']}
            title={t_i18n('Origin of the case')}
            enableReferences={enableReferences}
          />
        </Grid>
        <Grid item xs={6}>
          <ContainerStixObjectsOrStixRelationships
            isSupportParticipation={false}
            container={caseIncidentData}
            types={['Stix-Cyber-Observable']}
            title={t_i18n('Observables')}
            enableReferences={enableReferences}
          />
        </Grid>
        <Grid item xs={6}>
          <ContainerStixObjectsOrStixRelationships
            isSupportParticipation={false}
            container={caseIncidentData}
            types={[
              'Threat-Actor',
              'Intrusion-Set',
              'Campaign',
              'Malware',
              'Tool',
              'Attack-Pattern',
              'Identity',
              'Location',
            ]}
            title={t_i18n('Other entities')}
            enableReferences={enableReferences}
          />
        </Grid>
        <Grid item xs={6}>
          <StixCoreObjectExternalReferences
            stixCoreObjectId={caseIncidentData.id}
          />
        </Grid>
        <Grid item xs={6}>
          <StixCoreObjectLatestHistory stixCoreObjectId={caseIncidentData.id} />
        </Grid>
        <Grid item xs={12}>
          <StixCoreObjectOrStixCoreRelationshipNotes
            stixCoreObjectOrStixCoreRelationshipId={caseIncidentData.id}
            defaultMarkings={caseIncidentData.objectMarking ?? []}
          />
        </Grid>
      </Grid>
      {!isFABReplaced && (
        <Security needs={[KNOWLEDGE_KNUPDATE]} hasAccess={canEdit}>
          <CaseIncidentEdition caseId={caseIncidentData.id} />
        </Security>
      )}
    </>
  );
};

export default CaseIncidentComponent;
