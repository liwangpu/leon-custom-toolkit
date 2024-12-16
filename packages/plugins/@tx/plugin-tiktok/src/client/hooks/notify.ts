/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { notification } from 'antd';

export function useNotify(): [(params: { message: string; description?: string }) => void, any] {
  const [notify, contextHolder] = notification.useNotification();

  return [
    (params: { message: string; description?: string }) => {
      notify.success({
        description: params.description || '温馨提示',
        message: params.message || '操作成功!',
        duration: 2,
        placement: 'bottomRight',
      });
    },
    contextHolder,
  ];
}
