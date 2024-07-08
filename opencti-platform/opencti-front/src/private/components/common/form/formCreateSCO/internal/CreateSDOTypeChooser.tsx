import { ListItemButton } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import React from 'react';
import useSchema from '../../../../../../utils/hooks/useSchema';
import { useFormatter } from '../../../../../../components/i18n';

interface CreateSDOTypeChooserProps {
  onChange: (type: string) => void
}

const CreateSDOTypeChooser = ({ onChange }: CreateSDOTypeChooserProps) => {
  const { t_i18n } = useFormatter();
  const { schema } = useSchema();

  return (
    <List>
      {schema.sdos.map(({ label }) => (
        <ListItemButton
          key={label}
          divider={true}
          dense={true}
          onClick={() => onChange(label)}
        >
          <ListItemText primary={t_i18n(`entity_${label}`)} />
        </ListItemButton>
      ))}
    </List>
  );
};

export default CreateSDOTypeChooser;
