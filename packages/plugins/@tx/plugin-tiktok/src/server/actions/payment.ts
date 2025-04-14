import { Context } from '@nocobase/actions';
import { isNil, omit } from 'lodash';
import dayjs from 'dayjs';
import { Plugin } from '@nocobase/server';
import Database from '@nocobase/database';
import { ALIPAY_SETTING_RECORD_KEY, PURCHASEDURATION_MONTHS_MAPPING } from '../commons';
import { AlipayCenter } from '../dataCenter';
import {
  IOrganizationServicePackage,
  IPaymentCost,
  IServicePackage,
  IServicePackagePurchaseOrder,
} from '../../interfaces';

enum PackageUidType {
  _矩阵 = '矩阵',
  _选品 = '选品',
  _旗舰版 = '旗舰版',
}

const PackagePriceCalculator = (() => {
  const packageBasePriceMap = new Map<PackageUidType, { monthlyPrice: number; annualPrice: number }>();
  const packageIdToUidTypeMap = new Map<string, string>();
  const monthlyCalculator = (props: { packageUidType: PackageUidType; duration: number; subAccount: number }) => {
    const { packageUidType, duration, subAccount } = props;
    let price = 0;

    if (packageBasePriceMap.has(packageUidType)) {
      const info = packageBasePriceMap.get(packageUidType);

      const _选品不规律的部分 = {
        '0': info.monthlyPrice,
        '1': info.monthlyPrice,
        '2': 360,
        '3': 484,
        '4': 528,
        '5': 636,
        '6': 639,
        '7': 730,
      };
      const _选品规律的部分_每加一个子账号增加的金额 = 91;
      const _旗舰版套餐不规律的部分 = {
        '0': info.monthlyPrice,
        '1': info.monthlyPrice,
        '2': 669,
        '3': 801,
        '4': 860,
        '5': 977,
        '6': 998,
        '7': 1100,
        '8': 1202,
      };
      const _旗舰版套餐不规律的部分_每加一个子账号增加的金额 = 150;
      price = info.monthlyPrice;
      let addSubAccountPrice = 0;
      switch (packageUidType) {
        case PackageUidType._矩阵:
          // 矩阵每个子账号是20块钱,是规律的
          addSubAccountPrice = subAccount * 20;
          break;
        case PackageUidType._选品:
          // 选品的子账号前7位价格是不规律的
          if (subAccount < 8) {
            price = _选品不规律的部分[`${subAccount}`];
          } else {
            price = _选品不规律的部分['7'] + (subAccount - 7) * _选品规律的部分_每加一个子账号增加的金额;
          }
          break;
        case PackageUidType._旗舰版:
          // 旗舰版套餐的子账号前9位价格是不规律的
          if (subAccount < 9) {
            price = _旗舰版套餐不规律的部分[`${subAccount}`];
          } else {
            price = _旗舰版套餐不规律的部分['8'] + (subAccount - 8) * _旗舰版套餐不规律的部分_每加一个子账号增加的金额;
          }
          break;
        default:
          addSubAccountPrice = 0;
          price = 0;
          break;
      }
      price += addSubAccountPrice;
    }
    return price * duration;
  };

  const annualCalculator = (props: { packageUidType: PackageUidType; duration: number; subAccount: number }) => {
    const { packageUidType, duration, subAccount } = props;
    let price = 0;

    if (packageBasePriceMap.has(packageUidType)) {
      const info = packageBasePriceMap.get(packageUidType);

      const _矩阵不规律的部分 = {
        '0': info.annualPrice,
        '1': 3739,
        '2': 3978,
        '3': 4216,
        '4': 4455,
        '5': 4694,
        '6': 4933,
      };
      const _矩阵不规律的部分_每加一个子账号增加的金额 = 20;

      const _选品套餐不规律的部分 = {
        '0': info.annualPrice,
        '1': info.annualPrice,
        '2': 3236,
        '3': 4315,
        '4': 4854,
        '5': 5825,
        '6': 5872,
        '7': 6710,
        '8': 6711,
      };
      const _选品套餐不规律的部分_每加一个子账号增加的金额 = 70;

      const _旗舰版套餐不规律的部分 = {
        '0': info.annualPrice,
        '1': info.annualPrice,
        '2': 5627,
        '3': 6613,
        '4': 7821,
        '5': 8533,
        '6': 9642,
        '7': 9904,
        '8': 10892,
      };
      const _旗舰版套餐不规律的部分_每加一个子账号增加的金额 = 113;

      price = info.annualPrice;
      const addSubAccountPrice = 0;
      switch (packageUidType) {
        case PackageUidType._矩阵:
          // 矩阵的子账号前7位价格是不规律的
          if (subAccount < 7) {
            price = _矩阵不规律的部分[`${subAccount}`];
          } else {
            price = info.annualPrice + subAccount * _矩阵不规律的部分_每加一个子账号增加的金额 * 12;
          }
          break;
        case PackageUidType._选品:
          // 选品的子账号前9位价格是不规律的
          if (subAccount < 9) {
            price = _选品套餐不规律的部分[`${subAccount}`];
          } else {
            price = info.annualPrice + subAccount * _选品套餐不规律的部分_每加一个子账号增加的金额 * 12;
          }
          break;
        case PackageUidType._旗舰版:
          // 旗舰版的子账号前9位价格是不规律的
          if (subAccount < 9) {
            price = _旗舰版套餐不规律的部分[`${subAccount}`];
          } else {
            price = info.annualPrice + subAccount * _旗舰版套餐不规律的部分_每加一个子账号增加的金额 * 12;
          }
          break;
        default:
          break;
      }
      price += addSubAccountPrice;
    }
    return price * duration;
  };

  const calculatePrice = (props: {
    packageId: any;
    duration: number;
    durationUnit: 'monthly' | 'annual';
    subAccount: number;
  }) => {
    const { packageId, durationUnit } = props;
    const packageUidType: any = packageIdToUidTypeMap.get(`${packageId}`);
    switch (durationUnit) {
      case 'monthly':
        return monthlyCalculator({ ...props, packageUidType });
      case 'annual':
        return annualCalculator({ ...props, packageUidType });
      default:
        break;
    }
  };

  // const startup = (initData: Record<string, { monthlyPrice: number; annualPrice: number }>) => {
  //   const uidTypes = Object.keys(initData);
  //   packageBasePriceMap.clear();
  //   for (const uidType of uidTypes) {
  //     packageBasePriceMap.set(uidType as PackageUidType, initData[uidType]);
  //   }
  //   console.log(`packageBasePriceMap:`, packageBasePriceMap);
  // };

  const startup = async (props: { db: Database }) => {
    const { db } = props;
    const servicePackageRepo = db.getRepository('servicePackage');
    const packages = await servicePackageRepo.find({
      filter: {
        $and: [{ enable: { $isTruly: true } }],
      },
    });

    packageBasePriceMap.clear();
    packageIdToUidTypeMap.clear();
    for (const pck of packages) {
      const data = pck.dataValues;
      const uidType = data.packageUidType;
      packageIdToUidTypeMap.set(`${data.id}`, uidType);
      packageBasePriceMap.set(uidType, {
        monthlyPrice: data.price,
        annualPrice: data.annualPrice,
      });
    }
  };

  const exportMonthlyPriceList = () => {
    const uidTypes = Object.keys(PackageUidType);
    const listSubAccountMax = 10;
    const listDuration = 1;
    let price = 0;

    console.log(`---------[ 输出套餐月费用 ]---------`);
    for (const uidName of uidTypes) {
      const uidType = PackageUidType[uidName];
      for (let subAcc = 0; subAcc <= listSubAccountMax; subAcc++) {
        price = monthlyCalculator({
          packageUidType: uidType,
          duration: listDuration,
          subAccount: subAcc,
        });
        const message = `${uidType}套餐,子账号个数:${subAcc},时长为${listDuration}月,最终价格为:${price}`;
        console.log(message);
      }
      console.log(`------------------`);
    }
  };

  const exportAnnualPriceList = () => {
    const uidTypes = Object.keys(PackageUidType);
    const listSubAccountMax = 10;
    const listDuration = 1;
    let price = 0;

    console.log(`---------[ 输出套餐年费用 ]---------`);
    for (const uidName of uidTypes) {
      const uidType = PackageUidType[uidName];
      for (let subAcc = 0; subAcc <= listSubAccountMax; subAcc++) {
        price = annualCalculator({
          packageUidType: uidType,
          duration: listDuration,
          subAccount: subAcc,
        });
        const message = `${uidType}套餐,子账号个数:${subAcc},时长为${listDuration}年,最终价格为:${price}`;
        console.log(message);
      }
      console.log(`------------------`);
    }
  };

  return {
    startup,
    calculatePrice,
    exportMonthlyPriceList,
    exportAnnualPriceList,
  };
})();

