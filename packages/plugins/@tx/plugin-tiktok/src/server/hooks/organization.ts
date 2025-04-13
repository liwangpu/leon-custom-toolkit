import { isNil } from 'lodash';
import Database from '@nocobase/database';
import { IServicePackage } from '../../interfaces';
import dayjs from 'dayjs';

export function afterOrganizationCreate(props: { db: Database }) {
  const { db } = props;
  db.on('organization.afterCreate', async (model, options) => {
    const { transaction } = options;
    const organization = await model.constructor.findByPk(model.id, {
      transaction,
    });
    const organizationId = organization.id;
    const extra = organization.extra || {};
    const { initialPassword = '123456' } = extra;
    const userRep = db.getRepository('users');
    // 创建租户默认管理员
    await userRep.create({
      values: {
        nickname: organization.director,
        username: organization.directorPhone,
        phone: organization.directorPhone,
        email: organization.directorEmail,
        password: initialPassword,
        organizationId,
        roles: [
          {
            name: 'organizationAdmin',
          },
          // {
          //   name: 'operationSpecialist',
          // },
          // {
          //   name: 'productDeveloper',
          // },
        ],
      },
    });

    // // 创建租户试用套餐
    // //试用版本的套餐id
    // const freeTrialPackageId = 4;
    // const organServicePackageRepo = db.getRepository('organizationServicePackage');
    // const servicePackageRepo = db.getRepository('servicePackage');
    // const currentTime = dayjs();
    // const transferDateTime = (datetime: any) => {
    //   if (isNil(datetime)) return null;
    //   const dt = dayjs.isDayjs(datetime) ? datetime : dayjs(datetime);
    //   return dt.format('YYYY-MM-DD HH:mm:ss');
    // };
    // const currentTimeStr = transferDateTime(currentTime);
    // const expirationDate = currentTime.add(3, 'day');
    // const expirationDateStr = transferDateTime(expirationDate);
    // const servicePackage: IServicePackage = await servicePackageRepo.findOne({
    //   filterByTk: freeTrialPackageId,
    //   appends: ['services'],
    // });

    // const paidServices = servicePackage.services || [];

    // const organPaidServices = paidServices.map((service) => {
    //   return {
    //     organizationId,
    //     serviceId: service.id,
    //     name: service.name,
    //     price: service.price,
    //     purchasingDate: currentTimeStr,
    //     expirationDate: expirationDateStr,
    //   };
    // });

    // const organServicePackage = {
    //   organizationId,
    //   packageId: freeTrialPackageId,
    //   subAccount: 1,
    //   purchasingDate: currentTimeStr,
    //   expirationDate: expirationDateStr,
    //   name: servicePackage.name,
    //   price: servicePackage.price,
    //   services: organPaidServices,
    // };

    // await organServicePackageRepo.create({
    //   values: organServicePackage,
    // });
  });
}
