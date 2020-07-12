import { assoc, find as rFind, head, isNil, pipe, map, dissoc, append, flatten, propOr, propEq, includes } from 'ramda';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import {
  clearAccessCache,
  delEditContext,
  delUserContext,
  getAccessCache,
  notify,
  setEditContext,
  storeAccessCache,
} from '../database/redis';
import { AuthenticationFailure, ForbiddenAccess, FunctionalError } from '../config/errors';
import conf, {
  BUS_TOPICS,
  logger,
  OPENCTI_DEFAULT_DURATION,
  OPENCTI_ISSUER,
  OPENCTI_TOKEN,
  OPENCTI_WEB_TOKEN,
} from '../config/conf';
import {
  createEntity,
  createRelation,
  deleteEntityById,
  deleteRelationById,
  deleteRelationsByFromAndTo,
  escapeString,
  executeWrite,
  find,
  findWithConnectedRelations,
  listEntities,
  load,
  loadEntityById,
  loadWithConnectedRelations,
  now,
  updateAttribute,
} from '../database/grakn';
import { buildPagination } from '../database/utils';
import {
  ENTITY_TYPE_CAPABILITY,
  ENTITY_TYPE_ROLE,
  ENTITY_TYPE_TOKEN,
  ENTITY_TYPE_USER,
  generateId,
  OPENCTI_ADMIN_UUID,
  RELATION_OBJECT_LABEL,
  RELATION_OBJECT_MARKING,
  RELATION_ROLE_CAPABILITY,
  RELATION_USER_ROLE,
} from '../utils/idGenerator';
import { REL_INDEX_PREFIX } from '../database/elasticSearch';

// region utils
export const BYPASS = 'BYPASS';
export const generateOpenCTIWebToken = (tokenValue = uuid()) => ({
  uuid: tokenValue,
  name: OPENCTI_WEB_TOKEN,
  created: now(),
  issuer: OPENCTI_ISSUER,
  revoked: false,
  duration: OPENCTI_DEFAULT_DURATION, // 99 years per default
});
export const setAuthenticationCookie = (token, res) => {
  const creation = moment(token.created);
  const maxDuration = moment.duration(token.duration);
  const expires = creation.add(maxDuration).toDate();
  if (res) {
    res.cookie('opencti_token', token.uuid, {
      httpOnly: true,
      expires,
      secure: conf.get('app:cookie_secure'),
    });
  }
};
// endregion

export const SYSTEM_USER = { name: 'system' };
export const ROLE_DEFAULT = 'Default';
export const ROLE_ADMINISTRATOR = 'Administrator';

export const findById = async (userId, options = { isUser: false }) => {
  let data = await loadEntityById(userId, ENTITY_TYPE_USER, options);
  if (!options.isUser) {
    data = pipe(dissoc('user_email'), dissoc('password'))(data);
  }
  return data;
};
export const findAll = async (args = {}, isUser = false) => {
  const filters = propOr([], 'filters', args);
  let data = await listEntities(
    [ENTITY_TYPE_USER],
    ['user_email', 'firstname', 'lastname'],
    assoc('filters', isUser ? append({ key: 'external', values: ['EXISTS'] }, filters) : filters, args)
  );
  if (!isUser) {
    data = assoc(
      'edges',
      map(
        (n) => ({
          cursor: n.cursor,
          node: pipe(dissoc('user_email'), dissoc('password'))(n.node),
          relation: n.relation,
        }),
        data.edges
      ),
      data
    );
  }
  return data;
};
export const organizations = (userId) => {
  return findWithConnectedRelations(
    `match $to isa Organization; $rel(part_of:$from, gather:$to) isa gathering;
     $from isa User, has internal_id_key "${escapeString(userId)}"; get;`,
    'to',
    { extraRelKey: 'rel' }
  ).then((data) => buildPagination(0, 0, data, data.length));
};
export const groups = (userId) => {
  return findWithConnectedRelations(
    `match $to isa Group; $rel(member:$from, grouping:$to) isa membership;
   $from isa User, has internal_id_key "${escapeString(userId)}";
   get;`,
    'to',
    { extraRelKey: 'rel' }
  ).then((data) => buildPagination(0, 0, data, data.length));
};
export const token = (userId, args, context) => {
  const capabilities = map((n) => n.name, context.user.capabilities);
  if (userId !== context.user.id && !includes('SETACCESSES', capabilities) && !includes('BYPASS', capabilities)) {
    throw ForbiddenAccess();
  }
  return loadWithConnectedRelations(
    `match $x isa Token;
    $rel(authorization:$x, client:$client) isa authorize;
    $client has internal_id_key "${escapeString(userId)}"; get; offset 0; limit 1;`,
    'x',
    { extraRelKey: 'rel' }
  ).then((result) => (result ? result.node.uuid : result));
};