// // 测试部分
// PackagePriceCalculator.startup({
//   [PackageUidType._矩阵]: {
//     monthlyPrice: 350,
//     annualPrice: 3500,
//   },
//   [PackageUidType._选品]: {
//     monthlyPrice: 288,
//     annualPrice: 2400,
//   },
//   [PackageUidType._旗舰版]: {
//     monthlyPrice: 585,
//     annualPrice: 4572,
//   },
// });

// PackagePriceCalculator.exportMonthlyPriceList();
// PackagePriceCalculator.exportAnnualPriceList();

export const registerPaymentActions = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.resourceManager.define({
    name: 'payment',
    actions: {
      submitSetting: submitSetting(),
      makeDevicePayment: makeDevicePayment(),
      devicePaymentFeedback: devicePaymentFeedback(),
      caculatePackagePrice: caculatePackagePrice(),
      makePackagePayment: makePackagePayment(),
      packagePaymentFeedback,
      servciePaymentFeedback,
    },
  });
  app.acl.allow('payment', '*', 'loggedIn');
  app.acl.allow('payment', 'makeDevicePayment', 'public');
  app.acl.allow('payment', 'makePackagePayment', 'public');
  app.acl.allow('payment', 'devicePaymentFeedback', 'public');
  app.acl.allow('payment', 'packagePaymentFeedback', 'public');
  app.acl.allow('payment', 'servciePaymentFeedback', 'public');
  app.acl.allow('payment', 'caculatePackagePrice', 'public');
};

