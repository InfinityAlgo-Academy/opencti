import React, { FunctionComponent } from 'react';
import { graphql } from 'relay-runtime';
import useHelper from 'src/utils/hooks/useHelper';
import { Grid, styled } from '@mui/material';
import { CollaborativeSecurity } from 'src/utils/Security';
import { KNOWLEDGE_KNUPDATE } from 'src/utils/hooks/useGranted';
import { useFragment } from 'react-relay';
import ContainerStixObjectsOrStixRelationships from '@components/common/containers/ContainerStixObjectsOrStixRelationships';
import StixCoreObjectLatestHistory from '@components/common/stix_core_objects/StixCoreObjectLatestHistory';
import StixDomainObjectOverview from '@components/common/stix_domain_objects/StixDomainObjectOverview';
import StixCoreObjectExternalReferences from '../external_references/StixCoreObjectExternalReferences';
import NoteEdition from './NoteEdition';
import { Note_note$key } from './__generated__/Note_note.graphql';
import NoteDetails from './NoteDetails';

const NoteComponentFragment = graphql`
  fragment Note_note on Note {
    id
    standard_id
    entity_type
    x_opencti_stix_ids
    spec_version
    revoked
    confidence
    created
    modified
    created_at
    updated_at
    createdBy {
      id
      name
      entity_type
      x_opencti_reliability
    }
    creators {
      id
      name
    }
    objectMarking {
      id
      definition_type
      definition
      x_opencti_order
      x_opencti_color
    }
    objectLabel {
      id
      value
      color
    }
    status {
      id
      order
      template {
        name
        color
      }
    }
    workflowEnabled
    ...NoteDetails_note
    ...ContainerHeader_container
    ...ContainerStixObjectsOrStixRelationships_container
  }
`;

interface NoteComponentProps {
  noteFragment: Note_note$key
  enableReferences: boolean
}

const NoteComponent: FunctionComponent<NoteComponentProps> = ({
  noteFragment,
  enableReferences,
}) => {
  const note = useFragment(NoteComponentFragment, noteFragment);
  const { isFeatureEnable } = useHelper();
  const FABReplaced = isFeatureEnable('FAB_REPLACEMENT');

  // Styled components
  const PaddedGrid = styled(Grid)({
    paddingTop: 10,
  });
  const MarginGrid = styled(Grid)(({ bottomMargin }: { bottomMargin?: number }) => ({
    marginTop: 25,
    marginBottom: bottomMargin,
  }));

  return (<>
    <MarginGrid
      container={true}
      spacing={3}
    >
      <PaddedGrid item={true} xs={6}>
        <NoteDetails note={note} />
      </PaddedGrid>
      <PaddedGrid item={true} xs={6}>
        <StixDomainObjectOverview stixDomainObject={note} />
      </PaddedGrid>
    </MarginGrid>
    <MarginGrid
      container={true}
      spacing={3}
      bottomMargin={20}
    >
      <Grid item={true} xs={12}>
        <ContainerStixObjectsOrStixRelationships
          isSupportParticipation={true}
          container={note}
          enableReferences={enableReferences}
        />
      </Grid>
    </MarginGrid>
    <MarginGrid
      container={true}
      spacing={3}
      bottomMargin={20}
    >
      <Grid item={true} xs={6}>
        <StixCoreObjectExternalReferences stixCoreObjectId={note.id} />
      </Grid>
      <Grid item={true} xs={6}>
        <StixCoreObjectLatestHistory stixCoreObjectId={note.id} />
      </Grid>
    </MarginGrid>
    {!FABReplaced
      && <CollaborativeSecurity data={note} needs={[KNOWLEDGE_KNUPDATE]}>
        <NoteEdition noteId={note.id} />
      </CollaborativeSecurity>
    }
  </>);
};

export default NoteComponent;
