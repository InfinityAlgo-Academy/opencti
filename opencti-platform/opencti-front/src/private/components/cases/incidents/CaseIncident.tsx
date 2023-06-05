import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import React, { FunctionComponent } from 'react';
import { useFragment } from 'react-relay';
import { useFormatter } from '../../../../components/i18n';
import Loader, { LoaderVariant } from '../../../../components/Loader';
import { convertMarkings } from '../../../../utils/edition';
import { KNOWLEDGE_KNUPDATE } from '../../../../utils/hooks/useGranted';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import Security from '../../../../utils/Security';
import StixCoreObjectExternalReferences from '../../analysis/external_references/StixCoreObjectExternalReferences';
import StixCoreObjectOrStixCoreRelationshipNotes from '../../analysis/notes/StixCoreObjectOrStixCoreRelationshipNotes';
import ContainerHeader from '../../common/containers/ContainerHeader';
import ContainerStixObjectsOrStixRelationships from '../../common/containers/ContainerStixObjectsOrStixRelationships';
import StixCoreObjectLatestHistory from '../../common/stix_core_objects/StixCoreObjectLatestHistory';
import StixDomainObjectOverview from '../../common/stix_domain_objects/StixDomainObjectOverview';
import {
  CaseTasksFilter,
  CaseTasksLinesQuery,
} from '../__generated__/CaseTasksLinesQuery.graphql';
import { CaseUtils_case$key } from '../__generated__/CaseUtils_case.graphql';
import CaseTasksLines, { caseTasksLinesQuery } from '../CaseTasksLines';
import { caseFragment } from '../CaseUtils';
import CaseIncidentDetails from './CaseIncidentDetails';
import CaseIncidentEdition from './CaseIncidentEdition';
import CaseIncidentPopover from './CaseIncidentPopover';

const useStyles = makeStyles(() => ({
  gridContainer: {
    marginBottom: 20,
  },
  container: {
    margin: 0,
  },
}));

interface CaseIncidentProps {
  data: CaseUtils_case$key;
}

const CaseIncidentComponent: FunctionComponent<CaseIncidentProps> = ({
  data,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const caseIncidentData = useFragment(caseFragment, data);

  const tasksFilters = {
    filters: [
      {
        key: ['objectContains' as CaseTasksFilter],
        values: [caseIncidentData.id],
      },
    ],
  };
  const paginationOptions = {
    count: 25,
    filters: tasksFilters.filters,
  };
  const queryRef = useQueryLoading<CaseTasksLinesQuery>(
    caseTasksLinesQuery,
    paginationOptions,
  );

  return (
    <div className={classes.container}>
      <ContainerHeader
        container={caseIncidentData}
        PopoverComponent={<CaseIncidentPopover id={caseIncidentData.id} />}
        enableSuggestions={false}
        disableSharing={true}
      />
      <Grid
        container={true}
        spacing={3}
        classes={{ container: classes.gridContainer }}
      >
        <Grid item={true} xs={6} style={{ paddingTop: 10 }}>
          <CaseIncidentDetails caseIncidentData={caseIncidentData} />
        </Grid>
        <Grid item={true} xs={6} style={{ paddingTop: 10 }}>
          <StixDomainObjectOverview
            stixDomainObject={caseIncidentData}
            displayAssignees={true}
          />
        </Grid>
      </Grid>
      <Grid
        container={true}
        spacing={3}
        classes={{ container: classes.gridContainer }}
        style={{ marginTop: 25 }}
      >
        <Grid item={true} xs={6} style={{ paddingTop: 24 }}>
          {queryRef && (
            <React.Suspense
              fallback={<Loader variant={LoaderVariant.inElement} />}
            >
              <CaseTasksLines
                queryRef={queryRef}
                paginationOptions={paginationOptions}
                caseId={caseIncidentData.id}
                tasksFilters={tasksFilters}
                defaultMarkings={convertMarkings(caseIncidentData)}
              />
            </React.Suspense>
          )}
        </Grid>
        <Grid item={true} xs={6} style={{ paddingTop: 24 }}>
          <ContainerStixObjectsOrStixRelationships
            isSupportParticipation={false}
            container={caseIncidentData}
            types={['Incident', 'stix-sighting-relationship']}
            title={t('Incidents & alerts')}
          />
        </Grid>
      </Grid>
      <Grid
        container={true}
        spacing={3}
        classes={{ container: classes.gridContainer }}
        style={{ marginTop: 25 }}
      >
        <Grid item={true} xs={6} style={{ paddingTop: 24 }}>
          <ContainerStixObjectsOrStixRelationships
            isSupportParticipation={false}
            container={caseIncidentData}
            types={['Stix-Cyber-Observable']}
            title={t('Observables')}
          />
        </Grid>
        <Grid item={true} xs={6} style={{ paddingTop: 24 }}>
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
            title={t('Other entities')}
          />
        </Grid>
      </Grid>
      <Grid
        container={true}
        spacing={3}
        classes={{ container: classes.gridContainer }}
        style={{ marginTop: 25 }}
      >
        <Grid item={true} xs={6}>
          <StixCoreObjectExternalReferences
            stixCoreObjectId={caseIncidentData.id}
          />
        </Grid>
        <Grid item={true} xs={6}>
          <StixCoreObjectLatestHistory stixCoreObjectId={caseIncidentData.id} />
        </Grid>
      </Grid>
      <StixCoreObjectOrStixCoreRelationshipNotes
        stixCoreObjectOrStixCoreRelationshipId={caseIncidentData.id}
        defaultMarkings={(caseIncidentData.objectMarking?.edges ?? []).map(
          (edge) => edge.node,
        )}
      />
      <Security needs={[KNOWLEDGE_KNUPDATE]}>
        <CaseIncidentEdition caseId={caseIncidentData.id} />
      </Security>
    </div>
  );
};

export default CaseIncidentComponent;
