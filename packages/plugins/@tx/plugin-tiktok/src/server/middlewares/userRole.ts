import { isNil } from 'lodash';
import type { Plugin } from '@nocobase/server';
import dayjs from 'dayjs';
import { Context } from '@nocobase/actions';
import { getUserInfo } from './common';

export const implementUserRoleMiddleware = (plugin: Plugin) => {
  const { app } = plugin;
  const { acl } = app;
  acl.use(userRoleValidationMiddeware(plugin));
};

const userRoleValidationMiddeware = (plugin: Plugin) => {
  return async (ctx: Context, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'users' && actionName === 'update')) return next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { values } = params;
    const { organizationId, roles: currentUserRoles = [] } = values || {};
    if (isNil(organizationId)) return next();
    const usersRepo = ctx.db.getRepository('users');
    const organUsers = await usersRepo.find({
      filter: {
        organizationId,
      },
      appends: ['roles'],
    });

    const roleCountMap = new Map<string, { roleTitle: string; count: number }>();
    const allowRoleCountMap = new Map<string, number>();

    const addCount = (role: { name: string; title: string; classification: string }) => {
      if (role.classification !== 'tiktok' || role.name === 'organizationAdmin' || role.name === 'organizationUser')
        return;
      const { count } = roleCountMap.get(role.name) || { count: 0 };
      roleCountMap.set(role.name, { roleTitle: role.title, count: count + 1 });
    };

    // 统计未变更用户角色数量
    for (const us of organUsers) {
      const user = us.dataValues;
      const roles = user.roles;
      for (const ro of roles) {
        const role = ro.dataValues;
        addCount(role);
      }
    }
    // 加上当前用户变更的角色信息
    for (const role of currentUserRoles) {
      addCount(role);
    }

    const currentTime = dayjs();
    const currentTimeStr = currentTime.format('YYYY-MM-DD HH:mm:ss');
    const organServicePackageRepo = ctx.db.getRepository('organizationServicePackage');
    const usablePackages: any[] = await organServicePackageRepo.find({
      filter: {
        $and: [{ expirationDate: { $dateAfter: currentTimeStr } }, { organizationId: { $eq: organizationId } }],
      },
      appends: ['package'],
    });
    for (const _organPck of usablePackages) {
      const organPck = _organPck.dataValues;
      const pck = organPck.package;
      if (pck.subAccountRoleName && organPck.subAccount) {
        const subAccountRoleNames = (pck.subAccountRoleName as string).split(',');
        for (const subAccountRoleName of subAccountRoleNames) {
          let _count = allowRoleCountMap.get(subAccountRoleName) || 0;
          _count += organPck.subAccount;
          allowRoleCountMap.set(subAccountRoleName, _count);
        }
      }
    }

    for (const [roleName, info] of roleCountMap) {
      const roleAllowCount = allowRoleCountMap.get(roleName) || 0;
      if (info.count > roleAllowCount) {
        ctx.throw(
          400,
          `${info.roleTitle}在组织的套餐内允许的最大数量为${roleAllowCount}个,当前已经配置了${info.count}个`,
        );
      }
    }
    return next();
  };
};
