import { Context } from '@nocobase/actions';
import { isNil } from 'lodash';
import dayjs from 'dayjs';
import { Plugin } from '@nocobase/server';
import { ALIPAY_SETTING_RECORD_KEY, PURCHASEDURATION_MONTHS_MAPPING } from '../commons';
import { AlipayCenter } from '../dataCenter';
import { IPaymentCost, IServicePackage, IServicePackagePurchaseOrder } from '../../interfaces';
import { getUserInfo } from '../middlewares';

export const registerPaymentActions = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.resourceManager.define({
    name: 'payment',
    actions: {
      submitSetting: submitSetting(),
      makeDevicePayment: makeDevicePayment(),
      devicePaymentFeedback: devicePaymentFeedback(),
      makePackagePayment: makePackagePayment(),
      packagePaymentFeedback,
    },
  });
  app.acl.allow('payment', '*', 'loggedIn');
  app.acl.allow('payment', 'makeDevicePayment', 'public');
  app.acl.allow('payment', 'devicePaymentFeedback', 'public');
  app.acl.allow('payment', 'packagePaymentFeedback', 'public');
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

const makePackagePayment = () => {
  return async (ctx: Context, next: () => any) => {
    const formData = ctx.request.body as IServicePackagePurchaseOrder;
    const { servicePackageId } = formData;

    const { organizationId } = getUserInfo({
      ctx,
    });
    const servicePackageRepo = ctx.db.getRepository('servicePackage');
    const servicePackage: IServicePackage = await servicePackageRepo.findByTargetKey(servicePackageId);
    if (isNil(servicePackage)) {
      throw new Error(`套餐信息已过期,请刷新或者尝试购买其他套餐`);
    }

    const cost: IPaymentCost = {
      name: `${servicePackage.name}`,
      amount: servicePackage.price,
      extra: formData,
    };

    console.log(`---------[ makePackagePayment ]---------`);
    // console.log(`servicePackage:`, servicePackage);
    console.log(`organizationId:`, organizationId);

    const returnUrl = `/api/payment:packagePaymentFeedback`;

    await AlipayCenter.generatePayment({
      ctx,
      organizationId,
      returnUrl,
      cost,
    });
  };
};

const packagePaymentFeedback = AlipayCenter.completePayment(async ({ ctx, next, cost }) => {
  console.log(`---------[ packagePaymentFeedback ]---------`);
  const { outTradeNo } = (ctx.query as any) || {};
  const { organizationId, extra } = cost;
  const order: IServicePackagePurchaseOrder = extra as any;
  const organServicePackageRepo = ctx.db.getRepository('organizationServicePackage');
  const servicePackageRepo = ctx.db.getRepository('servicePackage');
  const expiredMonths = PURCHASEDURATION_MONTHS_MAPPING[order.purchaseDuration];
  const purchasingDate = dayjs();
  const expirationDate = purchasingDate.add(expiredMonths, 'M');

  const servicePackage: IServicePackage = await servicePackageRepo.findOne({
    filterByTk: order.servicePackageId,
    appends: ['services'],
  });

  const paidServices = servicePackage.services || [];

  console.log(`servicePackage:`, servicePackage);
  console.log(`paidServices:`, paidServices);

  const organPaidServices = paidServices.map((service) => {
    return {
      organizationId,
      serviceId: service.id,
      name: service.name,
      price: service.price,
      purchasingDate,
      expirationDate,
    };
  });

  const organServicePackage = {
    organizationId,
    packageId: order.servicePackageId,
    purchasingDate,
    expirationDate,
    name: servicePackage.name,
    price: servicePackage.price,
    services: organPaidServices,
  };

  const record = await organServicePackageRepo.create({
    values: organServicePackage,
  });

  ctx.withoutDataWrapping = true;
  ctx.body = record;
});
