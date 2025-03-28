import { Plugin } from '@nocobase/server';
import { Context } from '@nocobase/actions';
import { isNil } from 'lodash';
import { getUserInfo } from '../middlewares';
import { IOrganizationPaidService, IOrganizationServicePackage } from '../../interfaces';

export const registerServicePermissionsActions = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.resourceManager.define({
    name: 'servicePermissions',
    actions: {
      submit: submitPermissions(),
      servicesInfo: getOrganizationServiceInfo(),
    },
  });
  app.acl.allow('servicePermissions', '*', 'loggedIn');
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
    const { organizationId } = getUserInfo({
      ctx,
    });
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
    console.log(`---------[ getOrganizationServiceInfo ]---------`);
    console.log(`organizationId:`, organizationId);
    organPackages = await organServicePackageRepo.find({
      filter: {
        organizationId,
      },
    });
    organServices = await organPaidServiceRepo.find({
      filter: {
        organizationId,
      },
    });

    genResponse();
  };
};
