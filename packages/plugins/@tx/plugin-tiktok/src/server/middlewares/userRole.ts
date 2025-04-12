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
    const {
      resourceName,
      actionName,
      organizationId: creatorOrganizationId,
    } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'users' && (actionName === 'update' || actionName === 'create'))) return next();
    if (isNil(creatorOrganizationId)) return next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { values } = params;
    if (isNil(values)) return next();
    // eslint-disable-next-line prefer-const
    let { id: userId, organizationId, roles: userNewRoles = [] } = values || {};
    // console.log(`---------[ userRoleValidationMiddeware ]---------`);
    // console.log(`actionName:`, actionName);
    // console.log(`resourceName:`, resourceName);
    // console.log(`values:`, values);

    const isCreated = actionName === 'create';

    if (isCreated && isNil(organizationId)) {
      organizationId = creatorOrganizationId;
    }

    // 如果是新建的时候,是没有组织id的,编辑才有
    const usersRepo = ctx.db.getRepository('users');

    // console.log(`organizationId:`, organizationId);

    const organUsers = await usersRepo.find({
      filter: {
        organizationId,
      },
      appends: ['roles'],
    });

    // console.log(`organUsers:`, organUsers);
    // return;

    const roleCountMap = new Map<string, { roleTitle: string; count: number }>();
    const allowRoleCountMap = new Map<string, number>();

    const addCount = (role: { name: string; title: string; classification: string }) => {
      if (role.classification !== 'tiktok' || role.name === 'organizationAdmin' || role.name === 'organizationUser')
        return;
      const { count } = roleCountMap.get(role.name) || { count: 0 };
      roleCountMap.set(role.name, { roleTitle: role.title, count: count + 1 });
    };

    const calculateCurrentNewRoles = () => {
      for (const role of userNewRoles) {
        addCount(role);
      }
    };
    // 统计未变更用户角色数量
    for (const us of organUsers) {
      const user = us.dataValues;
      // 如果当前用户是更新,那么用最新的来判定
      if (userId === user.id) {
        calculateCurrentNewRoles();
      } else {
        const roles = user.roles;
        for (const ro of roles) {
          const role = ro.dataValues;
          addCount(role);
        }
      }
    }

    // // 加上当前用户变更的角色信息
    if (isCreated) {
      calculateCurrentNewRoles();
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
    // console.log(`roleCountMap:`, roleCountMap);
    // console.log(`allowRoleCountMap:`, allowRoleCountMap);
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