const submitSetting = () => {
  return async (ctx: Context, next: () => any) => {
    const formData = (ctx.request.body as any) || {};

    const configSettingRepo = ctx.db.getRepository('configSetting');
    const record = await configSettingRepo.findByTargetKey(ALIPAY_SETTING_RECORD_KEY);
    if (isNil(record)) {
      await configSettingRepo.create({
        values: {
          key: ALIPAY_SETTING_RECORD_KEY,
          value: formData,
        },
      });
    } else {
      await configSettingRepo.update({
        values: {
          key: ALIPAY_SETTING_RECORD_KEY,
          value: formData,
        },
        filterByTk: ALIPAY_SETTING_RECORD_KEY,
      });
    }
    ctx.withoutDataWrapping = true;
    ctx.body = {};
    next();
  };
};

const makeDevicePayment = () => {
  return async (ctx: Context, next: () => any) => {
    const { paymentType, paymentKey } = (ctx.query as any) || {};
    // // 这个留着,可以拿来检测sdk key对不对
    // const result = await alipaySdk.getInstance().curl('POST', '/v3/alipay/user/deloauth/detail/query', {
    //   body: {
    //     date: '20230102',
    //     offset: 20,
    //     limit: 1,
    //   },
    // });

    const deviceOrderRepo = ctx.db.getRepository('tk_device_order');
    const order = await deviceOrderRepo.findOne({
      filter: {
        paymentKey,
      },
      appends: ['region'],
    });
    console.log(`---------[ order ]---------`);

    const { deviceName, region, organizationId } = order;
    const { name: regionName } = region;
    // 付款订单名称
    const name = `${regionName}/${deviceName}设备订单`;

    // origin=http[s]://域名:端口
    // eslint-disable-next-line prefer-const
    let returnUrl = `/api/payment:devicePaymentFeedback?paymentKey=${paymentKey}&subject=${encodeURIComponent(name)}`;

    // //模拟测试
    // return_url += `&out_trade_no=${out_trade_no}`;
    // ctx.redirect(return_url);
    // return;

    await AlipayCenter.generatePayment({
      ctx,
      organizationId,
      returnUrl,
      cost: {
        name,
        amount: 0.1,
      },
    });
  };
};

