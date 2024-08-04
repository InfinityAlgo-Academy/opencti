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
import CaseRfiDetails from './CaseRfiDetails';
import CaseRfiEdition from './CaseRfiEdition';
import { useFormatter } from '../../../../components/i18n';
import useHelper from '../../../../utils/hooks/useHelper';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles(() => ({
  gridContainer: {
    marginBottom: 20,
  },
}));

interface CaseRfiProps {
  data: CaseUtils_case$key;
  enableReferences: boolean;
}

const CaseRfiComponent: FunctionComponent<CaseRfiProps> = ({ data, enableReferences }) => {
  const classes = useStyles();
  const { t_i18n } = useFormatter();
  const caseRfiData = useFragment(caseFragment, data);
  const { isFeatureEnable } = useHelper();
  const isFABReplaced = isFeatureEnable('FAB_REPLACEMENT');

  return (
    <>
      <Grid
        container
        spacing={3}
        classes={{ container: classes.gridContainer }}
      >
        <Grid item xs={6}>
          <CaseRfiDetails caseRfiData={caseRfiData} />
        </Grid>
        <Grid item xs={6}>
          <StixDomainObjectOverview
            stixDomainObject={caseRfiData}
            displayAssignees
            displayParticipants
          />
        </Grid>
        <Grid item xs={6}>
          <CaseTasksLines
            caseId={caseRfiData.id}
            defaultMarkings={convertMarkings(caseRfiData)}
            enableReferences={enableReferences}
          />
        </Grid>
        <Grid item xs={6}>
          <ContainerStixObjectsOrStixRelationships
            isSupportParticipation={false}
            container={caseRfiData}
            types={['Incident', 'stix-sighting-relationship', 'Report']}
            title={t_i18n('Origin of the case')}
            enableReferences={enableReferences}
          />
        </Grid>
        <Grid item xs={6}>
          <ContainerStixObjectsOrStixRelationships
            isSupportParticipation={false}
            container={caseRfiData}
            types={['Stix-Cyber-Observable']}
            title={t_i18n('Observables')}
            enableReferences={enableReferences}
          />
        </Grid>
        <Grid item xs={6}>
          <ContainerStixObjectsOrStixRelationships
            isSupportParticipation={false}
            container={caseRfiData}
            enableReferences={enableReferences}
          />
        </Grid>
        <Grid item xs={6}>
          <StixCoreObjectExternalReferences stixCoreObjectId={caseRfiData.id} />
        </Grid>
        <Grid item xs={6}>
          <StixCoreObjectLatestHistory stixCoreObjectId={caseRfiData.id} />
        </Grid>
        <Grid item xs={12}>
          <StixCoreObjectOrStixCoreRelationshipNotes
            stixCoreObjectOrStixCoreRelationshipId={caseRfiData.id}
            defaultMarkings={caseRfiData.objectMarking ?? []}
          />
        </Grid>
      </Grid>
      {!isFABReplaced && (
        <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <CaseRfiEdition caseId={caseRfiData.id} />
        </Security>
      )}
    </>
  );
};

export default CaseRfiComponent;