const internalGetToken = async (userId) => {
  const query = `match $x isa Token; $x has internal_id_key $x_id;
  $rel(authorization:$x, client:$client) isa authorize; $rel has internal_id_key $rel_id;
  $x has internal_id_key $rel_from_id; $client has internal_id_key $rel_to_id;
  $client has internal_id_key "${escapeString(userId)}"; get; offset 0; limit 1;`;
  return loadWithConnectedRelations(query, 'x', { extraRelKey: 'rel' }).then((result) => result && result.node);
};

const internalGetTokenByUUID = async (tokenUUID) => {
  const query = `match $token isa Token; $token has internal_id_key $token_id; $token has uuid "${escapeString(
    tokenUUID
  )}"; get;`;
  return load(query, ['token']).then((result) => result && result.token);
};

const clearUserTokenCache = (userId) => {
  return internalGetToken(userId).then((tokenValue) => clearAccessCache(tokenValue.uuid));
};
export const getRoles = async (userId) => {
  const data = await find(
    `match $client isa User, has internal_id_key "${escapeString(userId)}";
            (client: $client, position: $role) isa ${RELATION_USER_ROLE}; 
            get;`,
    ['role']
  );
  return map((r) => r.role, data);
};
export const getCapabilities = async (userId) => {
  const data = await find(
    `match $client isa User, has internal_id_key "${escapeString(userId)}";
            (client: $client, position: $role) isa ${RELATION_USER_ROLE}; 
            (position: $role, capability: $capability) isa ${RELATION_ROLE_CAPABILITY}; 
            get;`,
    ['capability']
  );
  const capabilities = map((r) => r.capability, data);
  if (userId === OPENCTI_ADMIN_UUID && !rFind(propEq('name', BYPASS))(capabilities)) {
    const id = generateId(ENTITY_TYPE_CAPABILITY, { name: BYPASS });
    capabilities.push({ id, internal_id_key: id, name: BYPASS });
  }
  return capabilities;
};
export const getRoleCapabilities = async (roleId) => {
  const data = await find(
    `match $role isa Role, has internal_id_key "${escapeString(roleId)}";
            (position: $role, capability: $capability) isa ${RELATION_ROLE_CAPABILITY}; 
            get;`,
    ['capability']
  );
  return map((r) => r.capability, data);
};

export const findRoleById = (roleId) => {
  return loadEntityById(roleId, ENTITY_TYPE_ROLE);
};
export const findRoles = (args) => {
  return listEntities([ENTITY_TYPE_ROLE], ['name'], args);
};
export const findCapabilities = (args) => {
  const finalArgs = assoc('orderBy', 'ordering', args);
  return listEntities([ENTITY_TYPE_CAPABILITY], ['description'], finalArgs);
};

