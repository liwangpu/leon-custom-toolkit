/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import {
  ISchema,
  SchemaInitializerItemType,
  SchemaSettings,
  useCollectionRecordData,
  useSchemaInitializer,
} from '@nocobase/client';
import { useT } from '../locale';
import { CopyProxySubscribeActionName, CopyProxySubscribeActionNameLowercase } from '../consts';
import { message } from 'antd';
import copy from 'copy-to-clipboard';

export function useCopyProxySubscribeActionProps() {
  const record = useCollectionRecordData();
  const t = useT();
  return {
    title: t(CopyProxySubscribeActionName),
    type: 'primary',
    onClick() {
      const url = `${window.location.origin}/api/proxySubscription:subscribe?noid=${record.noid}`;
      copy(url);
      message.info('复制成功!');
    },
  };
}

export const createCopySubscribeActionSchema = (): ISchema => {
  return {
    type: 'void',
    'x-component': 'Action.Link',
    'x-use-component-props': 'useCopyProxySubscribeActionProps',
    'x-settings': copySubscribeActionSettings.name,
  };
};

export const createCopySubscribeActionInitializerItem = (): SchemaInitializerItemType => ({
  type: 'item',
  name: CopyProxySubscribeActionNameLowercase,
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      title: t(CopyProxySubscribeActionName),
      onClick: () => {
        insert(createCopySubscribeActionSchema());
      },
    };
  },
});

export const copySubscribeActionSettings = new SchemaSettings({
  name: `actionSettings:${CopyProxySubscribeActionNameLowercase}`,
  items: [
    {
      name: 'remove',
      type: 'remove',
    },
  ],
});
