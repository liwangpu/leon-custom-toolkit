import { Plugin } from '@nocobase/server';
import { Context } from '@nocobase/actions';
import { isNil } from 'lodash';
import { getUserInfo } from '../middlewares';
import { IOrganizationPaidService, IOrganizationServicePackage } from '../../interfaces';
import dayjs from 'dayjs';
import { UserOnlineRecorder } from '../middlewares/permission';

export const registerServicePermissionsActions = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.resourceManager.define({
    name: 'servicePermissions',
    actions: {
      submit: submitPermissions(),
      servicesInfo: getOrganizationServiceInfo(),
      checkOrganPackageIsExpired: checkOrganPackageIsExpired(),
      getOrganizationId: getOrganizationIdByUsername(),
    },
  });
  app.acl.allow('servicePermissions', '*', 'loggedIn');
  app.acl.allow('servicePermissions', 'checkOrganPackageIsExpired', 'public');
  app.acl.allow('servicePermissions', 'servicesInfo', 'public');
};

const submitPermissions = () => {
  return async (ctx: Context, next: () => any) => {
    const { serviceId, permissions } = ctx.request.body as any;

    const paidServicePermissionRepo = ctx.db.getRepository('paidServicePermissions');

    const record = await paidServicePermissionRepo.findByTargetKey(serviceId);
    if (isNil(record)) {
      await paidServicePermissionRepo.create({
        values: {
          serviceId,
          permissions,
        },
      });
    } else {
      await paidServicePermissionRepo.update({
        values: {
          serviceId,
          permissions,
        },
        filterByTk: serviceId,
      });
    }
    next();

    // ctx.withoutDataWrapping = true;
    // ctx.body = treeNodes;
  };
};

const getOrganizationServiceInfo = () => {
  return async (ctx: Context, next: () => any) => {
    let { organizationId } = ctx.query as any;
    if (isNil(organizationId)) {
      const { organizationId: organId } = getUserInfo({
        ctx,
      });
      organizationId = organId;
    }
    console.log(`---------[ title ]---------`);
    console.log(`organizationId:`, organizationId);
    let organPackages: IOrganizationServicePackage[] = [];
    let organServices: IOrganizationPaidService[] = [];
    ctx.withoutDataWrapping = true;
    const genResponse = () => {
      ctx.body = {
        organPackages,
        organServices,
      };
    };
    if (isNil(organizationId)) {
      genResponse();
      return;
    }
    const organServicePackageRepo = ctx.db.getRepository('organizationServicePackage');
    const organPaidServiceRepo = ctx.db.getRepository('organizationPaidService');
    const transferDateTime = (datetime: any) => {
      if (isNil(datetime)) return null;
      return dayjs(datetime).format('YYYY-MM-DD HH:mm:ss');
    };
    const currentTime = dayjs();
    organPackages = await organServicePackageRepo.find({
      filter: {
        organizationId: { $eq: organizationId },
      },
    });

    // console.log(`organPackages:`, organPackages);
    organPackages = organPackages.map((pck: any) => {
      const item: IOrganizationServicePackage = pck.dataValues;
      let daysRemaining = currentTime.diff(item.expirationDate, 'day');
      if (daysRemaining > 0) {
        daysRemaining = 0;
      }
      const subAccount = item.subAccount > 0 ? item.subAccount - 1 : 0;
      return {
        ...item,
        subAccount,
        purchasingDate: transferDateTime(item.purchasingDate),
        expirationDate: transferDateTime(item.expirationDate),
        daysRemaining: -daysRemaining,
      };
    });
    organServices = await organPaidServiceRepo.find({
      filter: {
        $and: [
          // 隐藏归属于套餐的服务
          { packages: { id: { $empty: true } } },
          { organizationId: { $eq: organizationId } },
        ],
      },
    });

    organServices = organServices.map((srv: any) => {
      const item: IOrganizationPaidService = srv.dataValues;
      let daysRemaining = currentTime.diff(item.expirationDate, 'day');
      if (daysRemaining > 0) {
        daysRemaining = 0;
      }
      return {
        ...item,
        purchasingDate: transferDateTime(item.purchasingDate),
        expirationDate: transferDateTime(item.expirationDate),
        daysRemaining: -daysRemaining,
      };
    });

    genResponse();
  };
};

const checkOrganPackageIsExpired = () => {
  return async (ctx: Context, next: () => any) => {
    const organServicePackageRepo = ctx.db.getRepository('organizationServicePackage');
    const expiredPackages = await organServicePackageRepo.find({
      filter: { $and: [{ expirationDate: { $dateBefore: dayjs().format('YYYY-MM-DD HH:mm:ss') } }] },
    });
    for (const p of expiredPackages) {
      const pack = p.dataValues;
      UserOnlineRecorder.forceOfflineAllOrganClients({ organizationId: pack.organizationId, app: ctx.app });
    }
    ctx.withoutDataWrapping = true;
    ctx.body = {
      expiredPackages,
    };
  };
};

const getOrganizationIdByUsername = () => {
  return async (ctx: Context, next: () => any) => {
    const { noid } = ctx.request.query as any;
  };
};
