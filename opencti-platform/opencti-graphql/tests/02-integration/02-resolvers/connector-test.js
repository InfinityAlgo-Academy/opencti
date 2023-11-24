import { expect, it, describe } from 'vitest';
import gql from 'graphql-tag';
import { queryAsAdmin } from '../../utils/testQuery';

const CREATE_WORK_QUERY = gql`
  mutation workAdd($connectorId: String!, $friendlyName: String) {
    workAdd(connectorId: $connectorId, friendlyName: $friendlyName) {
      id
    }
  }
`;

const LIST_WORK_QUERY = gql`
  query works(
    $first: Int
    $after: ID
    $orderBy: WorksOrdering
    $orderMode: OrderingMode
    $search: String
    $filters: FilterGroup
  ) {
    works(
      first: $first
      after: $after
      orderBy: $orderBy
      orderMode: $orderMode
      search: $search
      filters: $filters
    ) {
      edges {
        node {
          id
          name
          status
        }
      }
    }
  }
`;

const READ_WORK_QUERY = gql`
  query work($id: ID!) {
    work(id: $id) {
      id
      name
      status
    }
  }
`;

const UPDATE_WORK_QUERY = gql`
  mutation workToProcessed($id: ID!, $message: String, $inError: Boolean) {
    workEdit(id: $id) {
      toProcessed(message: $message, inError: $inError)
    }
  }
`;

const DELETE_WORK_QUERY = gql`
  mutation workDelete($id: ID!) {
    workEdit(id: $id) {
      delete
    }
  }
`;

const CREATE_CONNECTOR_QUERY = gql`
  mutation RegisterConnector($input: RegisterConnectorInput) {
    registerConnector(input: $input) {
      id
      connector_state
      name
    }
  }
`;

const READ_CONNECTOR_QUERY = gql`
  query GetConnectors($id: String!) {
    connector(id: $id) {
      id
      name
    }
  }
`;

const DELETE_CONNECTOR_QUERY = gql`
  mutation ConnectorDeletionMutation($id: ID!) {
    deleteConnector(id: $id)
  }
`;

describe('Connector resolver standard behaviour', () => {
  let workId;
  let testConnectorId;
  it('should create connector', async () => {
    const CONNECTOR_TO_CREATE = {
      input: {
        id: '5ed680de-75e2-4aa0-bec0-4e8e5a0d1695',
        name: 'TestConnector',
        type: 'EXTERNAL_IMPORT',
        scope: 'Observable',
        auto: true,
        only_contextual: true,
      },
    };
    const connector = await queryAsAdmin({
      query: CREATE_CONNECTOR_QUERY,
      variables: CONNECTOR_TO_CREATE,
    });
    expect(connector).not.toBeNull();
    expect(connector.data.registerConnector).not.toBeNull();
    expect(connector.data.registerConnector.name).toEqual('TestConnector');
    testConnectorId = connector.data.registerConnector.id;
  });
  it('should create work', async () => {
    const WORK_TO_CREATE = {
      connectorId: testConnectorId,
      friendlyName: 'TestConnector',
    };

    const work = await queryAsAdmin({
      query: CREATE_WORK_QUERY,
      variables: WORK_TO_CREATE,
    });

    expect(work).not.toBeNull();
    expect(work.data.workAdd).not.toBeNull();
    expect(work.data.workAdd.id).not.toBeNull();
    workId = work.data.workAdd.id;
  });
  it('should list works', async () => {
    // List all works for connector
    const queryResult = await queryAsAdmin({
      query: LIST_WORK_QUERY,
      variables: {
        filters: {
          mode: 'and',
          filters: [{ key: 'connector_id', values: [testConnectorId] }],
          filterGroups: [],
        },
      },
    });

    expect(queryResult.data.works.edges.length).toEqual(1);
  });
  it('should update work from progress to complete', async () => {
    // Read work
    let queryResult = await queryAsAdmin({ query: READ_WORK_QUERY, variables: { id: workId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.work.status).toEqual('progress');

    // Update work and declare as finished
    queryResult = await queryAsAdmin({
      query: UPDATE_WORK_QUERY,
      variables: { id: workId, message: 'Finished', inError: false },
    });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.workEdit.toProcessed).toEqual(workId);

    // Read work and verify status
    queryResult = await queryAsAdmin({ query: READ_WORK_QUERY, variables: { id: workId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.work.status).toEqual('complete');
  });
  it('should delete work', async () => {
    // Delete the work
    await queryAsAdmin({
      query: DELETE_WORK_QUERY,
      variables: { id: workId },
    });

    // Verify is no longer found
    const queryResult = await queryAsAdmin({ query: READ_WORK_QUERY, variables: { id: workId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.work).toBeNull();
  });
  it('should delete connector', async () => {
    // Delete the connector
    await queryAsAdmin({ query: DELETE_CONNECTOR_QUERY, variables: { id: '5ed680de-75e2-4aa0-bec0-4e8e5a0d1695' } });
    // Verify is no longer found
    const queryResult = await queryAsAdmin({ query: READ_CONNECTOR_QUERY, variables: { id: '5ed680de-75e2-4aa0-bec0-4e8e5a0d1695' } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.connector).toBeNull();
  });
});
