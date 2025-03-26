import { defineCollection } from '@nocobase/database';

export default defineCollection({
  name: 'officialWebSiteSetting',
  title: 'TikPulse官网配置',
  autoGenId: false,
  fields: [
    {
      type: 'string',
      name: 'key',
      title: 'Key',
      primaryKey: true,
    },
    {
      type: 'json',
      name: 'setting',
      title: 'Setting',
    },
  ],
});
