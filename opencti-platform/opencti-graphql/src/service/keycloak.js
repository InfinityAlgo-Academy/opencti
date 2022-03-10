// Keycloak Admin Client
import jwtDecode from 'jwt-decode';
import conf, {basePath} from '../config/conf';
import Keycloak from 'keycloak-connect'

import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { auth, hasPermission, hasRole } from 'keycloak-connect-graphql';

export const authDirectiveTransformer = (schema, directiveName = 'auth') => {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      if(keycloakEnabled()){
        const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0];
        if (authDirective) {
          const { resolve = defaultFieldResolver } = fieldConfig;
          fieldConfig.resolve = auth(resolve);
        }
      }
      return fieldConfig;
    }
  });
};

export const permissionDirectiveTransformer = (schema, directiveName = 'hasPermission') => {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      if(keycloakEnabled()) {
        const permissionDirective = getDirective(schema, fieldConfig, directiveName)?.[0];
        if (permissionDirective) {
          const {resolve = defaultFieldResolver} = fieldConfig;
          const keys = Object.keys(permissionDirective);
          let resources;
          if (keys.length === 1 && keys[0] === 'resources') {
            resources = permissionDirective[keys[0]];
            if (typeof resources === 'string') resources = [resources];
            if (Array.isArray(resources)) {
              resources = resources.map((val) => String(val));
            } else {
              throw new Error('invalid hasRole args. role must be a String or an Array of Strings');
            }
          } else {
            throw Error("invalid hasRole args. must contain only a 'role argument");
          }
          fieldConfig.resolve = hasPermission(resources)(resolve);
        }
      }
      return fieldConfig;
    }
  });
};

export const roleDirectiveTransformer = (schema, directiveName = 'hasRole') => {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      if(keycloakEnabled()) {
        const roleDirective = getDirective(schema, fieldConfig, directiveName)?.[0];
        if (roleDirective) {
          const {resolve = defaultFieldResolver} = fieldConfig;
          const keys = Object.keys(roleDirective);
          let role;
          if (keys.length === 1 && keys[0] === 'role') {
            role = roleDirective[keys[0]];
            if (typeof role === 'string') role = [role];
            if (Array.isArray(role)) {
              role = role.map((val) => String(val));
            } else {
              throw new Error('invalid hasRole args. role must be a String or an Array of Strings');
            }
          } else {
            throw Error("invalid hasRole args. must contain only a 'role argument");
          }
          fieldConfig.resolve = hasRole(role)(resolve);
        }
      }
      return fieldConfig;
    }
  });
};

const realm = conf.get('keycloak:realm');
const keycloakServer = conf.get('keycloak:server');
const clientId = conf.get('keycloak:client_id');
const secret = conf.get('keycloak:client_secret');
const environment = process.env.NODE_ENV;
const disabled = process.env.KEYCLOAK_DISABLE ? process.env.KEYCLOAK_DISABLE === '1' : false;

let keycloakInstance

export const keycloakEnabled = () => {
  if(environment === 'production' || environment === 'prod') {
    return true;
  }
  return !disabled;
}

export const keycloakAlive = async () => {
  if(!keycloakEnabled()) return false;
  try {
    keycloakInstance = new Keycloak({},{
      "auth-server-url": keycloakServer,
      resource: clientId,
      realm,
      credentials: {
        secret
      }
    });
    return true;
  } catch (e) {
    return false;
  }
};

export const configureKeycloakMiddleware = (route, expressApp) => {
  if(keycloakEnabled()){
    expressApp.use(route, getKeycloak().middleware({}));
  }
}

export const applyKeycloakContext = (context) => {
  if(keycloakEnabled()){
    context.kauth = getKeycloak()
  }
}

const getKeycloak = () => {
  return keycloakInstance;
}
