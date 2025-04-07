import { Plugin } from '@nocobase/server';
import { Context } from '@nocobase/actions';
import { isNil } from 'lodash';
// import PluginAliyunSmsServer from '@tx/plugin-aliyun-sms';
import { customAlphabet } from 'nanoid/non-secure';

export const registerApplyUserActions = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.resourceManager.define({
    name: 'applyUser',
    actions: {
      requestTrial: requestTrial(),
      sendPhoneVerificationSMS: sendPhoneVerificationSMS(),
    },
  });
  app.acl.allow('applyUser', '*', 'public');
};

const requestTrial = () => {
  return async (ctx: Context, next: () => any) => {
    // const {} = ctx.body as any;
    const formData = ctx.request.body as any;
    const { phone, email } = formData;
    console.log(`---------[ requestTrial ]---------`);

    // console.log(`body:`, formData);
    // const smsPulgin: PluginAliyunSmsServer = ctx.app.getPlugin(PluginAliyunSmsServer);
    // const errorMessage = smsPulgin.verificationCode(formData);
    // if (!isNil(errorMessage)) {
    //   return ctx.throw(400, errorMessage);
    // }

    console.log(`---------[ 验证通过,注册用户 ]---------`);
    console.log(`formData:`, formData);
    const trialUserRepo = ctx.db.getRepository('trialUser');

    const record = await trialUserRepo.findByTargetKey(phone);
    if (!isNil(record)) {
      throw new Error(`手机号为:${phone}的用户已经注册过，您可以使用该手机号登录，或者使用其他手机号注册！`);
    }

    const usersRepo = ctx.db.getRepository('users');
    const userRecord = await usersRepo.findOne({
      filter: {
        email,
      },
    });

    if (!isNil(userRecord)) {
      throw new Error(`邮箱为:${email}的用户已经注册过，您可以使用该邮箱登录，或者使用其他邮箱注册！`);
    }

    const organizationRepo = ctx.db.getRepository('organization');
    const userRep = ctx.db.getRepository('users');

    const organ = await organizationRepo.create({
      values: {
        name: `${formData.name}的小宇宙`,
        director: formData.name,
        directorPhone: formData.phone,
        directorEmail: formData.email,
      },
    });

    const initPassword = 'd706930ce8478e9ef36c67a6c89f3883c13fa48e49f7e0dc892204b772d584ea';

    // const user = await userRep.create({
    //   values: {
    //     nickname: formData.name,
    //     username: formData.name,
    //     phone: formData.phone,
    //     email: formData.email,
    //     password: initPassword,
    //     organizationId: organ.id,
    //     roles: [
    //       {
    //         name: 'organizationAdmin',
    //       },
    //       // {
    //       //   name: 'organizationUser',
    //       // },
    //     ],
    //   },
    // });

    await trialUserRepo.create({
      values: {
        ...formData,
        organizationId: organ.id,
        // userId: user.id,
      },
    });

    ctx.withoutDataWrapping = true;
    ctx.body = {
      data: {
        account: formData.phone,
        password: '123456',
      },
    };
  };
};

const sendPhoneVerificationSMS = () => {
  const genVerificationCode = customAlphabet('0123456789', 6);
  return async (ctx: Context, next: () => any) => {
    const formData = ctx.request.body as any;
    console.log(`---------[ tisendPhoneVerificationSMStle ]---------`);
    console.log(`formData:`, formData);

    // const smsPulgin: PluginAliyunSmsServer = ctx.app.getPlugin(PluginAliyunSmsServer);
    // await smsPulgin.sendSMSMessage({
    //   ...formData,
    //   signName: '南宁泰香农业',
    //   templateCode: 'SMS_481215207',
    //   params: { code: genVerificationCode() },
    // });
    // plugin.sendSMSMessage();

    ctx.withoutDataWrapping = true;
    ctx.body = {
      data: null,
    };
  };
};
