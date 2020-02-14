// Admin user initialization
import { logger } from './config/conf';
import { elCreateIndexes, elIsAlive } from './database/elasticSearch';
import { graknIsAlive, write } from './database/grakn';
import applyMigration from './database/migration';
import { initializeAdminUser } from './config/security';
import { isStorageAlive } from './database/minio';
import { checkPythonStix2 } from './database/utils';
import { addMarkingDefinition } from './domain/markingDefinition';
import { addSettings, getSettings } from './domain/settings';
import { ROLE_ADMINISTRATOR, ROLE_DEFAULT, SYSTEM_USER } from './domain/user';
import { addCapability, addRole } from './domain/grant';
import { addAttribute } from './domain/attribute';

const fs = require('fs');

// Platform capabilities definition
const BYPASS_CAPABILITY = 'BYPASS';
const KNOWLEDGE_CAPABILITY = 'KNOWLEDGE';
export const CAPABILITIES = [
  { name: BYPASS_CAPABILITY, description: 'Bypass all capabilities', ordering: 1 },
  {
    name: KNOWLEDGE_CAPABILITY,
    description: 'Access knowledge',
    ordering: 100,
    dependencies: [
      {
        name: 'KNUPDATE',
        description: 'Create / Update knowledge',
        ordering: 200,
        dependencies: [{ name: 'KNDELETE', description: 'Delete knowledge', ordering: 300 }]
      },
      { name: 'KNUPLOAD', description: 'Upload knowledge files', ordering: 400 },
      { name: 'KNASKIMPORT', description: 'Import knowledge', ordering: 500 },
      {
        name: 'KNGETEXPORT',
        description: 'Download knowledge export',
        ordering: 700,
        dependencies: [{ name: 'KNASKEXPORT', description: 'Generate knowledge export', ordering: 710 }]
      },
      { name: 'KNENRICHMENT', description: 'Ask for knowledge enrichment', ordering: 800 }
    ]
  },
  {
    name: 'EXPLORE',
    description: 'Access exploration',
    ordering: 1000,
    dependencies: [
      {
        name: 'EXUPDATE',
        description: 'Create  / Update exploration',
        ordering: 1100,
        dependencies: [{ name: 'EXDELETE', description: 'Delete exploration', ordering: 1200 }]
      }
    ]
  },
  {
    name: 'MODULES',
    description: 'Access connectors',
    ordering: 2000,
    dependencies: [{ name: 'MODMANAGE', description: 'Manage connector state', ordering: 2100 }]
  },
  {
    name: 'SETTINGS',
    description: 'Access administration',
    ordering: 3000,
    dependencies: [
      { name: 'SETINFERENCES', description: 'Manage inference rules', ordering: 3100 },
      { name: 'SETACCESSES', description: 'Manage credentials', ordering: 3200 },
      { name: 'SETMARKINGS', description: 'Manage marking definitions', ordering: 3300 }
    ]
  },
  {
    name: 'CONNECTORAPI',
    ordering: 4000,
    description: 'Connectors API usage: register, ping, export push ...'
  }
];

// Check every dependencies
export const checkSystemDependencies = async () => {
  // Check if Grakn is available
  await graknIsAlive();
  logger.info(`[PRE-CHECK] > Grakn is alive`);
  // Check if elasticsearch is available
  await elIsAlive();
  logger.info(`[PRE-CHECK] > Elasticsearch is alive`);
  // Check if minio is here
  await isStorageAlive();
  logger.info(`[PRE-CHECK] > Minio is alive`);
  // Check if Python is available
  await checkPythonStix2();
  logger.info(`[PRE-CHECK] > Python3 is available`);
};

// Initialize
export const initializeSchema = async () => {
  // Inject grakn schema
  const schema = fs.readFileSync('./src/opencti.gql', 'utf8');
  await write(schema);
  logger.info(`[INIT] > Grakn schema loaded`);
  // Create default indexes
  await elCreateIndexes();
  logger.info(`[INIT] > Elasticsearch indexes loaded`);
};

const createAttributesTypes = async () => {
  await addAttribute({ type: 'report_class', value: 'Threat Report' });
  await addAttribute({ type: 'report_class', value: 'Internal Report' });
  await addAttribute({ type: 'role_played', value: 'C2 server' });
  await addAttribute({ type: 'role_played', value: 'Relay node' });
};

const createMarkingDefinitions = async () => {
  // Create marking defs
  await addMarkingDefinition(SYSTEM_USER, {
    stix_id_key: 'marking-definition--613f2e26-407d-48c7-9eca-b8e91df99dc9',
    definition_type: 'TLP',
    definition: 'TLP:WHITE',
    color: '#ffffff',
    level: 1
  });
  await addMarkingDefinition(SYSTEM_USER, {
    stix_id_key: 'marking-definition--34098fce-860f-48ae-8e50-ebd3cc5e41da',
    definition_type: 'TLP',
    definition: 'TLP:GREEN',
    color: '#2e7d32',
    level: 2
  });
  await addMarkingDefinition(SYSTEM_USER, {
    stix_id_key: 'marking-definition--f88d31f6-486f-44da-b317-01333bde0b82',
    definition_type: 'TLP',
    definition: 'TLP:AMBER',
    color: '#d84315',
    level: 3
  });
  await addMarkingDefinition(SYSTEM_USER, {
    stix_id_key: 'marking-definition--5e57c739-391a-4eb3-b6be-7d15ca92d5ed',
    definition_type: 'TLP',
    definition: 'TLP:RED',
    color: '#c62828',
    level: 4
  });
};

export const createCapabilities = async (capabilities, parentName = '') => {
  for (let i = 0; i < capabilities.length; i += 1) {
    const capability = capabilities[i];
    const { name, description, ordering } = capability;
    const capabilityName = `${parentName}${name}`;
    // eslint-disable-next-line no-await-in-loop
    await addCapability({ name: capabilityName, description, ordering });
    if (capability.dependencies && capability.dependencies.length > 0) {
      // eslint-disable-next-line no-await-in-loop
      await createCapabilities(capability.dependencies, `${capabilityName}_`);
    }
  }
};

export const createBasicRolesAndCapabilities = async () => {
  // Create capabilities
  await createCapabilities(CAPABILITIES);
  // Create roles
  await addRole({
    name: ROLE_DEFAULT,
    description: 'Default role associated to all users',
    capabilities: [KNOWLEDGE_CAPABILITY],
    default_assignation: true
  });
  await addRole({
    name: ROLE_ADMINISTRATOR,
    description: 'Administrator role that bypass every capabilities',
    capabilities: [BYPASS_CAPABILITY]
  });
};

const initializeDefaultValues = async () => {
  logger.info(`[INIT] > Initialization of settings and basic elements`);
  await addSettings(SYSTEM_USER, {
    platform_title: 'Cyber threat intelligence platform',
    platform_email: 'admin@opencti.io',
    platform_url: '',
    platform_language: 'auto'
  });
  await createAttributesTypes();
  await createMarkingDefinitions();
  await createBasicRolesAndCapabilities();
};

const initializeData = async () => {
  // Init default values only if platform as no settings
  const settings = await getSettings();
  if (!settings) await initializeDefaultValues();
  logger.info(`[INIT] > Platform default initialized`);
  await initializeAdminUser();
};

const init = async () => {
  await checkSystemDependencies();
  await initializeSchema();
  await applyMigration();
  await initializeData();
};

export default init;
