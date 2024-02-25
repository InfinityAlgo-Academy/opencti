import { expect, it, describe, beforeAll, afterAll } from 'vitest';
import gql from 'graphql-tag';
import { queryAsAdmin } from '../../utils/testQuery';
import { OPENCTI_ADMIN_UUID } from '../../../src/schema/general';

const LIST_QUERY = gql`
  query groups($first: Int, $after: ID, $orderBy: GroupsOrdering, $orderMode: OrderingMode, $search: String) {
    groups(first: $first, after: $after, orderBy: $orderBy, orderMode: $orderMode, search: $search) {
      edges {
        node {
          id
          name
          description
        }
      }
    }
  }
`;

const READ_QUERY = gql`
  query group($id: String!) {
    group(id: $id) {
      id
      name
      description
      default_dashboard {
        name
      }
    }
  }
`;

describe('Group resolver standard behavior', () => {
  let groupInternalId; // the one we will use in all tests
  const groupsToDeleteIds = []; // keep track for deletion at the end of the tests
  it('should group created', async () => {
    const CREATE_QUERY = gql`
      mutation GroupAdd($input: GroupAddInput!) {
        groupAdd(input: $input) {
          id
          name
          description
          group_confidence_level { 
            max_confidence
            overrides {
              entity_type
              max_confidence
            }
          }
        }
      }
    `;
    // Create the group
    const GROUP_TO_CREATE = {
      input: {
        name: 'Group',
        description: 'Group description',
        group_confidence_level: { max_confidence: 50, overrides: [] },
      },
    };
    let group = await queryAsAdmin({
      query: CREATE_QUERY,
      variables: GROUP_TO_CREATE,
    });
    expect(group).not.toBeNull();
    expect(group.data.groupAdd).not.toBeNull();
    expect(group.data.groupAdd.name).toEqual('Group');
    expect(group.data.groupAdd.group_confidence_level.max_confidence).toEqual(50);
    // we will use this one in all the subsequent tests
    groupInternalId = group.data.groupAdd.id;
    groupsToDeleteIds.push(group.data.groupAdd.id);

    // create some more with different configuration of confidence level
    const GROUP_TO_CREATE_WITH_OVERRIDES = {
      input: {
        name: 'Group with overrides',
        description: 'Group description',
        group_confidence_level: { max_confidence: 50, overrides: [{ entity_type: 'Report', max_confidence: 80 }] },
      },
    };
    group = await queryAsAdmin({
      query: CREATE_QUERY,
      variables: GROUP_TO_CREATE_WITH_OVERRIDES,
    });
    expect(group.data.groupAdd.group_confidence_level.overrides[0]).toEqual({ entity_type: 'Report', max_confidence: 80 });
    groupsToDeleteIds.push(group.data.groupAdd.id);
  });

  describe('dashboard preferences', () => {
    describe('when a group does not have a default dashboard', () => {
      it('returns "null"', async () => {
        const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: groupInternalId } });

        expect(queryResult.data.group.default_dashboard).toBeNull();
      });
    });

    describe('when a group has a default dashboard', () => {
      let dashboardId = '';

      beforeAll(async () => {
        const dashboardCreationQuery = await queryAsAdmin({
          query: gql`
            mutation CreateDashboard($input: WorkspaceAddInput!){
              workspaceAdd(input: $input){
                id
              }
            }`,
          variables: {
            input: {
              type: 'dashboard',
              name: 'dashboard de test'
            }
          }
        });
        dashboardId = dashboardCreationQuery.data.workspaceAdd.id;
      });

      afterAll(async () => {
        await queryAsAdmin({
          query: gql`
            mutation workspaceDelete($id: ID!) {
              workspaceDelete(id: $id)
            }`,
          variables: {
            id: dashboardId
          }
        });
      });

      it('can have a reference to it', async () => {
        const setDefaultDashboardMutation = await queryAsAdmin({
          query: gql`
            mutation setDefaultDashboard($groupId: ID!, $editInput: [EditInput]!) {
              groupEdit(id: $groupId) {
                fieldPatch(input: $editInput) {
                  default_dashboard {
                    id
                    name
                  }
                }
              }
            }`,
          variables: {
            groupId: groupInternalId,
            editInput: [{
              key: 'default_dashboard',
              value: dashboardId
            }]
          }
        });

        expect(setDefaultDashboardMutation.data.groupEdit.fieldPatch.default_dashboard.id).toEqual(dashboardId);
        expect(setDefaultDashboardMutation.data.groupEdit.fieldPatch.default_dashboard.name).toEqual('dashboard de test');
      });

      it('can remove the reference to the default dashboard', async () => {
        const removeDefaultDashboardMutation = await queryAsAdmin({
          query: gql`
            mutation removeDefaultDashboardMutation($groupId: ID!, $editInput: [EditInput]!) {
              groupEdit(id: $groupId) {
                fieldPatch(input: $editInput) {
                  default_dashboard {
                    id
                    name
                  }
                }
              }
            }`,
          variables: {
            groupId: groupInternalId,
            editInput: [{
              key: 'default_dashboard',
              value: [null]
            }]
          }
        });
        expect(removeDefaultDashboardMutation.data.groupEdit.fieldPatch.default_dashboard).toBeNull();
      });
    });
  });

  it('should group loaded by internal id', async () => {
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: groupInternalId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.group).not.toBeNull();
    expect(queryResult.data.group.id).toEqual(groupInternalId);
  });
  it('should list groups', async () => {
    const queryResult = await queryAsAdmin({ query: LIST_QUERY, variables: { first: 10 } });
    expect(queryResult.data.groups.edges.length).toEqual(7);
  });
  it('should update group', async () => {
    const UPDATE_QUERY = gql`
      mutation GroupEdit($id: ID!, $input: [EditInput]!) {
        groupEdit(id: $id) {
          fieldPatch(input: $input) {
            id
            name
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: UPDATE_QUERY,
      variables: { id: groupInternalId, input: { key: 'name', value: ['Group - test'] } },
    });
    expect(queryResult.data.groupEdit.fieldPatch.name).toEqual('Group - test');
  });
  it('should update group confidence level', async () => {
    const UPDATE_QUERY = gql`
      mutation GroupEdit($id: ID!, $input: [EditInput]!) {
        groupEdit(id: $id) {
          fieldPatch(input: $input) {
            id
            group_confidence_level {
              max_confidence
              overrides { 
                max_confidence 
                entity_type 
              }
            }
          }
        }
      }
    `;
    const group_confidence_level = {
      max_confidence: 30,
      overrides: [{ entity_type: 'Report', max_confidence: 50 }],
    };
    let queryResult = await queryAsAdmin({
      query: UPDATE_QUERY,
      variables: {
        id: groupInternalId,
        input: { key: 'group_confidence_level', value: [group_confidence_level] }
      },
    });
    expect(queryResult.data.groupEdit.fieldPatch.group_confidence_level).toEqual(group_confidence_level);

    // update by patching
    queryResult = await queryAsAdmin({
      query: UPDATE_QUERY,
      variables: {
        id: groupInternalId,
        input: { key: 'group_confidence_level', object_path: '/group_confidence_level/max_confidence', value: [87] }
      },
    });
    expect(queryResult.data.groupEdit.fieldPatch.group_confidence_level).toEqual({
      max_confidence: 87,
      overrides: [{ entity_type: 'Report', max_confidence: 50 }], // unchanged!
    });
    queryResult = await queryAsAdmin({
      query: UPDATE_QUERY,
      variables: {
        id: groupInternalId,
        input: { key: 'group_confidence_level', object_path: '/group_confidence_level/overrides/0/max_confidence', value: [63] }
      },
    });
    expect(queryResult.data.groupEdit.fieldPatch.group_confidence_level).toEqual({
      max_confidence: 87, // unchanged!
      overrides: [{ entity_type: 'Report', max_confidence: 63 }],
    });
  });
  it('should context patch group', async () => {
    const CONTEXT_PATCH_QUERY = gql`
      mutation GroupEdit($id: ID!, $input: EditContext) {
        groupEdit(id: $id) {
          contextPatch(input: $input) {
            id
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: CONTEXT_PATCH_QUERY,
      variables: { id: groupInternalId, input: { focusOn: 'description' } },
    });
    expect(queryResult.data.groupEdit.contextPatch.id).toEqual(groupInternalId);
  });
  it('should context clean group', async () => {
    const CONTEXT_PATCH_QUERY = gql`
      mutation GroupEdit($id: ID!) {
        groupEdit(id: $id) {
          contextClean {
            id
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: CONTEXT_PATCH_QUERY,
      variables: { id: groupInternalId },
    });
    expect(queryResult.data.groupEdit.contextClean.id).toEqual(groupInternalId);
  });
  it('should add relation in group', async () => {
    const RELATION_ADD_QUERY = gql`
      mutation GroupEdit($id: ID!, $input: InternalRelationshipAddInput!) {
        groupEdit(id: $id) {
          relationAdd(input: $input) {
            id
            to {
              ... on Group {
                members {
                  edges {
                    node {
                      id
                      standard_id
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: RELATION_ADD_QUERY,
      variables: {
        id: groupInternalId,
        input: {
          fromId: OPENCTI_ADMIN_UUID,
          relationship_type: 'member-of',
        },
      },
    });
    expect(queryResult.data.groupEdit.relationAdd.to.members.edges.length).toEqual(1);
  });
  it('should delete relation in group', async () => {
    const RELATION_DELETE_QUERY = gql`
      mutation GroupEdit($id: ID!, $fromId: StixRef, $relationship_type: String!) {
        groupEdit(id: $id) {
          relationDelete(fromId: $fromId, relationship_type: $relationship_type) {
            id
            members {
              edges {
                node {
                  id
                  standard_id
                }
              }
            }
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: RELATION_DELETE_QUERY,
      variables: {
        id: groupInternalId,
        fromId: OPENCTI_ADMIN_UUID,
        relationship_type: 'member-of',
      },
    });
    expect(queryResult.data.groupEdit.relationDelete.members.edges.length).toEqual(0);
  });
  it('should add default marking in group', async () => {
    const EDIT_DEFAULT_VALUES_QUERY = gql`
      mutation GroupEdit($id: ID!, $input: DefaultMarkingInput!) {
        groupEdit(id: $id) {
          editDefaultMarking(input: $input) {
            id
            default_marking {
              entity_type
              values {
                id
              }
            }
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: EDIT_DEFAULT_VALUES_QUERY,
      variables: {
        id: groupInternalId,
        input: {
          entity_type: 'GLOBAL',
          values: ['marking-definition--78ca4366-f5b8-4764-83f7-34ce38198e27'],
        },
      },
    });
    expect(queryResult.data.groupEdit.editDefaultMarking.default_marking[0].values.length).toEqual(1);
  });
  it('should delete default marking in group', async () => {
    const EDIT_DEFAULT_VALUES_QUERY = gql`
      mutation GroupEdit($id: ID!, $input: DefaultMarkingInput!) {
        groupEdit(id: $id) {
          editDefaultMarking(input: $input) {
            id
            default_marking {
              entity_type
              values {
                id
              }
            }
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: EDIT_DEFAULT_VALUES_QUERY,
      variables: {
        id: groupInternalId,
        input: {
          entity_type: 'GLOBAL',
          values: [],
        },
      },
    });
    expect(queryResult.data.groupEdit.editDefaultMarking.default_marking[0].values.length).toEqual(0);
  });
  it('should group deleted', async () => {
    const DELETE_QUERY = gql`
      mutation groupDelete($id: ID!) {
        groupEdit(id: $id) {
          delete
        }
      }
    `;
    // Delete the groups
    for (let i = 0; i < groupsToDeleteIds.length; i += 1) {
      const groupId = groupsToDeleteIds[i];
      await queryAsAdmin({
        query: DELETE_QUERY,
        variables: { id: groupId },
      });
      // Verify is no longer found
      const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: groupInternalId } });
      expect(queryResult).not.toBeNull();
      expect(queryResult.data.group).toBeNull();
    }
  });
});
