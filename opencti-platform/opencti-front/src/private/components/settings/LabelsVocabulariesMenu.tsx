import React, { FunctionComponent } from 'react';
import NavToolbarMenu, { MenuEntry } from '../common/menus/NavToolbarMenu';

const LabelsVocabulariesMenu: FunctionComponent = () => {
  const entries: MenuEntry[] = [
    {
      path: '/dashboard/settings/vocabularies/labels',
      label: 'Labels',
    },
    {
      path: '/dashboard/settings/vocabularies/kill_chain_phases',
      label: 'Kill chain phases',
    },
    {
      path: '/dashboard/settings/vocabularies/fields',
      label: 'Vocabularies',
    },
    {
      path: '/dashboard/settings/vocabularies/statusTemplates',
      label: 'Status Templates',
    },
  ];

  return (
    <NavToolbarMenu entries={entries} />
  );
};

export default LabelsVocabulariesMenu;
