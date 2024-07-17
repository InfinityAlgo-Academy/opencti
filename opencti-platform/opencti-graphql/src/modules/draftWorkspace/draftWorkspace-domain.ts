import type { AuthContext, AuthUser } from '../../types/user';
import { listEntitiesPaginated, storeLoadById } from '../../database/middleware-loader';
import type { DraftWorkspaceAddInput, QueryDraftWorkspacesArgs } from '../../generated/graphql';
import { createInternalObject } from '../../domain/internalObject';
import { now } from '../../utils/format';
import { type BasicStoreEntityDraftWorkspace, ENTITY_TYPE_DRAFT_WORKSPACE, type StoreEntityDraftWorkspace } from './draftWorkspace-types';
import { elCreateIndex, elDeleteIndices, elPlatformIndices, engineMappingGenerator } from '../../database/engine';
import { ES_INDEX_PREFIX } from '../../database/utils';
import { FunctionalError } from '../../config/errors';
import { deleteElementById } from '../../database/middleware';

export const findById = (context: AuthContext, user: AuthUser, id: string) => {
  return storeLoadById<BasicStoreEntityDraftWorkspace>(context, user, id, ENTITY_TYPE_DRAFT_WORKSPACE);
};

export const findAll = (context: AuthContext, user: AuthUser, args: QueryDraftWorkspacesArgs) => {
  return listEntitiesPaginated<BasicStoreEntityDraftWorkspace>(context, user, [ENTITY_TYPE_DRAFT_WORKSPACE], args);
};

export const addDraftWorkspace = async (context: AuthContext, user: AuthUser, input: DraftWorkspaceAddInput) => {
  const defaultOps = {
    created_at: now(),
  };

  const draftWorkspaceInput = { ...input, ...defaultOps };
  const createdDraftWorkspace = await createInternalObject<StoreEntityDraftWorkspace>(context, user, draftWorkspaceInput, ENTITY_TYPE_DRAFT_WORKSPACE);

  const newDraftIndexName = `${ES_INDEX_PREFIX}_draft_workspace_${createdDraftWorkspace.id}`;
  const mappingProperties = engineMappingGenerator();
  await elCreateIndex(newDraftIndexName, mappingProperties);

  return createdDraftWorkspace;
};

export const deleteDraftWorkspace = async (context: AuthContext, user: AuthUser, id: string) => {
  const draftWorkspace = await findById(context, user, id);
  if (!draftWorkspace) {
    throw FunctionalError(`Draft workspace ${id} cannot be found`);
  }
  const draftIndexToDelete = `${ES_INDEX_PREFIX}_draft_workspace_${id}`;
  const indices = await elPlatformIndices(draftIndexToDelete);
  await elDeleteIndices(indices.map((i: { index: number }) => i.index));

  await deleteElementById(context, user, id, ENTITY_TYPE_DRAFT_WORKSPACE);

  return id;
};
