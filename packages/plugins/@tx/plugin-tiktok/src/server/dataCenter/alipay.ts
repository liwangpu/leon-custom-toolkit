import { Plugin } from '@nocobase/server';
import { AlipaySdk } from 'alipay-sdk';
import { uid } from '@nocobase/utils';
import { ALIPAY_SETTING_RECORD_KEY } from '../commons';
import { IAlipaySetting, IPaymentCost } from '../../interfaces';
import { Context } from '@nocobase/actions';
import { isFunction, isNil } from 'lodash';

export const AlipayCenter = (() => {
  let _instance: AlipaySdk;
  let plugin: Plugin;
  let lastSettingStr: string;

  const generateOutTradeNo = () => {
    return `TIKPULSE_${uid(18).toUpperCase()}`;
  };

  const refreshInstance = async () => {
    const { db } = plugin;
    const configSettingRepo = db.getRepository('configSetting');
    const record = await configSettingRepo.findByTargetKey(ALIPAY_SETTING_RECORD_KEY);
    if (isNil(record) || isNil(record.value)) {
      throw new Error(`支付宝收款配置没有设置,请先设置好后再使用`);
    }
    const setting: IAlipaySetting = record.value;
    const settingStr = JSON.stringify(setting);
    if (_instance && settingStr === lastSettingStr) {
      return;
    }
    lastSettingStr = settingStr;
    _instance = new AlipaySdk({
      ...(setting as any),
    });
    // console.log(`---------[ alipay sdk ready ]---------`);
  };

  const SDKReady = async (cb: (ins: AlipaySdk) => any) => {
    if (!isFunction(cb)) return;
    if (isNil(_instance)) {
      await refreshInstance();
    }
    if (!isNil(_instance)) {
      return cb(_instance);
    }
  };

  const startup = async (props: { plugin: Plugin }) => {
    plugin = props.plugin;
  };

  /**
   * 跳转到支付宝去付款(该方法会接管ctx)
   * @param props
   */
  const generatePayment = async (props: {
    ctx: Context;
    organizationId: number;
    cost: IPaymentCost;
    returnUrl: string;
  }) => {
    const { ctx, organizationId, cost, returnUrl } = props;
    const { name, amount } = cost;
    return SDKReady(async (instance) => {
      const out_trade_no = generateOutTradeNo();
      let return_url = returnUrl;
      // 做一个简便处理
      if (returnUrl) {
        const gap = return_url.includes('?') ? '' : '?';
        return_url += `${gap}&outTradeNo=${out_trade_no}`;
        if (returnUrl[0] === '/') {
          return_url = `${ctx.URL.origin}${return_url}`;
        }
      }

      const createCostRecord = async () => {
        if (isNil(cost)) return;
        const costsRepo = ctx.db.getRepository('costs');

        await costsRepo.create({
          values: {
            ...cost,
            status: 'obligation',
            organizationId,
            outTradeNo: out_trade_no,
          },
        });
      };

      // console.log(`---------[ generatePayment ]---------`);
      // console.log(`cost:`, cost);

      await createCostRecord();

      // // 模拟测试跳转
      // return ctx.redirect(return_url);

      // 金额为0,是不需要付款的，所以直接走下个流程
      if (cost.amount === 0) {
        return ctx.redirect(return_url);
      }

      // 统一收单下单并支付页面接口 https://opendocs.alipay.com/open/59da99d0_alipay.trade.page.pay?pathHash=e26b497f&scene=22
      const result = await instance.pageExec('alipay.trade.page.pay', {
        bizContent: {
          product_code: 'FAST_INSTANT_TRADE_PAY',
          out_trade_no,
          total_amount: `${amount}`,
          subject: name,
        },
        return_url,
      });

      ctx.set({
        'Content-Type': 'text/html; charset=UTF-8',
      });
      ctx.withoutDataWrapping = true;
      ctx.body = result;
    });
  };

  const completePayment = (cb: (props: { ctx: Context; next: () => any; cost: IPaymentCost }) => any) => {
    return async (ctx: Context, next: () => any) => {
      const { outTradeNo } = (ctx.query as any) || {};
      // console.log(`---------[ completePayment ]---------`);
      // console.log(`ctx.query :`, ctx.query);
      if (isNil(outTradeNo)) return;
      const { db } = plugin;
      const costsRepo = db.getRepository('costs');
      const cost: IPaymentCost = await costsRepo.findByTargetKey(outTradeNo);
      if (isNil(cost)) return;
      // 该请求已经处理
      if (cost.feedback) return;

      // 价格为0的单子，不记录费用信息
      if (cost.amount === 0) {
        await costsRepo.destroy(outTradeNo);
      } else {
        await costsRepo.update({
          filterByTk: outTradeNo,
          values: {
            feedback: true,
            status: 'paid',
            feedbackParams: ctx.query,
          },
        });
      }

      return cb({ ctx, next, cost });
    };
  };

  return {
    startup,
    refreshInstance,
    generatePayment,
    completePayment,
  };
})();
