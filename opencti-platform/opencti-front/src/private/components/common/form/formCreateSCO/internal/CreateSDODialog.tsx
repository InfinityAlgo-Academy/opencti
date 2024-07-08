import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import React, { ReactNode } from 'react';
import { useFormatter } from '../../../../../../components/i18n';

interface CreateSDODialogProps {
  children: ReactNode
  type?: string
}

const CreateSDODialog = ({ children, type }: CreateSDODialogProps) => {
  const { t_i18n } = useFormatter();
  let title = t_i18n('Create an entity');
  if (type) {
    const typeLabel = type ? t_i18n(`entity_${type}`) : '';
    title += ` (${typeLabel})`;
  }

  return (
    <Dialog
      open={true}
      fullWidth={true}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent style={{ paddingTop: 0 }}>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default CreateSDODialog;