const devicePaymentFeedback = () => {
  return async (ctx: Context, next: () => any) => {
    const { paymentKey, out_trade_no: outTradeNo, subject, total_amount, out_trade_no } = (ctx.query as any) || {};
    console.log(`---------[ paymentFeedback ]---------`);
    console.log(`ctx.query :`, ctx.query);
    const deviceOrderRepo = ctx.db.getRepository('tk_device_order');

    const order = await deviceOrderRepo.findOne({
      filter: {
        paymentKey,
      },
      appends: ['region'],
    });
    if (isNil(order)) return;

    const deviceRepo = ctx.db.getRepository('tk_package_proxy_node');

    await deviceOrderRepo.update({
      values: {
        outTradeNo,
        status: 'paid',
        paidCallbackParams: ctx.query,
        // total_amount:
      },
      filterByTk: order.id,
    });
    const { deviceName, paymentType, regionId, organizationId, region, purchaseDuration } = order;
    const { timezone } = region;

    const expiredMonths = PURCHASEDURATION_MONTHS_MAPPING[purchaseDuration];

    const currentTime = dayjs();
    const expiredDate = currentTime.add(expiredMonths, 'M');

    const device = {
      name: deviceName,
      status: 'pending',
      regionId,
      organizationId,
      timezone,
      expiredDate,
    };

    const detailUrl = `/admin/66qfu3lmf5n/popups/bz5vyzfz189/filterbytk/${order.id}`;
    await deviceRepo.create({
      values: device,
    });

    // await AlipayCenter.completePayment(out_trade_no, {
    //   detailUrl,
    // });

    // ctx.body = {
    //   order,
    //   region,
    // };
    // return;
    ctx.set({
      'Content-Type': 'text/html; charset=UTF-8',
    });
    ctx.withoutDataWrapping = true;
    ctx.body = `
    <html>
      <head>
      <script>
      window.close();
      </script>
      </head>
    </html>`;
  };
};

const caculatePackagePrice = () => {
  return async (ctx: Context, next: () => any) => {
    // const { packageId } = ctx.query as any;

    await PackagePriceCalculator.startup({ db: ctx.db });

    const price = PackagePriceCalculator.calculatePrice({ ...ctx.query } as any);

    ctx.withoutDataWrapping = true;

    ctx.body = {
      price,
    };
  };
};

const makePackagePayment = () => {
  return async (ctx: Context, next: () => any) => {
    const formData = ctx.query as unknown as IServicePackagePurchaseOrder;
    const { packageId, packageType, organizationId } = formData;
    if (isNil(organizationId)) {
      throw new Error(`没有付款信息需要组织信息参数,请传递organizationId`);
    }

    const isPackagePayment = packageType === 'package';

    let record: { id: number; name: string; price: number; annualPrice: number };
    let price = 0;
    if (isPackagePayment) {
      const servicePackageRepo = ctx.db.getRepository('servicePackage');
      record = await servicePackageRepo.findOne({
        filterByTk: packageId,
      });
      await PackagePriceCalculator.startup({ db: ctx.db });
      price = PackagePriceCalculator.calculatePrice(formData as any);
    } else {
      // const paidServiceRepo = ctx.db.getRepository('paidService');
      // record = await paidServiceRepo.findByTargetKey(packageId);
    }
    // console.log(`---------[ makePackagePayment ]---------`);
    // console.log(`formData:`, formData);
    // console.log(`record:`, record);

    // return;

    if (isNil(record)) {
      throw new Error(`套餐信息已过期,请刷新或者尝试购买其他套餐`);
    }

    // price = 0.1;

    const cost: IPaymentCost = {
      name: `${record.name}`,
      amount: price,
      paymentType: 'alipay',
      extra: formData,
    };

    const returnUrl = `/api/payment:${isPackagePayment ? 'packagePaymentFeedback' : 'servciePaymentFeedback'}`;

    await AlipayCenter.generatePayment({
      ctx,
      organizationId,
      returnUrl,
      cost,
    });
  };
};

