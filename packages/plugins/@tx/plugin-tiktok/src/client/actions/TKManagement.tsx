/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { SchemaInitializerItemType, SchemaSettings, useSchemaInitializer } from '@nocobase/client';
import { TKManageButtonName, TKManageButtonNameLowerCase } from '../consts';
import { useT } from '../locale';

export const createTKManageButtonActionSchema = () => {
  return {
    type: 'void',
    'x-component': TKManageButtonName,
    'x-decorator': 'BlockItem',
    'x-settings': tkManageButtonActionSettings.name,
  };
};

export const createTKManageButtonActionInitializerItem = (): SchemaInitializerItemType => ({
  type: 'item',
  name: TKManageButtonNameLowerCase,
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      title: t(TKManageButtonName),
      onClick: () => {
        insert(createTKManageButtonActionSchema());
      },
    };
  },
});

export const tkManageButtonActionSettings = new SchemaSettings({
  name: `actionSettings:${TKManageButtonNameLowerCase}`,
  items: [
    {
      name: 'remove',
      type: 'remove',
    },
  ],
});
