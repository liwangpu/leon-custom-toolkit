import { Context } from '@nocobase/actions';
import { AlipaySdk } from 'alipay-sdk';
import { uid } from '@nocobase/utils';
import { isNil } from 'lodash';
import dayjs from 'dayjs';

const env = process.env;

const alipaySdk = (() => {
  let instance: AlipaySdk;

  const initialize = () => {
    instance = new AlipaySdk({
      // // 设置应用 ID
      // appId: `${env['ALIPAY_RECEIVE_PAYMENT_APPID']}`,
      // // 设置应用私钥
      // privateKey: `${env['ALIPAY_RECEIVE_PAYMENT_PRIVATEKEY']}`,
      // // 设置支付宝公钥
      // alipayPublicKey: `${env['ALIPAY_RECEIVE_PAYMENT_PRIVATEKEY']}`,

      // 设置应用 ID
      appId: `2021005119647342`,
      // 设置应用私钥
      privateKey: `MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDFxo/LcxWTxQ6sylrPoJWFhb4p3RMyCS2hSQQ/hWsx04pGYm1k/lQDb0GicWBks3lnELBxRW7N6ESQzw8t0nZ43etEpx2m7wcDoq9pnOrG5R3AK5rXQl6dZ3Wqwo56Auab/Mr1V6N6KRd68PN9EPfiy0eI83Pzd+vslW+u2AiGwXcyfghnE0R6Ocwug01ytNx0hpfi8HFfxQb5S7foErpCGG2a83EMhhrQRueoFGCNP1oc8+5T5thtVYLXNjsjd968ADHbV+bS+7g4/A93GNCj/wo0WC0PXwhHuS7KTaBPHae9yHGvsAltAb+DwOPYLZWIn0j72Iy9F/O43VrDGR+3AgMBAAECggEBALFZLPizalXoDxDDJEurJGlnVO8VX3Eu6cwHPdf4O/eiSgxzlsVJiuzJh4GzSU0D44mYXaA1MvdRoKp6ApKEd9hKp/4YHW7kSNXpvIJoQ9+29MauU1tUGKPtcoZ9kGW41DJsrVL0E5Qn5PZJuw4beS3WO3+DUCazEsxD9LJE5uBuZ2+vAil2tOasPKNZoWh+h5dAu56BuB97dakNfzZgD+0G71LdXzuvKIxlTevUJ56rGEC0QbXr68wogINwEH6qEdd2ZvY9vscbkfgbGTS3ZPOXm0u+eptodOSzMleqZwPgJloXjmc/PipFrWgH3Qz/Xbb5yTCam8fq5EQF+vsF4QECgYEA8bHSrWWROhmoWnf+Y+2o/rlDgZXs2J9nMbD8MqODwVmmlPMusAzJfa+oHZTT/pRFB0IoShR5R89PHNVB4e51KaiWLuKAOAyAqT7LOOaLohnOJlJDnYx1BAZe1L6MqFGla/W7kRhZaJ7iqWzx/TjkwxnrXOOKjbJEhDMZ5gOrci8CgYEA0XtGSSBYcCW8/ar94wdP0jTHXGuNo556US98BX6wiggOwH9J3hfb9Zfh7t7mP5lpCxWQ4DaWMPTrXsbZJjGees1DIInc9Tf5LAZ4aX0IkxDcszgvKFDJvsdqj4bI2a3X9Cg+DASigWZTHfmU9bm3LTiVrDTdPbCJyBz2jIKl8PkCgYEArcCSnkkoEEaluvQMk7YlCYoSN7SaYlimDRkZFSZr77INiYMRi0qGB68iArIdfSUGQuOSpz70uWUVkLrW9B9DZ0FlRita1fBXBlS4MB29QDmg8/er2DVDYjNaNUMPR2n6rBQqVXLVw9qFRBuoE8y02HVnuI1z682+Z/N8qNj2hc0CgYEAiyoMLXRxjD9l6Fd6RyKKYqlxb/J7rCESPXEAQV5CxdBIjJWDayoKlIOMMvadm868vAJdtrZM3MU4wEP16qu4DvjiCXHM+pNu01KRF/NaiOkA1YcTvQK+pCEyp5rxP7t/5dH+Nlm146UovpcZ4Iy6Ji6bMEYGXH81aV3kZMA+oXECgYA1dYVdwkXNOeXniqQb+Fkj7bc1g672zOil3+kmJZM6BgaQbywMrrT5viEIXkpp1k+l7rtrljnBVVoVbRcLIJE8U29h8oGfZ6hn/CjPoLHFDjlpGDp2ahiiBxZAmkrACksk1dJ/+znjMzByKMWewTSjdWYJ7q4X6D+96SD8IcVWMQ==`,
      // 设置支付宝公钥
      alipayPublicKey: `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgDG7y+/iy51r6ia0mqpc79DAahqp3uI1VwyBdQX2WXELClJQCX9PK6yXB9fogm51/kBjX+AZ+0VvzE/SqCNMkbqRNIGbPIR399Lp8ImCkW/7IMPBdKBfG44HVOsZv8/x4fn9ehMlsBTajNeW3TecQLGOIxm9sZlwpokY/m4aQFnEl3G9oMUCg97Z/qDmN/mTAkv++U4rzmvPKf7v5EznqV58ODHcHW91jMm0Zr5+mJjzGshoR3MaETDje1J9NFHo+f1Ygf2hGaiacozLReeWkQxqx/asCnK9hcfRQnex1DxmryNiBXDTmCUYgSo2dYOhIxc2k4mhktm14z2sFw9FkQIDAQAB`,
      // 密钥类型，请与生成的密钥格式保持一致，参考平台配置一节
      // keyType: 'PKCS1',
      // 设置网关地址，默认是 https://openapi.alipay.com
      // endpoint: 'https://openapi.alipay.com',
    });
  };
  return {
    generateOutTradeNo() {
      return `DEVICE_${uid(30).toUpperCase()}`;
    },
    getInstance() {
      if (!instance) {
        initialize();
      }
      return instance;
    },
  };
})();