export const removeRole = async (userId, roleName) => {
  await executeWrite(async (wTx) => {
    const query = `match $rel(client: $from, position: $to) isa ${RELATION_USER_ROLE}; 
            $from has internal_id_key "${escapeString(userId)}"; 
            $to has name "${escapeString(roleName)}"; 
            delete $rel;`;
    await wTx.query(query, { infer: false });
  });
  await clearUserTokenCache(userId);
  return findById(userId, { isUser: true });
};
export const roleRemoveCapability = async (user, roleId, capabilityName) => {
  await executeWrite(async (wTx) => {
    const query = `match $rel(position: $from, capability: $to) isa ${RELATION_ROLE_CAPABILITY}; 
            $from isa Role, has internal_id_key "${escapeString(roleId)}"; 
            $to isa Capability, has name $name; { $name contains "${escapeString(capabilityName)}";}; 
            delete $rel;`;
    await wTx.query(query, { infer: false });
  });
  // Clear cache of every user with this modified role
  const impactedUsers = await findAll({
    filters: [{ key: `${REL_INDEX_PREFIX}${RELATION_USER_ROLE}.internal_id_key`, values: [roleId] }],
  });
  await Promise.all(map((e) => clearUserTokenCache(e.node.id), impactedUsers.edges));
  return loadEntityById(roleId, ENTITY_TYPE_ROLE);
};
export const roleDelete = async (user, roleId) => {
  // Clear cache of every user with this deleted role
  const impactedUsers = await findAll({
    filters: [{ key: `${REL_INDEX_PREFIX}${RELATION_USER_ROLE}.internal_id_key`, values: [roleId] }],
  });
  await Promise.all(map((e) => clearUserTokenCache(e.node.id), impactedUsers.edges));
  return deleteEntityById(user, roleId, ENTITY_TYPE_ROLE, { noLog: true });
};
export const roleCleanContext = (user, roleId) => {
  delEditContext(user, roleId);
  return loadEntityById(roleId, ENTITY_TYPE_ROLE).then((role) => notify(BUS_TOPICS.Role.EDIT_TOPIC, role, user));
};
export const roleEditContext = (user, roleId, input) => {
  setEditContext(user, roleId, input);
  return loadEntityById(roleId, ENTITY_TYPE_ROLE).then((role) => notify(BUS_TOPICS.Role.EDIT_TOPIC, role, user));
};
// endregion

