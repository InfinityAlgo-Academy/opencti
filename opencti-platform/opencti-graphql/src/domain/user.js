import { assoc, head, isNil, pathOr, pipe } from 'ramda';
import uuid from 'uuid/v4';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import { delUserContext, getAccessCache, notify, storeAccessCache } from '../database/redis';
import { AuthenticationFailure, ForbiddenAccess } from '../config/errors';
import conf, {
  BUS_TOPICS,
  logger,
  OPENCTI_DEFAULT_DURATION,
  OPENCTI_ISSUER,
  OPENCTI_TOKEN,
  OPENCTI_WEB_TOKEN
} from '../config/conf';
import {
  createEntity,
  createRelation,
  deleteEntityById,
  escapeString,
  executeWrite,
  graknNow,
  listEntities,
  load,
  loadEntityById,
  loadEntityByStixId,
  loadWithConnectedRelations,
  now,
  TYPE_OPENCTI_INTERNAL,
  TYPE_STIX_DOMAIN_ENTITY,
  updateAttribute
} from '../database/grakn';
import { stixDomainEntityDelete } from './stixDomainEntity';

// region utils
export const generateOpenCTIWebToken = (tokenValue = uuid()) => ({
  uuid: tokenValue,
  name: OPENCTI_WEB_TOKEN,
  created: now(),
  issuer: OPENCTI_ISSUER,
  revoked: false,
  duration: OPENCTI_DEFAULT_DURATION // 99 years per default
});
export const setAuthenticationCookie = (token, res) => {
  const creation = moment(token.created);
  const maxDuration = moment.duration(token.duration);
  const expires = creation.add(maxDuration).toDate();
  if (res) {
    res.cookie('opencti_token', token.uuid, {
      httpOnly: true,
      expires,
      secure: conf.get('app:cookie_secure')
    });
  }
};
// endregion

export const findById = (userId, args) => {
  if (userId.match(/[a-z-]+--[\w-]{36}/g)) {
    return loadEntityByStixId(userId);
  }
  return loadEntityById(userId, args);
};
export const findAll = args => {
  return listEntities(['User'], ['email', 'firstname', 'lastname'], args);
};
export const token = (userId, args, context) => {
  if (userId !== context.user.id) {
    throw new ForbiddenAccess();
  }
  return loadWithConnectedRelations(
    `match $x isa Token;
    $rel(authorization:$x, client:$client) isa authorize;
    $client has internal_id_key "${escapeString(userId)}"; get; offset 0; limit 1;`,
    'x',
    'rel'
  ).then(result => result.node.uuid);
};
export const getTokenId = async userId => {
  return loadWithConnectedRelations(
    `match $x isa Token;
    $rel(authorization:$x, client:$client) isa authorize;
    $client has internal_id_key "${escapeString(userId)}"; get; offset 0; limit 1;`,
    'x',
    'rel'
  ).then(result => pathOr(null, ['node', 'id'], result));
};

export const addPerson = async (user, newUser) => {
  const created = await createEntity(newUser, 'User', { modelType: TYPE_STIX_DOMAIN_ENTITY, stixIdType: 'identity' });
  return notify(BUS_TOPICS.StixDomainEntity.ADDED_TOPIC, created, user);
};
export const addUser = async (user, newUser, newToken = generateOpenCTIWebToken()) => {
  const userToCreate = pipe(
    assoc('password', bcrypt.hashSync(newUser.password.toString())),
    assoc('language', newUser.language ? newUser.language : 'auto')
  )(newUser);
  const userCreated = await createEntity(userToCreate, 'User', {
    modelType: TYPE_STIX_DOMAIN_ENTITY,
    stixIdType: 'identity'
  });
  const defaultToken = await createEntity(newToken, 'Token', { modelType: TYPE_OPENCTI_INTERNAL, indexable: false });
  const input = { fromRole: 'client', toId: defaultToken.id, toRole: 'authorization', through: 'authorize' };
  await createRelation(userCreated.id, input, { indexable: false });
  return notify(BUS_TOPICS.StixDomainEntity.ADDED_TOPIC, userCreated, user);
};

// User related
export const loginFromProvider = async (email, name) => {
  const result = await load(
    `match $client isa User, has email "${escapeString(email)}"; (authorization:$token, client:$client); get;`,
    ['client', 'token']
  );
  if (isNil(result)) {
    const newUser = {
      name,
      email,
      created: graknNow(),
      password: null,
      grant: conf.get('app:default_roles')
    };
    return addUser({}, newUser).then(() => loginFromProvider(email, name));
  }
  return Promise.resolve(result.token);
};
export const login = async (email, password) => {
  const result = await load(
    `match $client isa User, has email "${escapeString(
      email
    )}"; (authorization:$token, client:$client) isa authorize; get;`,
    ['client', 'token']
  );
  if (isNil(result)) {
    throw new AuthenticationFailure();
  }
  const dbPassword = result.client.password;
  const match = bcrypt.compareSync(password, dbPassword);
  if (!match) {
    throw new AuthenticationFailure();
  }
  return Promise.resolve(result.token);
};
export const logout = async (user, res) => {
  res.clearCookie(OPENCTI_TOKEN);
  await delUserContext(user);
  return user.id;
};

