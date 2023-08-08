import React from 'react';
import { graphql, useFragment } from 'react-relay';
import { GroupHiddenTypes_group$data } from './__generated__/GroupHiddenTypes_group.graphql';
import HiddenTypesChipList from '../hidden_types/HiddenTypesChipList';
import { Group_group$data } from './__generated__/Group_group.graphql';

const groupHiddenTypesFragment = graphql`
  fragment GroupHiddenTypesChipList_group on Group {
    default_hidden_types
  }
`;

const GroupHiddenTypesChipList = ({
  groupData,
}: {
  groupData: Group_group$data
}) => {
  const group = useFragment(groupHiddenTypesFragment, groupData) as GroupHiddenTypes_group$data;

  const hiddenTypesGroup = group.default_hidden_types ?? [];

  return (
      <HiddenTypesChipList hiddenTypes={hiddenTypesGroup}/>
  );
};

export default GroupHiddenTypesChipList;