export const addPerson = async (user, newUser) => {
  const creatingUser = assoc('user_email', `${uuid()}@mail.com`, newUser);
  const created = await createEntity(user, creatingUser, ENTITY_TYPE_USER);
  return notify(BUS_TOPICS.StixDomainEntity.ADDED_TOPIC, created, user);
};
export const assignRoleToUser = (user, userId, roleName) => {
  const assignInput = {
    fromId: userId,
    fromType: ENTITY_TYPE_USER,
    fromRole: 'client',
    toId: generateId(ENTITY_TYPE_ROLE, { name: roleName }),
    toType: ENTITY_TYPE_ROLE,
    toRole: 'position',
    through: RELATION_USER_ROLE,
  };
  return createRelation(user, assignInput, { noLog: true });
};
export const addUser = async (user, newUser, newToken = generateOpenCTIWebToken()) => {
  let userRoles = newUser.roles || []; // Expected roles name
  // Assign default roles to user
  const defaultRoles = await findRoles({ filters: [{ key: 'default_assignation', values: [true] }] });
  if (defaultRoles && defaultRoles.edges.length > 0) {
    userRoles = pipe(
      map((n) => n.node.name),
      append(userRoles),
      flatten
    )(defaultRoles.edges);
  }
  const userToCreate = pipe(
    assoc('password', bcrypt.hashSync(newUser.password ? newUser.password.toString() : uuid())),
    assoc('language', newUser.language ? newUser.language : 'auto'),
    assoc('external', newUser.external ? newUser.external : false),
    dissoc('roles')
  )(newUser);
  const userOptions = { noLog: newUser.name === 'admin' };
  const userCreated = await createEntity(user, userToCreate, ENTITY_TYPE_USER, userOptions);
  // Create token and link it to the user
  const tokenOptions = { noLog: true };
  const defaultToken = await createEntity(user, newToken, ENTITY_TYPE_TOKEN, tokenOptions);
  const input = {
    fromId: userCreated.id,
    fromType: ENTITY_TYPE_USER,
    fromRole: 'client',
    toId: defaultToken.id,
    toType: ENTITY_TYPE_TOKEN,
    toRole: 'authorization',
    through: 'authorize',
  };
  await createRelation(user, input, { noLog: true });
  // Link to the roles
  await Promise.all(map((role) => assignRoleToUser(user, userCreated.id, role), userRoles));
  return notify(BUS_TOPICS.StixDomainEntity.ADDED_TOPIC, userCreated, user);
};
export const roleEditField = (user, roleId, input) => {
  return executeWrite((wTx) => {
    return updateAttribute(user, roleId, ENTITY_TYPE_ROLE, input, wTx, { noLog: true });
  }).then(async () => {
    const userToEdit = await loadEntityById(roleId, ENTITY_TYPE_ROLE);
    return notify(BUS_TOPICS.StixDomainEntity.EDIT_TOPIC, userToEdit, user);
  });
};
export const roleAddRelation = async (user, roleId, input) => {
  const finalInput = pipe(
    assoc('fromId', roleId),
    assoc('through', RELATION_ROLE_CAPABILITY),
    assoc('fromType', ENTITY_TYPE_ROLE)
  )(input);
  const data = await createRelation(user, finalInput, { noLog: true });
  // Clear cache of every user with this modified role
  const impactedUsers = await findAll({
    filters: [{ key: `${REL_INDEX_PREFIX}${RELATION_USER_ROLE}.internal_id_key`, values: [roleId] }],
  });
  await Promise.all(map((e) => clearUserTokenCache(e.node.id), impactedUsers.edges));
  return notify(BUS_TOPICS.StixDomainEntity.EDIT_TOPIC, data, user);
};
// User related
export const userEditField = (user, userId, input) => {
  const { key } = input;
  const value = key === 'password' ? [bcrypt.hashSync(head(input.value).toString(), 10)] : input.value;
  const finalInput = { key, value };
  return executeWrite((wTx) => {
    return updateAttribute(user, userId, ENTITY_TYPE_USER, finalInput, wTx, { noLog: key === 'password' });
  }).then(async () => {
    const userToEdit = await loadEntityById(userId, ENTITY_TYPE_USER);
    return notify(BUS_TOPICS.StixDomainEntity.EDIT_TOPIC, userToEdit, user);
  });
};
export const personEditField = async (user, userId, input) => {
  const data = await loadEntityById(userId, ENTITY_TYPE_USER);
  if (!isNil(data.external)) {
    throw ForbiddenAccess();
  }
  return executeWrite((wTx) => {
    return updateAttribute(user, userId, ENTITY_TYPE_USER, input, wTx);
  }).then(async () => {
    const userToEdit = await loadEntityById(userId, ENTITY_TYPE_USER);
    return notify(BUS_TOPICS.StixDomainEntity.EDIT_TOPIC, userToEdit, user);
  });
};
export const meEditField = (user, userId, input) => {
  return userEditField(user, userId, input);
};
export const userDelete = async (user, userId) => {
  const userToken = await internalGetToken(userId);
  if (userToken) {
    await deleteEntityById(user, userToken.id, ENTITY_TYPE_TOKEN, { noLog: true });
    await clearAccessCache(userToken.uuid);
  }
  await deleteEntityById(user, userId, ENTITY_TYPE_USER);
  return userId;
};
export const personDelete = async (user, personId) => {
  const data = await loadEntityById(personId, ENTITY_TYPE_USER);
  if (!isNil(data.external)) throw ForbiddenAccess();
  await deleteEntityById(user, personId, ENTITY_TYPE_USER);
  return personId;
};
export const userAddRelation = async (user, userId, input) => {
  const finalInput = pipe(assoc('fromId', userId), assoc('fromType', ENTITY_TYPE_USER))(input);
  const data = await createRelation(user, finalInput);
  await clearUserTokenCache(userId);
  return notify(BUS_TOPICS.StixDomainEntity.EDIT_TOPIC, data, user);
};
export const userDeleteRelation = async (user, userId, relationId = null, toId = null, relationType = 'relation') => {
  if (relationId) {
    await deleteRelationById(user, relationId, 'relation');
  } else if (toId) {
    await deleteRelationsByFromAndTo(user, userId, toId, relationType, 'relation');
  } else {
    throw FunctionalError('Cannot delete the relation, missing relationId or toId');
  }
  await clearUserTokenCache(userId);
  const data = await loadEntityById(userId, 'Stix-Domain-Entity');
  return notify(BUS_TOPICS.StixDomainEntity.EDIT_TOPIC, data, user);
};
export const personAddRelation = async (user, userId, input) => {
  if (![RELATION_OBJECT_LABEL, RELATION_CREATED_BY, RELATION_OBJECT_MARKING].includes(input.through)) {
    throw ForbiddenAccess();
  }
  const finalInput = pipe(assoc('fromId', userId), assoc('fromType', ENTITY_TYPE_USER))(input);
  const data = await createRelation(user, finalInput);
  return notify(BUS_TOPICS.StixDomainEntity.EDIT_TOPIC, data, user);
};
export const personDeleteRelation = async (
  user,
  userId,
  relationId = null,
  toId = null,
  relationType = 'stix_relation_embedded'
) => {
  if (relationId) {
    await deleteRelationById(user, relationId, 'stix_relation_embedded');
  } else if (toId) {
    await deleteRelationsByFromAndTo(user, userId, toId, relationType, 'stix_relation_embedded');
  } else {
    throw FunctionalError('Cannot delete the relation, missing relationId or toId');
  }
  const data = await loadEntityById(userId, ENTITY_TYPE_USER);
  return notify(BUS_TOPICS.StixDomainEntity.EDIT_TOPIC, data, user);
};
export const stixDomainEntityEditField = async (user, stixDomainEntityId, input) => {
  const stixDomainEntity = await loadEntityById(stixDomainEntityId, 'Stix-Domain-Entity');
  if (stixDomainEntity.entity_type === 'user' && !isNil(stixDomainEntity.external)) {
    throw ForbiddenAccess();
  }
  return executeWrite((wTx) => {
    return updateAttribute(user, stixDomainEntityId, 'Stix-Domain-Entity', input, wTx);
  }).then(async () => {
    const stixDomain = await loadEntityById(stixDomainEntityId, 'Stix-Domain-Entity');
    return notify(BUS_TOPICS.StixDomainEntity.EDIT_TOPIC, stixDomain, user);
  });
};
export const loginFromProvider = async (email, name) => {
  const result = await load(
    `match $client isa User, has user_email "${escapeString(email)}"; (authorization:$token, client:$client); get;`,
    ['client', 'token']
  );
  if (isNil(result)) {
    const newUser = { name, user_email: email, external: true };
    return addUser(SYSTEM_USER, newUser).then(() => loginFromProvider(email, name));
  }
  // update the name
  const inputName = { key: 'name', value: [name] };
  await userEditField(SYSTEM_USER, result.client.id, inputName);
  const inputExternal = { key: 'external', value: [true] };
  await userEditField(SYSTEM_USER, result.client.id, inputExternal);
  await clearAccessCache(result.token.id);
  return result.token;
};
export const login = async (email, password) => {
  const query = `match $client isa User, has user_email "${escapeString(email)}";
   $client has internal_id_key $client_id;
   (authorization:$token, client:$client) isa authorize; 
   $token has internal_id_key $token_id;
   get;`;
  const result = await load(query, ['client', 'token']);
  if (isNil(result)) throw AuthenticationFailure();
  const dbPassword = result.client.password;
  const match = bcrypt.compareSync(password, dbPassword);
  if (!match) throw AuthenticationFailure();
  await clearAccessCache(result.token.uuid);
  return result.token;
};
export const logout = async (user, res) => {
  res.clearCookie(OPENCTI_TOKEN);
  await clearAccessCache(user.token.uuid);
  await delUserContext(user);
  return user.id;
};

