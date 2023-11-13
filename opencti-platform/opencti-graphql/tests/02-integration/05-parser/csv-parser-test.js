import { describe, expect, it } from 'vitest';
import { csvMapperMockSimpleEntity } from "./simple-entity-test/csv-mapper-mock-simple-entity";
import { isNotEmptyField } from "../../../src/database/utils";

import '../../../src/modules';
import { csvMapperMockSimpleRelationship } from "./simple-relationship-test/csv-mapper-mock-simple-relationship";
import { csvMapperMockSimpleEntityWithRef } from "./simple-entity-with-ref-test/csv-mapper-mock-simple-entity-with-ref";
import { columnNameToIdx } from "../../../src/parser/csv-helper";
import { csvMapperMockRealUseCase } from "./real-use-case/csv-mapper-mock-real-use-case";
import {
  csvMapperMockSimpleDifferentEntities
} from "./simple-different-entities-test/csv-mapper-mock-simple-different-entities";
import { csvMapperMockSimpleSighting } from "./simple-sighting-test/csv-mapper-mock-simple-sighting";
import { bundleProcess } from "../../../src/parser/csv-bundler";
import { ADMIN_USER, testContext } from "../../utils/testQuery";
import { csvMapperMockSimpleSkipLine } from "./simple-skip-line-test/csv-mapper-mock-simple-skip-line";

describe('CSV-HELPER', () => {
  it('Column name to idx', async () => {
    let idx = columnNameToIdx('A');
    expect(idx)
      .toBe(0);
    idx = columnNameToIdx('Z');
    expect(idx)
      .toBe(25);
    idx = columnNameToIdx('AD');
    expect(idx)
      .toBe(29); // 26 + 3
    idx = columnNameToIdx('BE');
    expect(idx)
      .toBe(56); // 26 + 26 + 4
    idx = columnNameToIdx('IQ');
    expect(idx)
      .toBe(250);
    idx = columnNameToIdx('AJD');
    expect(idx)
      .toBe(939);
  })
});

describe('CSV-PARSER', () => {
  it('Parse CSV - Simple entity', async () => {
    const filPath = './tests/02-integration/05-parser/simple-entity-test/Threat-Actor-Group_list.csv';
    const bundle = await bundleProcess(testContext, ADMIN_USER, filPath, csvMapperMockSimpleEntity);

    const objects = bundle.objects;
    expect(objects.length)
      .toBe(5);
    expect(objects.filter((o) => isNotEmptyField(o.name)).length)
      .toBe(5);
    const threatActorWithTypes = objects.filter((o) => isNotEmptyField(o.threat_actor_types))[0];
    expect(threatActorWithTypes)
      .not
      .toBeNull();
    expect(threatActorWithTypes.threat_actor_types.length)
      .toBe(2);
  });
  it('Parse CSV - Simple relationship', async () => {
    const filPath = './tests/02-integration/05-parser/simple-relationship-test/Threat-Actor-Group_PART-OF_list.csv';
    const bundle = await bundleProcess(testContext, ADMIN_USER, filPath, csvMapperMockSimpleRelationship);

    const objects = bundle.objects;
    expect(objects.length)
      .toBe(6);
    expect(objects.filter((o) => o.type === 'threat-actor').length)
      .toBe(4);
    expect(objects.filter((o) => o.relationship_type === 'part-of').length)
      .toBe(2);
  });
  it('Parse CSV - Simple sighting', async () => {
    const filPath = './tests/02-integration/05-parser/simple-sighting-test/Threat-Actor-Group_SIGHTING_org.csv';
    const bundle = await bundleProcess(testContext, ADMIN_USER, filPath, csvMapperMockSimpleSighting);

    const objects = bundle.objects;
    expect(objects.length)
      .toBe(3);
    expect(objects.filter((o) => o.type === 'threat-actor').length)
      .toBe(1);
    expect(objects.filter((o) => o.type === 'identity').length)
      .toBe(1);
    expect(objects.filter((o) => o.type === 'sighting').length)
      .toBe(1);
  });
  it('Parse CSV - Simple entity with refs', async () => {
    const filPath = './tests/02-integration/05-parser/simple-entity-with-ref-test/Threat-Actor-Group_with-ref.csv';
    const bundle = await bundleProcess(testContext, ADMIN_USER, filPath, csvMapperMockSimpleEntityWithRef);

    const objects = bundle.objects;
    expect(objects.length)
      .toBe(3);
    const label = objects.filter((o) => o.type === 'label')[0];
    const createdBy = objects.filter((o) => o.type === 'identity')[0];
    const threatActor = objects.filter((o) => o.type === 'threat-actor')[0];
    expect(label)
      .not
      .toBeNull();
    expect(createdBy)
      .not
      .toBeNull();
    expect(threatActor)
      .not
      .toBeNull();
    expect(threatActor.labels.length)
      .toBe(1);
    expect(threatActor.created_by_ref)
      .not
      .toBeNull();
  });
  it('Parse CSV - Simple different entities', async () => {
    const filPath = './tests/02-integration/05-parser/simple-different-entities-test/Threat-Actor-Group_or_Organization.csv';
    const bundle = await bundleProcess(testContext, ADMIN_USER, filPath, csvMapperMockSimpleDifferentEntities);

    const objects = bundle.objects;
    expect(objects.length)
      .toBe(2);
    expect(objects.filter((o) => o.type === 'threat-actor').length)
      .toBe(1);
    expect(objects.filter((o) => o.type === 'identity').length)
      .toBe(1);
  });
  it('Parse CSV - Real use case', async () => {
    const filPath = './tests/02-integration/05-parser/real-use-case/schema incidents.csv';
    const bundle = await bundleProcess(testContext, ADMIN_USER, filPath, csvMapperMockRealUseCase);

    const objects = bundle.objects;
    const incidents = objects.filter((o) => o.type === 'incident');
    expect(incidents.length)
      .toBe(118);
    const countries = objects.filter((o) => o.type === 'location'); // Countries
    expect(countries.length)
      .toBe(35);
    const identities = objects.filter((o) => o.type === 'identity'); // Sectors & organizations
    expect(identities.length)
      .toBe(131);
    const threatActors = objects.filter((o) => o.type === 'threat-actor');
    expect(threatActors.length)
      .toBe(42);
    const relationshipTargets = objects.filter((o) => o.relationship_type === 'targets');
    expect(relationshipTargets.length)
      .toBe(118);
    const relationshipLocatedAt = objects.filter((o) => o.relationship_type === 'located-at');
    expect(relationshipLocatedAt.length)
      .toBe(130);
    const relationshipPartOf = objects.filter((o) => o.relationship_type === 'part-of');
    expect(relationshipPartOf.length)
      .toBe(160);
  });
  it('Parse CSV - Simple skip line test on Simple entity ', async () => {
    const filPath = './tests/02-integration/05-parser/simple-skip-line-test/Threat-Actor-Group_list_skip_line.csv';
    const bundle = await bundleProcess(testContext, ADMIN_USER, filPath, csvMapperMockSimpleSkipLine);
    const objects = bundle.objects;
    expect(objects.length)
      .toBe(5);
    expect(objects.filter((o) => isNotEmptyField(o.name)).length)
      .toBe(5);
    const threatActorWithTypes = objects.filter((o) => isNotEmptyField(o.threat_actor_types))[0];
    expect(threatActorWithTypes)
      .not
      .toBeNull();
    expect(threatActorWithTypes.threat_actor_types.length)
      .toBe(2);
  });
})
