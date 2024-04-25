import { describe, expect, it } from 'vitest';
import { listAllEntities } from '../../../src/database/middleware-loader';
import { ENTITY_TYPE_CAPABILITY } from '../../../src/schema/internalObject';
import { ADMIN_USER, testContext } from '../../utils/testQuery';
import type { BasicStoreEntity } from '../../../src/types/store';

describe('Data initialization test', () => {
  it('should create all capabilities', async () => {
    const capabilities = await listAllEntities<BasicStoreEntity>(testContext, ADMIN_USER, [ENTITY_TYPE_CAPABILITY]);
    expect(capabilities.length).toEqual(27);
    const capabilitiesNames = capabilities.map((capa) => capa.name).sort();
    const allExpectedNames = [
      'BYPASS',
      'BYPASSREFERENCE',
      'CONNECTORAPI',
      'EXPLORE',
      'EXPLORE_EXUPDATE',
      'EXPLORE_EXUPDATE_EXDELETE',
      'EXPLORE_EXUPDATE_PUBLISH',
      'KNOWLEDGE',
      'KNOWLEDGE_KNASKIMPORT',
      'KNOWLEDGE_KNENRICHMENT',
      'KNOWLEDGE_KNGETEXPORT',
      'KNOWLEDGE_KNGETEXPORT_KNASKEXPORT',
      'KNOWLEDGE_KNPARTICIPATE',
      'KNOWLEDGE_KNUPDATE',
      'KNOWLEDGE_KNUPDATE_KNDELETE',
      'KNOWLEDGE_KNUPDATE_KNMANAGEAUTHMEMBERS',
      'KNOWLEDGE_KNUPDATE_KNORGARESTRICT',
      'KNOWLEDGE_KNUPLOAD',
      'MODULES',
      'MODULES_MODMANAGE',
      'SETTINGS',
      'SETTINGS_SETACCESSES',
      'SETTINGS_SETLABELS',
      'SETTINGS_SETMARKINGS',
      'TAXIIAPI',
      'TAXIIAPI_SETCOLLECTIONS',
      'TAXIIAPI_SETCSVMAPPERS',
    ];
    expect(capabilitiesNames).toEqual(allExpectedNames);
  });
});
