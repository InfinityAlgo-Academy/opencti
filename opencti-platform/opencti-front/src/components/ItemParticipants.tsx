import { FunctionComponent } from 'react';
import Button from '@mui/material/Button';
import { ObjectParticipantFieldParticipantsSearchQuery$data } from '../private/components/common/form/__generated__/ObjectParticipantFieldParticipantsSearchQuery.graphql';
import FieldOrEmpty from './FieldOrEmpty';

type Participants = ObjectParticipantFieldParticipantsSearchQuery$data['participants'];
interface ItemParticipantsProps {
  participants: Participants;
}

const ItemParticipants: FunctionComponent<ItemParticipantsProps> = ({
  participants,
}) => {
  const participantsData = (participants?.edges ?? []).slice()
    .sort((a, b) => a.node.name.localeCompare(b.node.name))
    .map((n) => n.node);

  return (
    <FieldOrEmpty source={participantsData}>
      {participantsData.map((participant) => (
        <Button
          key={participant.id}
          variant="outlined"
          color="primary"
          size="small"
          style={{ margin: '0 7px 7px 0', cursor: 'default' }}
        >
          {participant.name}
        </Button>
      ))}
    </FieldOrEmpty>
  );
};
export default ItemParticipants;