const transferDateTime = (datetime: any) => {
  if (isNil(datetime)) return null;
  const dt = dayjs.isDayjs(datetime) ? datetime : dayjs(datetime);
  return dt.format('YYYY-MM-DD HH:mm:ss');
};

const packagePaymentFeedback = AlipayCenter.completePayment(async ({ ctx, next, cost }) => {
  // const { outTradeNo } = (ctx.query as any) || {};
  const { organizationId, extra } = cost;
  const order: IServicePackagePurchaseOrder = extra as any;
  const organServicePackageRepo = ctx.db.getRepository('organizationServicePackage');
  const organizationPaidServiceRepo = ctx.db.getRepository('organizationPaidService');
  const servicePackageRepo = ctx.db.getRepository('servicePackage');
  const organizationRep = ctx.db.getRepository('organization');
  const { purchaseMonths, expirationDate: _expirationDate } = order;
  const currentTime = dayjs();
  const currentTimeStr = transferDateTime(currentTime);
  const expirationDate = isNil(_expirationDate) ? currentTime.add(purchaseMonths, 'M') : _expirationDate;
  const expirationDateStr = isNil(_expirationDate) ? transferDateTime(expirationDate) : _expirationDate;
  const servicePackage: IServicePackage = await servicePackageRepo.findOne({
    filterByTk: order.packageId,
    // appends: ['services'],
  });

  const returnCloseWin = () => {
    ctx.set({
      'Content-Type': 'text/html; charset=UTF-8',
    });
    ctx.withoutDataWrapping = true;
    ctx.body = `
    <html>
      <head>
      <script>
      window.close();
      </script>
      </head>
    </html>`;
  };

  const subAccount = Number(order.subAccount) + 1;
  const paidServices = servicePackage.services || [];

  const organOldServicePackage = await organServicePackageRepo.findOne({
    filter: {
      organizationId,
      packageId: order.packageId,
    },
    // appends: ['services'],
  });

  if (!isNil(organOldServicePackage)) {
    // 判断一下当前的购买套餐情况,如果没过期,那么
    const rc: IOrganizationServicePackage = organOldServicePackage.dataValues;

    // 如果是免费的套餐，不能重复领取
    if (!servicePackage.needPurchase) {
      throw new Error(`用户已经领过该套餐，不能重复领取`);
    }

    const hasExpirated = currentTime.isAfter(dayjs(rc.expirationDate));
    // 如果套餐已经过期,购买时间更新为当前时间
    // let services = rc.services || [];
    const updateValue: IOrganizationServicePackage = {
      ...omit(rc, ['services']),
    };

    // 这里有个注意点，如果是降低了子账号配置，那么清空组织的人员关于养号和选品产品的角色信息
    if (rc.subAccount > order.subAccount) {
      const userRepo = ctx.db.getRepository('users');
      const organUsers: any[] = await userRepo.find({
        filter: {
          organizationId,
        },
        appends: ['roles'],
      });

      await Promise.all(
        organUsers.map((u) => {
          const user = u.dataValues;
          const roles: any[] = user.roles;
          const filterRoles = roles.filter(
            (r) => r.classification !== 'tiktok' || r.name === 'organizationAdmin' || r.name === 'organizationUser',
          );

          return userRepo.update({
            filterByTk: user.id,
            values: {
              roles: filterRoles.map((f) => f.name),
            },
          });
        }),
      );
    }

    if (hasExpirated) {
      updateValue.purchasingDate = currentTimeStr;
      updateValue.expirationDate = expirationDateStr;
      updateValue.subAccount = subAccount;
      // services = services.map((s: any) => {
      //   const it = omit(s.dataValues, ['organServicePackageToOrganPaidServiceMapping']);
      //   return {
      //     ...it,
      //     purchasingDate: currentTimeStr,
      //     expirationDate: expirationDateStr,
      //   };
      // });
    } else {
      const _expirationDate = transferDateTime(dayjs(rc.expirationDate).add(purchaseMonths, 'M'));
      updateValue.expirationDate = _expirationDate;
      updateValue.subAccount = subAccount;
      // services = services.map((s: any) => {
      //   const it = omit(s.dataValues, ['organServicePackageToOrganPaidServiceMapping']);
      //   return {
      //     ...it,
      //     expirationDate: _expirationDate,
      //   };
      // });
    }

    await organServicePackageRepo.update({
      values: updateValue,
      filterByTk: updateValue.id,
    });

    // for (const sr of services) {
    //   await organizationPaidServiceRepo.update({
    //     values: sr,
    //     filterByTk: sr.id,
    //   });
    // }

    return returnCloseWin();
  }

  // 如果当前套餐是试用版本，那么把当前的管理员设置为运营和开发的角色
  if (servicePackage.packageUidType === '试用') {
    const organ = await organizationRep.findByTargetKey(organizationId);
    const organManagerId = organ.managerId;
    const userRepo = ctx.db.getRepository('users');
    const organUser = await userRepo.findOne({
      filter: {
        id: organManagerId,
      },
      appends: ['roles'],
    });
    const roles = (organUser.roles as any[]).map((r) => ({ name: r.name }));
    roles.push({ name: 'operationSpecialist' }, { name: 'productDeveloper' });
    await userRepo.update({
      values: {
        roles,
      },
      filterByTk: organManagerId,
    });
  }
  const organPaidServices = paidServices.map((service) => {
    return {
      organizationId,
      serviceId: service.id,
      name: service.name,
      price: service.price,
      purchasingDate: currentTimeStr,
      expirationDate: expirationDateStr,
    };
  });

  const organServicePackage = {
    organizationId,
    packageId: order.packageId,
    subAccount,
    purchasingDate: currentTimeStr,
    expirationDate: expirationDateStr,
    name: servicePackage.name,
    price: servicePackage.price,
    services: organPaidServices,
  };

  const record = await organServicePackageRepo.create({
    values: organServicePackage,
  });

  return returnCloseWin();
});

