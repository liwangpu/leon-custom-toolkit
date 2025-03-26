import { Plugin } from '@nocobase/server';
import { Context } from '@nocobase/actions';
import { isNil } from 'lodash';

export const registerApplyUserActions = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.resourceManager.define({
    name: 'applyUser',
    actions: {
      requestTrial: requestTrial(),
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
    console.log(`---------[ requestTrial ]---------`);
    console.log(`body:`, formData);
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

    const organ = await organizationRepo.create({
      values: {
        name: `${formData.name}的小宇宙`,
        director: formData.name,
        directorPhone: formData.phone,
        directorEmail: formData.email,
      },
    });

    await trialUserRepo.create({
      values: {
        ...formData,
        organizationId: organ.id,
      },
    });

    ctx.withoutDataWrapping = true;
    ctx.body = {
      data: null,
    };
  };
};
