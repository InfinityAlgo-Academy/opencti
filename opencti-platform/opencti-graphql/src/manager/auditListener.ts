import LRU from 'lru-cache';
import { ActionHandler, ActionListener, registerUserActionListener, UserAction, } from '../listener/UserActionListener';
import { isStixCoreObject } from '../schema/stixCoreObject';
import { isStixCoreRelationship } from '../schema/stixCoreRelationship';
import conf, { booleanConf, logAudit } from '../config/conf';
import { isEmptyField } from '../database/utils';
import type { BasicStoreSettings } from '../types/store';
import { EVENT_AUDIT_VERSION, storeAuditEvent } from '../database/redis';
import type { UserOrigin } from '../types/user';
import { getEntityFromCache } from '../database/cache';
import { ENTITY_TYPE_SETTINGS } from '../schema/internalObject';
import { executionContext, INTERNAL_USERS, isBypassUser, SYSTEM_USER } from '../utils/access';

// ------------------------------------------------------------------------ //
//     OpenCTI Enterprise Edition License                                   //
// ------------------------------------------------------------------------ //
//     Copyright (c) 2021-2023 Filigran SAS                                 //
//                                                                          //
// This file is part of the OpenCTI Enterprise Edition ("EE") and is        //
// licensed under the OpenCTI Non-Commercial License (the "License");       //
// you may not use this file except in compliance with the License.         //
// You may obtain a copy of the License at                                  //
//                                                                          //
// https://github.com/OpenCTI-Platform/opencti/blob/master/LICENSE          //
//                                                                          //
// Unless required by applicable law or agreed to in writing, software      //
// distributed under the License is distributed on an "AS IS" BASIS,        //
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. //
// ------------------------------------------------------------------------ //

const LOGS_SENSITIVE_FIELDS = conf.get('app:app_logs:logs_redacted_inputs') ?? [];
const EXTENDED_USER_TRACKING = booleanConf('app:audit_logs:extended_user_tracking', true);

export interface AuditStreamEvent {
  version: string
  type: string
  message: string
  status: 'error' | 'success'
  origin: Partial<UserOrigin>
  data: object
}

const initAuditManager = () => {
  const auditReadCache = new LRU({ ttl: 60 * 60 * 1000, max: 5000 }); // Read lifetime is 1 hour
  const cleanInputData = (obj: any) => {
    const stack = [obj];
    while (stack?.length > 0) {
      const currentObj = stack.pop() as any;
      Object.keys(currentObj).forEach((key) => {
        if (LOGS_SENSITIVE_FIELDS.includes(key)) {
          currentObj[key] = '*** Redacted ***';
        }
        if (typeof currentObj[key] === 'object' && currentObj[key] !== null) {
          stack.push(currentObj[key]);
        }
      });
    }
    return obj;
  };
  const buildAuditStreamEvent = (action: UserAction, message: string): AuditStreamEvent => {
    const data = cleanInputData(action.context_data ?? {});
    return {
      version: EVENT_AUDIT_VERSION,
      type: action.event_type,
      message,
      status: action.status,
      origin: action.user.origin,
      data,
    };
  };
  const auditLogger = async (action: UserAction, message: string): Promise<boolean> => {
    const context = executionContext('audit_listener');
    const settings = await getEntityFromCache<BasicStoreSettings>(context, SYSTEM_USER, ENTITY_TYPE_SETTINGS);
    // If enterprise edition is not activated
    if (isEmptyField(settings.enterprise_edition)) {
      return false;
    }
    // If validated, log to audit console, files
    const level = action.status === 'error' ? 'error' : 'info';
    logAudit._log(level, action.user, action.event_type, { ...action.context_data, message });
    // If specific user listening configured
    // User with bypass access is by default audited to prevent any silent modifications
    const auditListeners = settings.audit_listeners_users ?? [];
    if (isBypassUser(action.user) || auditListeners.includes(action.user.id)) {
      // Push to audit stream
      const event = buildAuditStreamEvent(action, message);
      await storeAuditEvent(event);
      return true;
    }
    return false;
  };
  const auditHandler: ActionListener = {
    id: 'AUDIT_MANAGER',
    next: async (action: UserAction) => {
      // Internal users must not be tracked
      if (INTERNAL_USERS[action.user.id]) {
        return;
      }
      // Subscription is not part of the listening
      if (action.user.origin.socket !== 'query') {
        return;
      }
      // region Security
      if (action.event_type === 'login') {
        const { provider } = action.context_data;
        const message = `login from provider \`${provider}\``;
        await auditLogger(action, message);
      }
      if (action.event_type === 'logout') {
        await auditLogger(action, 'logout');
      }
      if (action.event_type === 'admin') {
        await auditLogger(action, action.message);
      }
      if (action.event_type === 'unauthorized') {
        const { path } = action.context_data;
        const message = `tries an unauthorized access to \`${path}\``;
        await auditLogger(action, message);
      }
      // endregion
      // region User tracking
      if (EXTENDED_USER_TRACKING) {
        if (action.event_type === 'read') {
          const { id, entity_type, entity_name } = action.context_data;
          const identifier = `${id}-${action.user.id}`;
          if (!auditReadCache.has(identifier) && (isStixCoreObject(entity_type) || isStixCoreRelationship(entity_type))) {
            const message = `reads ${entity_type} \`${entity_name}\``;
            const published = await auditLogger(action, message);
            if (published) {
              auditReadCache.set(identifier, undefined);
            }
          }
        }
        if (action.event_type === 'upload') {
          const { file_name, entity_name } = action.context_data;
          const message = `uploads in \`${entity_name}\` the file \`${file_name}\``;
          await auditLogger(action, message);
        }
        if (action.event_type === 'download') {
          const { file_name, entity_name } = action.context_data;
          const message = `downloads from \`${entity_name}\` the file \`${file_name}\``;
          await auditLogger(action, message);
        }
        if (action.event_type === 'export') {
          const { file_name, entity_name } = action.context_data;
          const message = `asks for export generation in \`${entity_name}\` (\`${file_name}\`)`;
          await auditLogger(action, message);
        }
      }
      // endregion
    }
  };
  let handler: ActionHandler;
  return {
    start: async () => {
      handler = registerUserActionListener(auditHandler);
    },
    status: () => {
      return {
        id: 'AUDIT_MANAGER',
        enable: true,
        running: true,
      };
    },
    shutdown: async () => {
      if (handler) {
        handler.unregister();
      }
      return true;
    },
  };
};
const auditListener = initAuditManager();
export default auditListener;
