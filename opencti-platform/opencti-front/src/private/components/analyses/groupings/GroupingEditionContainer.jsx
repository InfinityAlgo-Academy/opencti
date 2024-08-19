import React, { useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import Drawer, { DrawerVariant } from '../../common/drawer/Drawer';
import { useFormatter } from '../../../../components/i18n';
import GroupingEditionOverview from './GroupingEditionOverview';
import { useIsEnforceReference } from '../../../../utils/hooks/useEntitySettings';
import useHelper from '../../../../utils/hooks/useHelper';
import GroupingPopoverDeletion from './GroupingPopoverDeletion';

const GroupingEditionContainer = (props) => {
  const { t_i18n } = useFormatter();
  const { isFeatureEnable } = useHelper();
  const isFABReplaced = isFeatureEnable('FAB_REPLACEMENT');
  const { handleClose, grouping, open, controlledDial } = props;
  const { editContext } = grouping;
  const [displayDelete, setDisplayDelete] = useState(false);
  const handleCloseDelete = () => {
    setDisplayDelete(false);
  };
  const handleOpenDelete = () => {
    setDisplayDelete(true);
  };

  return (
    <Drawer
      title={t_i18n('Update a grouping')}
      open={open}
      onClose={handleClose}
      variant={!isFABReplaced && open == null ? DrawerVariant.update : undefined}
      context={editContext}
      controlledDial={isFABReplaced ? controlledDial : undefined}
    >
      <>
        <GroupingEditionOverview
          grouping={grouping}
          enableReferences={useIsEnforceReference('Grouping')}
          context={editContext}
          handleClose={handleClose}
        />
        {isFABReplaced
          && <GroupingPopoverDeletion
            groupingId={grouping.id}
            displayDelete={displayDelete}
            handleClose={handleClose}
            handleCloseDelete={handleCloseDelete}
            handleOpenDelete={handleOpenDelete}
             />}
      </>
    </Drawer>
  );
};

const GroupingEditionFragment = createFragmentContainer(
  GroupingEditionContainer,
  {
    grouping: graphql`
      fragment GroupingEditionContainer_grouping on Grouping {
        id
        ...GroupingEditionOverview_grouping
        editContext {
          name
          focusOn
        }
      }
    `,
  },
);

export default GroupingEditionFragment;
