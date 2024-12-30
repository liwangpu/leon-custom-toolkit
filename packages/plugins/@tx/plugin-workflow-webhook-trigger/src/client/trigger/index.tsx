import React, { useState } from 'react';
import { Button, notification } from 'antd';
import copy from 'copy-to-clipboard';
import { getSubAppName } from '@nocobase/sdk';
import { useApp } from '@nocobase/client';

import { WEBHOOK_TRIGGER_ACTION, WEBHOOK_API_NAME } from '../../enums';
import { uid } from '@formily/shared';
import { useForm } from '@formily/react';

import { Trigger } from '@nocobase/plugin-workflow/client';

let appName = '';

function useVariables(config, opts) {
  return [
    { key: 'webhookId', value: 'webhookId', label: 'Webhook ID' },
    {
      key: 'webhookRequest',
      value: 'webhookRequest',
      label: 'Webhook Request',
      children: [
        { key: 'headers', value: 'headers', label: 'Headers(json)' },
        { key: 'path', value: 'path', label: 'Path(string)' },
        { key: 'query', value: 'query', label: 'Query(json)' },
        { key: 'body', value: 'body', label: 'Body(json)' },
      ],
    },
  ];
}

function RandomComponent(props) {
  const app = useApp();
  appName = app ? getSubAppName(app.getPublicPath()) : '';
  const { setValuesIn } = useForm();
  return <Button onClick={() => setValuesIn('from', uid())}>随机生成标识</Button>;
}

function copyUrl(data) {
  const { url } = data;

  if (!url) {
    notification.warning({
      message: '请先输入唯一标识',
    });
    return;
  }

  copy(url, { format: 'text/plain' });
  notification.success({
    message: '复制成功',
  });
}

function CopyComponent(props) {
  const { values } = useForm();
  return <Button onClick={() => copyUrl(values)}>复制URL</Button>;
}

export class WebhookTrigger extends Trigger {
  title = 'Webhook Trigger';
  description = `外部系统通过/${WEBHOOK_API_NAME}:${WEBHOOK_TRIGGER_ACTION}?from={外部应用唯一标识}&...的方式触发工作流`;
  // fields of trigger config
  fieldset = {
    from: {
      type: 'string',
      title: '外部应用唯一标识(不区分大小写)',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      default: '',
      required: true,
    },
    random: {
      type: 'void',
      title: '',
      'x-decorator': 'FormItem',
      'x-component': 'RandomComponent',
    },
    url: {
      type: 'string',
      title: 'POST URL(供参考,以实际应用部署为准)',
      'x-decorator': 'FormItem',
      'x-component': 'Input.TextArea',
      'x-component-props': {
        disabled: true,
      },
      'x-reactions': (field) => {
        const origin = window.location.origin;
        const fromValue = field.query('.from').value();
        field.query('.url').forEach((f) => {
          let url = `${origin}/api/${WEBHOOK_API_NAME}:${WEBHOOK_TRIGGER_ACTION}?from=${fromValue}`;
          if (appName) {
            url += `&__appName=${appName}`;
          }
          f.setValue(url);
        });
      },
      default: '',
      required: false,
    },
    copy: {
      type: 'void',
      title: '',
      'x-decorator': 'FormItem',
      'x-component': 'CopyComponent',
    },
    timeout: {
      type: 'number',
      title: '超时时间设置(毫秒)',
      'x-decorator': 'FormItem',
      'x-component': 'InputNumber',
      default: 60000,
      required: true,
    },
  };
  components = {
    RandomComponent,
    CopyComponent,
  };
  useVariables = useVariables;
}
