/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/client';
import {
  copySubscribeActionSettings,
  createCopySubscribeActionInitializerItem,
  createTKManageButtonActionInitializerItem,
  tkManageButtonActionSettings,
  useCopyProxySubscribeActionProps,
} from './actions';
import { TKManageButton } from './components';
import { CopyProxySubscribeActionName, TKManageButtonName } from './consts';

export class PluginTiktokClient extends Plugin {
  async load() {
    this.app.addComponents({ TKManageButton });
    this.app.addScopes({ useCopyProxySubscribeActionProps });
    this.app.schemaSettingsManager.add(tkManageButtonActionSettings);
    this.app.schemaSettingsManager.add(copySubscribeActionSettings);
    this.app.schemaInitializerManager.addItem(
      'table:configureItemActions',
      TKManageButtonName,
      createTKManageButtonActionInitializerItem(),
    );
    this.app.schemaInitializerManager.addItem(
      'table:configureItemActions',
      CopyProxySubscribeActionName,
      createCopySubscribeActionInitializerItem(),
    );
  }
}

export default PluginTiktokClient;