// Token related
export const userRenewToken = async (user, userId, newToken = generateOpenCTIWebToken()) => {
  // 01. Get current token
  const currentToken = await internalGetToken(userId);
  // 02. Remove the token
  if (currentToken) {
    await deleteEntityById(user, currentToken.id, ENTITY_TYPE_TOKEN, { noLog: true });
  } else {
    logger.error(`[GRAKN] ${userId} user have no token to renew, please report this problem in github`);
    const detachedToken = await internalGetTokenByUUID(newToken.uuid);
    if (detachedToken) {
      await deleteEntityById(user, detachedToken.id, ENTITY_TYPE_TOKEN, { noLog: true });
    }
  }
  // 03. Create a new one
  const defaultToken = await createEntity(user, newToken, ENTITY_TYPE_TOKEN, { noLog: true });
  // 04. Associate new token to user.
  const input = {
    fromId: userId,
    fromType: ENTITY_TYPE_USER,
    fromRole: 'client',
    toId: defaultToken.id,
    toType: ENTITY_TYPE_TOKEN,
    toRole: 'authorization',
    through: 'authorize',
  };
  await createRelation(user, input, { noLog: true });
  return loadEntityById(userId, ENTITY_TYPE_USER);
};
export const findByTokenUUID = async (tokenValue) => {
  // This method is call every time a user to a platform action
  let user = await getAccessCache(tokenValue);
  if (!user) {
    const data = await load(
      `match $token isa Token;
            $token has internal_id_key $token_id;
            $token has uuid "${escapeString(tokenValue)}", has revoked false;
            (authorization:$token, client:$client) isa authorize; 
            $client has internal_id_key $client_id;
            get;`,
      ['token', 'client']
    );
    if (!data) return undefined;
    // eslint-disable-next-line no-shadow
    const { client, token } = data;
    if (!client) return undefined;
    logger.debug(`Setting cache access for ${tokenValue}`);
    const capabilities = await getCapabilities(client.id);
    user = pipe(assoc('token', token), assoc('capabilities', capabilities))(client);
    await storeAccessCache(tokenValue, user);
  }
  const { created } = user.token;
  const maxDuration = moment.duration(user.token.duration);
  const currentDuration = moment.duration(moment().diff(created));
  if (currentDuration > maxDuration) return undefined;
  return user;
};

