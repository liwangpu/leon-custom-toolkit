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

    const organServicePackageRepo = ctx.db.getRepository('organizationServicePackage');
    const expiredPackages: any[] = await organServicePackageRepo.find({
      filter: { $and: [{ organizationId: { $eq: organizationId } }] },
    });
    ctx.res.setHeader('x-organization-id', organizationId);

    if (!expiredPackages?.length) {
      return ctx.throw(400, '您没有购买有任何套餐,无法使用,请先购买套餐后再使用!');
    }
    const currentTime = dayjs();
    const hasExpirated = expiredPackages.some((pck) => {
      const _expirationDate = pck.expirationDate;
      return currentTime.isAfter(dayjs(_expirationDate));
    });
    if (!hasExpirated) return;
    return ctx.throw(400, '该组织套餐已到期,请先续费后再使用!');

    // const expiredPackages: any[] = await organServicePackageRepo.find({
    //   filter: { $and: [{ expirationDate: { $dateBefore: dayjs().format('YYYY-MM-DD HH:mm:ss') } }, organizationId] },
    // });
    // if (!expiredPackages.length) return;
    // ctx.throw(400, '该组织套餐已到期,请先续费再使用!');
  };
};
