import type { Plugin } from '@nocobase/server';
import { getUserInfo } from './common';
import { Context } from '@nocobase/actions';

export const implementPermissionMiddleware = (plugin: Plugin) => {
  const { app } = plugin;
  const { acl } = app;

  acl.use(sellerListMiddeware(plugin));
};

const sellerListMiddeware = (plugin: Plugin) => {
  return async (ctx: Context, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'roles' && actionName === 'check')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    // console.log(`---------[ permission check ]---------`);
    // console.log(`---------[ permission check ]---------`);
    // console.log(`params:`, params);
    await next();
    // console.log(`ctx.body:`, ctx.body);

    // const body = {
    //   ...ctx.body,
    //   allowMenuItemIds: [],
    // };
    // console.log(`body:`, body);
    // ctx.body = body;
  };
};
