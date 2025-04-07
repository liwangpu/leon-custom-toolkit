import type { Plugin } from '@nocobase/server';
import { Context } from '@nocobase/actions';
import { getUserInfo } from './common';

export const implementRoleCheckMiddleware = (plugin: Plugin) => {
  const { app } = plugin;
  const { acl } = app;
  acl.use(roleCheckMiddeware(plugin));
};

const roleCheckMiddeware = (plugin: Plugin) => {
  return async (ctx: Context, next: () => Promise<any>) => {
    const { resourceName, actionName, organizationId } = getUserInfo({
      ctx,
    });
    if (resourceName !== 'roles' || actionName !== 'check') return next();
    await next();

    const { currentUser } = ctx.state || {};

    const { allowMenuItemIds } = ctx.body;
    const roles: any[] = currentUser.roles;
    const roleRepo = ctx.db.getRepository('roles');

    const allowMenuItemIdSet = new Set<string>(allowMenuItemIds);
    for (const _role of roles) {
      const role = _role.dataValues;
      const roleInstance = await roleRepo.findOne({
        filter: {
          name: role.name,
        },
        appends: ['menuUiSchemas'],
      });
      const mids: string[] = roleInstance.get('menuUiSchemas').map((uiSchema) => uiSchema.get('x-uid'));
      mids.forEach((mid) => allowMenuItemIdSet.add(mid));
    }
    const newMids = [...allowMenuItemIdSet.values()];
    ctx.body.allowMenuItemIds = newMids;
  };
};
