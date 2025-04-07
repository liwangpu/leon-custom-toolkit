import { isNil } from 'lodash';
import type { Plugin } from '@nocobase/server';
import dayjs from 'dayjs';
import { Context } from '@nocobase/actions';

export const implementSignInMiddleware = (plugin: Plugin) => {
  const { app } = plugin;
  const { acl } = app;
  acl.use(signInMiddeware(plugin));
};

const signInMiddeware = (plugin: Plugin) => {
  return async (ctx: Context, next: () => Promise<any>) => {
    if (ctx.request?.url !== '/api/auth:signIn') return await next();
    await next();

    const currentUser = ctx.body?.user?.dataValues;
    const organizationId = currentUser?.organizationId;
    if (isNil(organizationId)) return;
    // console.log(`organizationId:`, organizationId);
    // console.log(`currentUser:`, currentUser);
    const organServicePackageRepo = ctx.db.getRepository('organizationServicePackage');
    const expiredPackages: any[] = await organServicePackageRepo.find({
      filter: { $and: [{ expirationDate: { $dateBefore: dayjs().format('YYYY-MM-DD HH:mm:ss') } }, organizationId] },
    });
    if (!expiredPackages.length) return;
    ctx.throw(400, '该组织套餐已到期,请先续费再使用!');
  };
};