// Authentication process
export const authentication = async (tokenUUID) => {
  if (!tokenUUID) return undefined;
  try {
    return await findByTokenUUID(tokenUUID);
  } catch (err) {
    logger.error(`[OPENCTI] Authentication error ${tokenUUID}`, { error: err });
    return undefined;
  }
};

// The static admin account internal ID
/**
 * Create or update the default administrator account.
 * @param email the admin email
 * @param password the admin password
 * @param tokenValue the admin default token
 * @returns {*}
 */
export const initAdmin = async (email, password, tokenValue) => {
  const admin = await findById(OPENCTI_ADMIN_UUID, { isUser: true });
  const tokenAdmin = generateOpenCTIWebToken(tokenValue);
  if (admin) {
    // Update admin fields
    await executeWrite(async (wTx) => {
      const inputEmail = { key: 'user_email', value: [email] };
      await updateAttribute(admin, admin.id, ENTITY_TYPE_USER, inputEmail, wTx);
      const inputPassword = { key: 'password', value: [bcrypt.hashSync(password, 10)] };
      await updateAttribute(admin, admin.id, ENTITY_TYPE_USER, inputPassword, wTx, { noLog: true });
      const inputExternal = { key: 'external', value: [true] };
      await updateAttribute(admin, admin.id, ENTITY_TYPE_USER, inputExternal, wTx, { noLog: true });
    });
    // Renew the token
    await userRenewToken(admin, admin.id, tokenAdmin);
  } else {
    const userToCreate = {
      internal_id_key: OPENCTI_ADMIN_UUID,
      external: true,
      user_email: email.toLowerCase(),
      name: 'admin',
      firstname: 'Admin',
      lastname: 'OpenCTI',
      description: 'Principal admin account',
      password,
    };
    await addUser(SYSTEM_USER, userToCreate, tokenAdmin);
  }
};
