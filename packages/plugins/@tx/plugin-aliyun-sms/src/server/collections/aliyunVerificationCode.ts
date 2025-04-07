import { defineCollection } from '@nocobase/database';

export default defineCollection({
  name: 'aliyunVerificationCode',
  title: '手机短信验证校验',
  autoGenId: false,
  fields: [
    {
      type: 'string',
      name: 'verificationKey',
      title: '短信校验Key',
    },
    {
      type: 'string',
      name: 'phone',
      title: '手机号',
    },
    {
      type: 'string',
      name: 'verificationCode',
      title: '短信验证码',
    },
  ],
});
