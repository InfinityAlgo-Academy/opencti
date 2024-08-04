import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import React, { FunctionComponent } from 'react';
import { useFragment } from 'react-relay';
import { CaseUtils_case$key } from '@components/cases/__generated__/CaseUtils_case.graphql';
import { useFormatter } from '../../../../components/i18n';
import { convertMarkings } from '../../../../utils/edition';
import { KNOWLEDGE_KNUPDATE } from '../../../../utils/hooks/useGranted';
import Security from '../../../../utils/Security';
import StixCoreObjectExternalReferences from '../../analyses/external_references/StixCoreObjectExternalReferences';
import StixCoreObjectOrStixCoreRelationshipNotes from '../../analyses/notes/StixCoreObjectOrStixCoreRelationshipNotes';
import ContainerStixObjectsOrStixRelationships from '../../common/containers/ContainerStixObjectsOrStixRelationships';
import StixCoreObjectLatestHistory from '../../common/stix_core_objects/StixCoreObjectLatestHistory';
import StixDomainObjectOverview from '../../common/stix_domain_objects/StixDomainObjectOverview';
import CaseTasksLines from '../tasks/CaseTasksLines';
import { caseFragment } from '../CaseUtils';
import CaseIncidentDetails from './CaseIncidentDetails';
import CaseIncidentEdition from './CaseIncidentEdition';
import useHelper from '../../../../utils/hooks/useHelper';
import { getCurrentUserAccessRight } from '../../../../utils/authorizedMembers';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles(() => ({
  gridContainer: {
    marginBottom: 20,
  },
}));

interface CaseIncidentProps {
  data: CaseUtils_case$key;
  enableReferences: boolean;
}

const CaseIncidentComponent: FunctionComponent<CaseIncidentProps> = ({ data, enableReferences }) => {
  const classes = useStyles();
  const { t_i18n } = useFormatter();
  const caseIncidentData = useFragment(caseFragment, data);
  const { isFeatureEnable } = useHelper();
  const isFABReplaced = isFeatureEnable('FAB_REPLACEMENT');
  const { canEdit } = getCurrentUserAccessRight(caseIncidentData);

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
        <Grid item={true} xs={6}>
          <CaseTasksLines
            caseId={caseIncidentData.id}
            defaultMarkings={convertMarkings(caseIncidentData)}
            enableReferences={enableReferences}
          />
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
