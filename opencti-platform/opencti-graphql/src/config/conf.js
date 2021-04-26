import { lstatSync, readFileSync } from 'fs';
import nconf from 'nconf';
import winston, { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { isEmpty } from 'ramda';
import * as O from '../schema/internalObject';
import * as M from '../schema/stixMetaObject';
import {
  ABSTRACT_STIX_CORE_OBJECT,
  ABSTRACT_STIX_CORE_RELATIONSHIP,
  ABSTRACT_STIX_CYBER_OBSERVABLE,
  ABSTRACT_STIX_CYBER_OBSERVABLE_RELATIONSHIP,
  ABSTRACT_STIX_DOMAIN_OBJECT,
} from '../schema/general';
import { STIX_SIGHTING_RELATIONSHIP } from '../schema/stixSightingRelationship';

const pjson = require('../../package.json');

// https://golang.org/src/crypto/x509/root_linux.go
const LINUX_CERTFILES = [
  '/etc/ssl/certs/ca-certificates.crt', // Debian/Ubuntu/Gentoo etc.
  '/etc/pki/tls/certs/ca-bundle.crt', // Fedora/RHEL 6
  '/etc/ssl/ca-bundle.pem', // OpenSUSE
  '/etc/pki/tls/cacert.pem', // OpenELEC
  '/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem', // CentOS/RHEL 7
  '/etc/ssl/cert.pem',
];

const DEFAULT_ENV = 'production';
export const OPENCTI_SESSION = 'opencti_session';
export const OPENCTI_WEB_TOKEN = 'Default';
export const OPENCTI_ISSUER = 'OpenCTI';
export const OPENCTI_DEFAULT_DURATION = 'P99Y';
export const BUS_TOPICS = {
  [O.ENTITY_TYPE_SETTINGS]: {
    EDIT_TOPIC: 'SETTINGS_EDIT_TOPIC',
    ADDED_TOPIC: 'SETTINGS_ADDED_TOPIC',
  },
  [O.ENTITY_TYPE_ATTRIBUTE]: {
    EDIT_TOPIC: 'ATTRIBUTE_EDIT_TOPIC',
    ADDED_TOPIC: 'ATTRIBUTE_ADDED_TOPIC',
  },
  [O.ENTITY_TYPE_GROUP]: {
    EDIT_TOPIC: 'GROUP_EDIT_TOPIC',
    ADDED_TOPIC: 'GROUP_ADDED_TOPIC',
  },
  [O.ENTITY_TYPE_ROLE]: {
    EDIT_TOPIC: 'ROLE_EDIT_TOPIC',
    ADDED_TOPIC: 'ROLE_ADDED_TOPIC',
  },
  [O.ENTITY_TYPE_USER]: {
    EDIT_TOPIC: 'USER_EDIT_TOPIC',
    ADDED_TOPIC: 'USER_ADDED_TOPIC',
  },
  [O.ENTITY_TYPE_WORKSPACE]: {
    EDIT_TOPIC: 'WORKSPACE_EDIT_TOPIC',
    ADDED_TOPIC: 'WORKSPACE_ADDED_TOPIC',
  },
  [M.ENTITY_TYPE_LABEL]: {
    EDIT_TOPIC: 'LABEL_EDIT_TOPIC',
    ADDED_TOPIC: 'LABEL_ADDED_TOPIC',
  },
  [O.ENTITY_TYPE_CONNECTOR]: {
    EDIT_TOPIC: 'CONNECTOR_EDIT_TOPIC',
  },
  [O.ENTITY_TYPE_TAXII_COLLECTION]: {
    EDIT_TOPIC: 'TAXII_COLLECTION_EDIT_TOPIC',
    ADDED_TOPIC: 'TAXII_COLLECTION_ADDED_TOPIC',
  },
  [M.ENTITY_TYPE_MARKING_DEFINITION]: {
    EDIT_TOPIC: 'MARKING_DEFINITION_EDIT_TOPIC',
    ADDED_TOPIC: 'MARKING_DEFINITION_ADDED_TOPIC',
  },
  [M.ENTITY_TYPE_LABEL]: {
    EDIT_TOPIC: 'LABEL_EDIT_TOPIC',
    ADDED_TOPIC: 'LABEL_ADDED_TOPIC',
  },
  [M.ENTITY_TYPE_EXTERNAL_REFERENCE]: {
    EDIT_TOPIC: 'EXTERNAL_REFERENCE_EDIT_TOPIC',
    ADDED_TOPIC: 'EXTERNAL_REFERENCE_ADDED_TOPIC',
  },
  [M.ENTITY_TYPE_KILL_CHAIN_PHASE]: {
    EDIT_TOPIC: 'KILL_CHAIN_PHASE_EDIT_TOPIC',
    ADDED_TOPIC: 'KILL_CHAIN_PHASE_ADDED_TOPIC',
  },
  [ABSTRACT_STIX_CORE_OBJECT]: {
    EDIT_TOPIC: 'STIX_CORE_OBJECT_EDIT_TOPIC',
    ADDED_TOPIC: 'STIX_CORE_OBJECT_ADDED_TOPIC',
  },
  [ABSTRACT_STIX_DOMAIN_OBJECT]: {
    EDIT_TOPIC: 'STIX_DOMAIN_OBJECT_EDIT_TOPIC',
    ADDED_TOPIC: 'STIX_DOMAIN_OBJECT_ADDED_TOPIC',
  },
  [ABSTRACT_STIX_CYBER_OBSERVABLE]: {
    EDIT_TOPIC: 'STIX_CYBER_OBSERVABLE_EDIT_TOPIC',
    ADDED_TOPIC: 'STIX_CYBER_OBSERVABLE_ADDED_TOPIC',
  },
  [ABSTRACT_STIX_CORE_RELATIONSHIP]: {
    EDIT_TOPIC: 'STIX_CORE_RELATIONSHIP_EDIT_TOPIC',
    ADDED_TOPIC: 'STIX_CORE_RELATIONSHIP_ADDED_TOPIC',
  },
  [STIX_SIGHTING_RELATIONSHIP]: {
    EDIT_TOPIC: 'STIX_SIGHTING_RELATIONSHIP_EDIT_TOPIC',
    ADDED_TOPIC: 'STIX_SIGHTING_RELATIONSHIP_ADDED_TOPIC',
  },
  [ABSTRACT_STIX_CYBER_OBSERVABLE_RELATIONSHIP]: {
    EDIT_TOPIC: 'STIX_CYBER_OBSERVABLE_RELATIONSHIP_EDIT_TOPIC',
    ADDED_TOPIC: 'STIX_CYBER_OBSERVABLE_RELATIONSHIP_ADDED_TOPIC',
  },
};

// Environment from NODE_ENV environment variable
nconf.env({ separator: '__', lowerCase: true, parseValues: true });

// Environment from "-e" command line parameter
nconf.add('argv', {
  e: {
    alias: 'env',
    describe: 'Execution environment',
  },
  c: {
    alias: 'conf',
    describe: 'Configuration file',
  },
});

const { timestamp } = format;
const currentPath = process.env.INIT_CWD || process.cwd();
const resolvePath = (relativePath) => path.join(currentPath, relativePath);
const environment = nconf.get('env') || nconf.get('node_env') || DEFAULT_ENV;
const resolveEnvFile = (env) => path.join(resolvePath('config'), `${env.toLowerCase()}.json`);
export const DEV_MODE = environment !== 'production';
const externalConfigurationFile = nconf.get('conf');
let configurationFile;
if (externalConfigurationFile) {
  configurationFile = externalConfigurationFile;
} else {
  configurationFile = resolveEnvFile(environment);
}

nconf.file(environment, configurationFile);
nconf.file('default', resolveEnvFile('default'));

// Setup application logApp
const appLogLevel = nconf.get('app:app_logs:logs_level');
const appLogFileTransport = nconf.get('app:app_logs:logs_files');
const appLogConsoleTransport = nconf.get('app:app_logs:logs_console');
const appLogTransports = [];
if (appLogFileTransport) {
  const dirname = nconf.get('app:app_logs:logs_directory');
  const maxFiles = nconf.get('app:app_logs:logs_max_files');
  appLogTransports.push(
    new DailyRotateFile({
      filename: 'error.log',
      dirname,
      level: 'error',
      maxFiles,
    })
  );
  appLogTransports.push(
    new DailyRotateFile({
      filename: 'opencti.log',
      dirname,
      maxFiles,
    })
  );
}
if (appLogConsoleTransport) {
  appLogTransports.push(new winston.transports.Console());
}
const appLogger = winston.createLogger({
  level: appLogLevel,
  format: format.combine(timestamp(), format.errors({ stack: true }), format.json()),
  transports: appLogTransports,
});

// Setup audit log logApp
const auditLogFileTransport = nconf.get('app:audit_logs:logs_files');
const auditLogConsoleTransport = nconf.get('app:audit_logs:logs_console');
const auditLogTransports = [];
if (auditLogFileTransport) {
  const dirname = nconf.get('app:audit_logs:logs_directory');
  const maxFiles = nconf.get('app:audit_logs:logs_max_files');
  auditLogTransports.push(
    new DailyRotateFile({
      filename: 'audit.log',
      dirname,
      maxFiles,
    })
  );
}
if (auditLogConsoleTransport) {
  auditLogTransports.push(new winston.transports.Console());
}
const auditLogger = winston.createLogger({
  level: 'info',
  format: format.combine(timestamp(), format.errors({ stack: true }), format.json()),
  transports: auditLogTransports,
});

// Specific case to fail any test that produce an error log
if (environment === 'test') {
  appLogger.on('data', (log) => {
    if (log.level === 'error') throw Error(log.message);
  });
}
const LOG_APP = 'APP';
const addBasicMetaInformation = (category, meta) => ({ ...meta, category, version: pjson.version });
export const logApp = {
  _log: (level, message, meta = {}) => {
    if (appLogTransports.length > 0) {
      appLogger.log(level, message, addBasicMetaInformation(LOG_APP, meta));
    }
  },
  debug: (message, meta = {}) => logApp._log('debug', message, meta),
  info: (message, meta = {}) => logApp._log('info', message, meta),
  warn: (message, meta = {}) => logApp._log('warn', message, meta),
  error: (message, meta = {}) => logApp._log('error', message, meta),
};

const LOG_AUDIT = 'AUDIT';
export const logAudit = {
  _log: (level, user, operation, meta = {}) => {
    if (auditLogTransports.length > 0) {
      const metaUser = { email: user.user_email, ...user.origin };
      const logMeta = isEmpty(meta) ? { auth: metaUser } : { resource: meta, auth: metaUser };
      auditLogger.log(level, operation, addBasicMetaInformation(LOG_AUDIT, logMeta));
    }
  },
  info: (user, operation, meta = {}) => logAudit._log('info', user, operation, meta),
  error: (user, operation, meta = {}) => logAudit._log('error', user, operation, meta),
};

const AppBasePath = nconf.get('app:base_path').trim();
const contextPath = isEmpty(AppBasePath) || AppBasePath === '/' ? '' : AppBasePath;
export const basePath = isEmpty(AppBasePath) || contextPath.startsWith('/') ? contextPath : `/${contextPath}`;

export const configureCA = (certificates) => {
  if (certificates.length) {
    return { ca: certificates };
  } else {
    for (const cert of LINUX_CERTFILES) {
      try {
        if (lstatSync(cert).isFile()) {
          return { ca: [readFileSync(cert)] };
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          continue;
        } else {
          throw err;
        }
      }
    }
  }
};

export default nconf;