export const userEditField = (user, userId, input) => {
  const { key } = input;
  const value = key === 'password' ? [bcrypt.hashSync(head(input.value).toString(), 10)] : input.value;
  const finalInput = { key, value };
  return executeWrite(wTx => {
    return updateAttribute(userId, finalInput, wTx);
  }).then(async () => {
    const userToEdit = await loadEntityById(userId);
    return notify(BUS_TOPICS.StixDomainEntity.EDIT_TOPIC, userToEdit, user);
  });
};
export const meEditField = (user, userId, input) => {
  const { key } = input;
  if (key === 'grant') {
    throw new ForbiddenAccess();
  }
  return userEditField(user, userId, input);
};
export const userDelete = async userId => {
  const tokenId = await getTokenId(userId);
  if (tokenId) {
    await deleteEntityById(tokenId);
  }
  return stixDomainEntityDelete(userId);
};

// Token related
export const userRenewToken = async (userId, newToken = generateOpenCTIWebToken()) => {
  // 01. Get current token
  const currentToken = await getTokenId(userId);
  // 02. Remove the token
  if (currentToken) {
    await deleteEntityById(currentToken);
  }
  // 03. Create a new one
  const defaultToken = await createEntity(newToken, 'Token', { modelType: TYPE_OPENCTI_INTERNAL, indexable: false });
  // 04. Associate new token to user.
  const input = { fromRole: 'client', toId: defaultToken.id, toRole: 'authorization', through: 'authorize' };
  await createRelation(userId, input, { indexable: false });
  return loadEntityById(userId);
};
export const findByTokenUUID = async tokenValue => {
  let result = await getAccessCache(tokenValue);
  if (!result) {
    result = await load(
      `match $token isa Token,
    has uuid "${escapeString(tokenValue)}",
    has revoked false;
    (authorization:$token, client:$client) isa authorize; get;`,
      ['client', 'token']
    );
    logger.debug(`Setting cache access for ${tokenValue}`);
    await storeAccessCache(tokenValue, result);
  }
  if (isNil(result)) return undefined;
  const { created } = result.token;
  const maxDuration = moment.duration(result.token.duration);
  const currentDuration = moment.duration(moment().diff(created));
  if (currentDuration > maxDuration) return undefined;
  return result.client;
};

// Authentication process
export const authentication = async tokenUUID => {
  if (!tokenUUID) return undefined;
  try {
    return await findByTokenUUID(tokenUUID);
  } catch (err) {
    logger.error(`[OPENCTI] Authentication error ${tokenUUID} > `, err);
    return undefined;
  }
};

// The static admin account internal ID
const OPENCTI_ADMIN_DNS = '88ec0c6a-13ce-5e39-b486-354fe4a7084f';
/**
 * Create or update the default administrator account.
 * @param email the admin email
 * @param password the admin password
 * @param tokenValue the admin default token
 * @returns {*}
 */
export const initAdmin = async (email, password, tokenValue) => {
  const admin = await findById(OPENCTI_ADMIN_DNS, { noCache: true });
  const tokenAdmin = generateOpenCTIWebToken(tokenValue);
  const user = { name: 'system' };
  if (admin) {
    // Update email and password
    const inputEmail = { key: 'email', value: [email] };
    await userEditField(user, admin.id, inputEmail);
    logger.info(`[ADMIN_SETUP] admin email updated`);
    const inputPassword = { key: 'password', value: [password] };
    await userEditField(user, admin.id, inputPassword);
    logger.info(`[ADMIN_SETUP] admin password updated`);
    // Renew the token
    await userRenewToken(admin.id, tokenAdmin);
    logger.info(`[ADMIN_SETUP] admin token updated`);
  } else {
    const userToCreate = {
      internal_id_key: OPENCTI_ADMIN_DNS,
      stix_id_key: `identity--${OPENCTI_ADMIN_DNS}`,
      name: 'admin',
      firstname: 'Admin',
      lastname: 'OpenCTI',
      description: 'Principal admin account',
      email,
      password,
      grant: ['ROLE_ROOT', 'ROLE_ADMIN']
    };
    await addUser(user, userToCreate, tokenAdmin);
  }
};
