import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import React, { FunctionComponent } from 'react';
import { useFragment } from 'react-relay';
import { convertMarkings } from '../../../../utils/edition';
import { KNOWLEDGE_KNUPDATE } from '../../../../utils/hooks/useGranted';
import Security from '../../../../utils/Security';
import StixCoreObjectExternalReferences from '../../analyses/external_references/StixCoreObjectExternalReferences';
import StixCoreObjectOrStixCoreRelationshipNotes from '../../analyses/notes/StixCoreObjectOrStixCoreRelationshipNotes';
import ContainerStixObjectsOrStixRelationships from '../../common/containers/ContainerStixObjectsOrStixRelationships';
import StixCoreObjectLatestHistory from '../../common/stix_core_objects/StixCoreObjectLatestHistory';
import StixDomainObjectOverview from '../../common/stix_domain_objects/StixDomainObjectOverview';
import { CaseUtils_case$key } from '../__generated__/CaseUtils_case.graphql';
import CaseTasksLines from '../tasks/CaseTasksLines';
import { caseFragment } from '../CaseUtils';
import CaseRftDetails from './CaseRftDetails';
import CaseRftEdition from './CaseRftEdition';
import { useFormatter } from '../../../../components/i18n';
import useHelper from '../../../../utils/hooks/useHelper';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles(() => ({
  gridContainer: {
    marginBottom: 20,
  },
}));

interface CaseRftProps {
  data: CaseUtils_case$key;
  enableReferences: boolean;
}

const CaseRftComponent: FunctionComponent<CaseRftProps> = ({ data, enableReferences }) => {
  const classes = useStyles();
  const { t_i18n } = useFormatter();
  const { isFeatureEnable } = useHelper();
  const isFABReplaced = isFeatureEnable('FAB_REPLACEMENT');
  const caseRftData = useFragment(caseFragment, data);

  return (
    <>
      <Grid
        container
        spacing={3}
        classes={{ container: classes.gridContainer }}
      >
        <Grid item xs={6}>
          <CaseRftDetails caseRftData={caseRftData} />
        </Grid>
        <Grid item xs={6}>
          <StixDomainObjectOverview
            stixDomainObject={caseRftData}
            displayAssignees
            displayParticipants
          />
        </Grid>
        <Grid item xs={6}>
          <CaseTasksLines
            caseId={caseRftData.id}
            defaultMarkings={convertMarkings(caseRftData)}
            enableReferences={enableReferences}
          />
        </Grid>
        <Grid item xs={6}>
          <ContainerStixObjectsOrStixRelationships
            isSupportParticipation={false}
            container={caseRftData}
            types={['Incident', 'stix-sighting-relationship', 'Report']}
            title={t_i18n('Origin of the case')}
            enableReferences={enableReferences}
          />
        </Grid>
        <Grid item xs={6}>
          <ContainerStixObjectsOrStixRelationships
            isSupportParticipation={false}
            container={caseRftData}
            types={['Stix-Cyber-Observable']}
            title={t_i18n('Observables')}
            enableReferences={enableReferences}
          />
        </Grid>
        <Grid item xs={6}>
          <ContainerStixObjectsOrStixRelationships
            isSupportParticipation={false}
            container={caseRftData}
            enableReferences={enableReferences}
          />
        </Grid>
        <Grid item xs={6}>
          <StixCoreObjectExternalReferences stixCoreObjectId={caseRftData.id} />
        </Grid>
        <Grid item xs={6}>
          <StixCoreObjectLatestHistory stixCoreObjectId={caseRftData.id} />
        </Grid>
        <Grid item xs={12}>
          <StixCoreObjectOrStixCoreRelationshipNotes
            stixCoreObjectOrStixCoreRelationshipId={caseRftData.id}
            defaultMarkings={caseRftData.objectMarking ?? []}
          />
        </Grid>
      </Grid>
      {!isFABReplaced && (
        <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <CaseRftEdition caseId={caseRftData.id} />
        </Security>
      )}
    </>
  );
};

export default CaseRftComponent;
