/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { ACLRolesCheckProvider, NavigateIfNotSignIn, Plugin } from '@nocobase/client';
import { CooperationManagement } from './components';
import React from 'react';

export class PluginCooperationManagementClient extends Plugin {
  async load() {
    this.app.router.add('cooperation_management', {
      path: 'cooperation-management',
      Component: () => (
        <NavigateIfNotSignIn>
          <ACLRolesCheckProvider>
            <CooperationManagement />
          </ACLRolesCheckProvider>
        </NavigateIfNotSignIn>
      ),
    });
  }
}

export default PluginCooperationManagementClient;
