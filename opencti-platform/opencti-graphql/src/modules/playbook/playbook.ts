/*
Copyright (c) 2021-2023 Filigran SAS

This file is part of the OpenCTI Enterprise Edition ("EE") and is
licensed under the OpenCTI Non-Commercial License (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

https://github.com/OpenCTI-Platform/opencti/blob/master/LICENSE

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*/

import { v4 as uuidv4 } from 'uuid';
import { ABSTRACT_INTERNAL_OBJECT } from '../../schema/general';
import { type ModuleDefinition, registerDefinition } from '../../schema/module';
import entityPlaybookResolvers from './playbook-resolvers';
import entityPlaybookTypeDefs from './playbook.graphql';
import { ENTITY_TYPE_PLAYBOOK, PlayComponentDefinition, type StixPlaybook, type StoreEntityPlaybook } from './playbook-types';
import convertEntityPlaybookToStix from './playbook-converter';

const ENTITY_PLAYBOOK_DEFINITION: ModuleDefinition<StoreEntityPlaybook, StixPlaybook> = {
  type: {
    id: 'playbook',
    name: ENTITY_TYPE_PLAYBOOK,
    category: ABSTRACT_INTERNAL_OBJECT,
    aliased: false
  },
  graphql: {
    schema: entityPlaybookTypeDefs,
    resolver: entityPlaybookResolvers,
  },
  identifier: {
    definition: {
      [ENTITY_TYPE_PLAYBOOK]: () => uuidv4()
    },
  },
  attributes: [
    { name: 'name', type: 'string', mandatoryType: 'internal', editDefault: false, multiple: false, upsert: false },
    { name: 'description', type: 'string', mandatoryType: 'customizable', editDefault: true, multiple: false, upsert: false },
    { name: 'playbook_running', type: 'boolean', mandatoryType: 'no', editDefault: false, multiple: false, upsert: false },
    { name: 'playbook_start', type: 'string', mandatoryType: 'internal', editDefault: false, multiple: false, upsert: false },
    { name: 'playbook_definition', type: 'json', mandatoryType: 'internal', editDefault: false, multiple: false, upsert: false, schemaDef: PlayComponentDefinition }
  ],
  relations: [],
  representative: (stix: StixPlaybook) => {
    return stix.name;
  },
  converter: convertEntityPlaybookToStix
};

registerDefinition(ENTITY_PLAYBOOK_DEFINITION);
