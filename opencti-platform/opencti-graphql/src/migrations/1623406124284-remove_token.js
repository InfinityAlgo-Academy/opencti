import { findAll } from '../domain/user';
import { SYSTEM_USER } from '../utils/access';
import { deleteElementById, loadThroughGetTo, patchAttribute } from '../database/middleware';
import { ENTITY_TYPE_USER } from '../schema/internalObject';

export const up = async (next) => {
  // For each user, get default token and patch the user to add a bearer
  // Delete all tokens and relations to it
  const users = await findAll(SYSTEM_USER, { connectionFormat: false });
  for (let index = 0; index < users.length; index += 1) {
    const user = users[index];
    const userToken = await loadThroughGetTo(SYSTEM_USER, user.id, 'authorized-by', 'Token');
    const patch = { api_token: userToken.uuid };
    await patchAttribute(SYSTEM_USER, user.id, ENTITY_TYPE_USER, patch);
    // Remove token
    await deleteElementById(SYSTEM_USER, userToken.id, 'Token');
  }
  next();
};

export const down = async (next) => {
  next();
};
