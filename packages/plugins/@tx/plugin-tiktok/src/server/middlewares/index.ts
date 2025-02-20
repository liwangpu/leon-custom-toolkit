import Database from '@nocobase/database';
import { isFunction, isNil, merge } from 'lodash';
import { Plugin } from '@nocobase/server';

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
    name: 'tk_package_proxy_node',
  },
  {
    name: 'tk_account_search_term',
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
];

const permissionDefinitionMap = new Map(permissionDefinitions.map((def) => [def.name, def]));

export function organizationResourceMiddeware(plugin: Plugin) {
  // const organizationFlagResources = ['users', 'tk_account'];
  const { db } = plugin;
  const organizationResourceDefinitions = new Set(permissionDefinitions.map((d) => d.name));
  /**
   * 获取当前用户信息
   * @param ctx
   * @returns
   */
  const getUserInfo = (props: { ctx: any }) => {
    const { ctx } = props;
    const { currentUser, currentRole } = ctx.state || {};
    if (isNil(currentUser)) {
      return {};
    }
    const { organizationId, roles } = currentUser || { roles: [], organizationId: null };
    // const rolesSet = new Set(roles.map((r) => r.name));
    const isRootOrAdmin = currentRole === 'root' || currentRole === 'admin';
    const isOrganizationAdminUser = currentRole === 'organizationAdmin';
    const isOrganizationUser = currentRole === 'organizationAdmin';
    const { resourceName, actionName } = ctx.action;
    return {
      userId: currentUser.id,
      organizationId,
      isRootOrAdmin,
      isOrganizationAdminUser,
      isOrganizationUser,
      resourceName,
      actionName,
    };
  };
  //
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, organizationId, userId, isRootOrAdmin, isOrganizationAdminUser } = getUserInfo({ ctx });
    if (organizationResourceDefinitions.has(resourceName) && !isRootOrAdmin) {
      const filter = {
        $and: [{ organizationId }],
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

  db.on('organization.afterCreate', async (model, options) => {
    const { transaction } = options;
    const organization = await model.constructor.findByPk(model.id, {
      transaction,
    });
    const userRep = db.getRepository('users');
    await userRep.create({
      values: {
        nickname: organization.director,
        username: organization.directorPhone,
        phone: organization.directorPhone,
        email: organization.directorEmail,
        password: '123456',
        organizationId: organization.id,
        roles: [
          {
            name: 'organizationAdmin',
          },
          // {
          //   name: 'organizationUser',
          // },
        ],
      },
    });
  });
}
