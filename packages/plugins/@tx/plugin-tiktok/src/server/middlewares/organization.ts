import Database from '@nocobase/database';
import { isFunction, isNil, merge } from 'lodash';
import { Plugin } from '@nocobase/server';
import { getUserInfo } from './common';

interface IPermissionDefinition {
  name: string;
  afterCreate?: (props: { model: any; options: any; userInfo: { isOrganizationAdminUser?: boolean } }) => void;
  permissionFilter?: (props: {
    db: Database;
    userInfo: { isOrganizationAdminUser: boolean; isRootOrAdmin: boolean; userId: number };
  }) => Promise<any>;
}

const permissionDefinitions: Array<IPermissionDefinition> = [
  {
    name: 'users',
    // async afterCreate(props) {
    //   const { model, userInfo } = props;
    //   const { isOrganizationAdminUser } = userInfo;
    //   console.log(`---------[ userInfo ]---------`);
    //   console.log(`userInfo:`, userInfo);
    //   if (isOrganizationAdminUser) {
    //     const roles: Array<any> = model.dataValues?.roles || [];
    //     roles.push({
    //       name: 'organizationUser',
    //     });
    //     model.dataValues.roles = roles;
    //   }
    // },
  },
  {
    name: 'tk_account',
    async permissionFilter(props) {
      const { userInfo } = props;
      const { userId, isOrganizationAdminUser, isRootOrAdmin } = userInfo;
      if (isOrganizationAdminUser || isRootOrAdmin) return;
      const filter = {
        $and: [{ operators: { id: { $eq: [userId] } } }],
      };
      return filter;
    },
  },
  {
    name: 'tk_device_order',
  },
  {
    name: 'tk_grow_fans_plan',
  },
  {
    name: 'tk_grow_fans_plan_log',
  },
  {
    name: 'tk_package_proxy_node',
  },
  {
    name: 'tk_account_search_term',
  },
  {
    name: 'tk_posting_resource',
  },
  {
    name: 'tk_posting_resource_release',
  },
  {
    name: 'tk_grow_fans_task',
    async permissionFilter(props) {
      const { db, userInfo } = props;
      const { userId, isOrganizationAdminUser } = userInfo;
      if (isOrganizationAdminUser) return;
      const operatorRep = db.getRepository('tk_operators');
      const records: Array<any> = await operatorRep.find({
        filter: {
          userId,
        },
      });
      const ownTKAccountIds = records.map((r) => r.tkAccountId);
      const filter = {
        $and: [{ account: { id: { $eq: ownTKAccountIds } } }],
      };
      return filter;
    },
  },
  {
    name: 'organizationPaidService',
  },
  {
    name: 'organizationServicePackage',
  },
  {
    name: 'costs',
  },
];

const permissionDefinitionMap = new Map(permissionDefinitions.map((def) => [def.name, def]));

export function organizationResourceMiddeware(plugin: Plugin) {
  // const organizationFlagResources = ['users', 'tk_account'];
  const { db } = plugin;
  const organizationResourceDefinitions = new Set(permissionDefinitions.map((d) => d.name));

  return async (ctx: any, next: () => Promise<any>) => {
    // eslint-disable-next-line prefer-const
    let { resourceName, organizationId, userId, isRootOrAdmin, isOrganizationAdminUser } = getUserInfo({ ctx });
    if (organizationResourceDefinitions.has(resourceName) && !isRootOrAdmin) {
      // 一般不会有organizationId,如果有,那么是程序异常,那么这里设置一个不可能存在的值,也是为了不返回数据
      if (isNil(organizationId)) {
        organizationId = 0;
      }
      const filter = {
        $and: [{ organizationId: { $eq: organizationId } }],
      };

      const def = permissionDefinitionMap.get(resourceName);
      if (isFunction(def.permissionFilter)) {
        const _filter = await def.permissionFilter({
          db,
          userInfo: { userId, isRootOrAdmin, isOrganizationAdminUser },
        });
        if (!isNil(_filter)) {
          merge(filter, _filter);
        }
      }

      ctx.action.mergeParams({
        filter,
      });
    }

    await next();
  };
}

export function organizationResourceDBEvent(props: { db: Database }) {
  const { db } = props;
  const getUserInfo = (props: { currentUser: any }) => {
    const { currentUser } = props;
    const { organizationId, roles } = currentUser || { roles: [], organizationId: null };
    const rolesSet = new Set(roles.map((r) => r.name));
    const isRootAdmin = rolesSet.has('root');
    const isOrganizationAdminUser = rolesSet.has('organizationAdmin');
    const isOrganizationUser = rolesSet.has('organizationAdmin');
    return {
      organizationId,
      isRootAdmin,
      isOrganizationAdminUser,
      isOrganizationUser,
    };
  };
  for (const def of permissionDefinitions) {
    db.on(`${def.name}.beforeCreate`, (model, options) => {
      if (isNil(model.organizationId)) {
        if (isNil(options.context) || isNil(options.context.state)) return;
        const { currentUser } = options.context.state || {};
        const { organizationId, isOrganizationAdminUser } = getUserInfo({ currentUser });
        model.organizationId = organizationId;
        if (isFunction(def.afterCreate)) {
          def.afterCreate({ model, options, userInfo: { isOrganizationAdminUser } });
        }
      }
    });
  }
}
