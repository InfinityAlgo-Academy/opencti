import React, { ReactNode } from 'react';
import Drawer from '@components/common/drawer/Drawer';
import { useFormatter } from '../../../../../../components/i18n';

interface CreateSDODrawerProps {
  children: ReactNode
  type?: string
}

const CreateSDODrawer = ({ children, type }: CreateSDODrawerProps) => {
  const { t_i18n } = useFormatter();
  let title = t_i18n('Create an entity');
  if (type) {
    const typeLabel = type ? t_i18n(`entity_${type}`) : '';
    title += ` (${typeLabel})`;
  }

  return (
    <Drawer
      title={title}
      open={true}
    >
      <>{children}</>
    </Drawer>
  );
};

export default CreateSDODrawer;