const servciePaymentFeedback = AlipayCenter.completePayment(async ({ ctx, next, cost }) => {
  console.log(`---------[ packagePaymentFeedback ]---------`);
  const { outTradeNo } = (ctx.query as any) || {};
  const { organizationId, extra } = cost;
  const order: IServicePackagePurchaseOrder = extra as any;
  const organServiceRepo = ctx.db.getRepository('organizationPaidService');
  const paidServiceRepo = ctx.db.getRepository('paidService');
  const { purchaseMonths, packageId } = order;
  const purchasingDate = dayjs();
  const expirationDate = purchasingDate.add(purchaseMonths, 'M');

  const paidService = await paidServiceRepo.findByTargetKey(packageId);

  const returnCloseWin = () => {
    ctx.set({
      'Content-Type': 'text/html; charset=UTF-8',
    });
    ctx.withoutDataWrapping = true;
    ctx.body = `
    <html>
      <head>
      <script>
      window.close();
      </script>
      </head>
    </html>`;
  };

  const organOldPaidService = await organServiceRepo.findOne({
    filter: {
      organizationId,
      serviceId: order.packageId,
    },
  });

  if (!isNil(organOldPaidService)) {
    //
    return returnCloseWin();
  }

  const organPaidService = {
    organizationId,
    serviceId: order.packageId,
    purchasingDate: purchasingDate.format('YYYY-MM-DD HH:mm:ss'),
    expirationDate: expirationDate.format('YYYY-MM-DD HH:mm:ss'),
    name: paidService.name,
    price: paidService.price,
  };

  console.log(`organPaidService:`, organPaidService);
  const record = await organServiceRepo.create({
    values: organPaidService,
  });

  return returnCloseWin();
});