export function makeDevicePayment() {
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

    const out_trade_no = alipaySdk.generateOutTradeNo();

    const deviceRepo = ctx.db.getRepository('tk_package_proxy_node');
    const deviceOrderRepo = ctx.db.getRepository('tk_device_order');
    const order = await deviceOrderRepo.findOne({
      filter: {
        paymentKey,
      },
      appends: ['region'],
    });
    const { deviceName, region } = order;
    const { name: regionName } = region;
    // 付款订单名称
    const subject = `${regionName}/${deviceName}设备订单`;

    // origin=http[s]://域名:端口
    // eslint-disable-next-line prefer-const
    let return_url = `${
      ctx.URL.origin
    }/api/payment:devicePaymentFeedback?paymentKey=${paymentKey}&subject=${encodeURIComponent(subject)}`;

    // //模拟测试
    // return_url += `&out_trade_no=${out_trade_no}`;
    // ctx.redirect(return_url);
    // return;

    // 统一收单下单并支付页面接口 https://opendocs.alipay.com/open/59da99d0_alipay.trade.page.pay?pathHash=e26b497f&scene=22
    const result = await alipaySdk.getInstance().pageExec('alipay.trade.page.pay', {
      bizContent: {
        product_code: 'FAST_INSTANT_TRADE_PAY',
        out_trade_no,
        total_amount: '0.1',
        subject,
      },
      return_url,
    });

    ctx.set({
      'Content-Type': 'text/html; charset=UTF-8',
    });
    ctx.withoutDataWrapping = true;
    ctx.body = result;
  };
}

export function devicePaymentFeedback() {
  const EXPIRED_MONTHS = {
    one_month: 1,
    three_months: 3,
    six_months: 6,
    one_year: 12,
    two_years: 24,
    three_years: 36,
  };

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
    const costsRepo = ctx.db.getRepository('costs');

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

    const expiredMonths = EXPIRED_MONTHS[purchaseDuration];

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

    const costs = {
      name: subject,
      amount: parseFloat(total_amount),
      paymentType,
      outTradeNo: out_trade_no,
      detail: `/admin/66qfu3lmf5n/popups/bz5vyzfz189/filterbytk/${order.id}`,
    };

    await deviceRepo.create({
      values: device,
    });

    await costsRepo.create({
      values: costs,
    });

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
}
