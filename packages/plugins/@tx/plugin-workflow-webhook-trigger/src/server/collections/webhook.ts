import { defineCollection } from '@nocobase/database';
import { WEBHOOK_DOMAIN_NAME } from '../../enums';

export default defineCollection({
  shared: true,
  name: WEBHOOK_DOMAIN_NAME,
  sortable: 'sort',
  createdBy: true,
  updatedAt: true,
  updatedBy: true,
  logging: true,
  fields: [
    {
      type: 'text',
      name: 'config',
      uiSchema: {
        type: 'string',
        title: '工作流配置',
        'x-component': 'Text',
        required: true,
      },
    },
    {
      type: 'text',
      name: 'request',
      uiSchema: {
        type: 'string',
        title: '请求内容',
        'x-component': 'Text',
        required: true,
      },
    },
    {
      type: 'text',
      name: 'response',
      uiSchema: {
        type: 'string',
        title: '响应内容',
        'x-component': 'Text',
        required: false,
      },
    },
  ],
});
