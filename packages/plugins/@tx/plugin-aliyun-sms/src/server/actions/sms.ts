import { Plugin } from '@nocobase/server';
import { Context } from '@nocobase/actions';
import { isNil } from 'lodash';
import { IAliyunSmsSetting, INormalSmsProps } from '../../interfaces';

import { ALIYUN_SMS_SETTING_RECORD_KEY } from '../consts';
import { SmsCenter } from '../dataCenter';

const INVALID_VERIFIACTION_CODE_MESSAGE = `验证码不正确，请仔细检查或重新发送！`;
const TIMEOUT_VERIFIACTION_CODE_MESSAGE = `验证码已经过期，请重新发送！`;

export const registerAliyunSmsActions = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.resourceManager.define({
    name: 'aliyunSms',
    actions: {
      submitSetting: submitSetting(),
      setting: getSetting(),
      sendSms: sendSms(),
    },
  });
  app.acl.allow('aliyunSms', '*', 'loggedIn');
};

const getSetting = () => {
  return async (ctx: Context, next: () => any) => {
    const aliyunSmsSettingRepo = ctx.db.getRepository('aliyunSmsSetting');

    const record = await aliyunSmsSettingRepo.findByTargetKey(ALIYUN_SMS_SETTING_RECORD_KEY);
    ctx.withoutDataWrapping = true;
    ctx.body = record;
  };
};

const submitSetting = () => {
  return async (ctx: Context, next: () => any) => {
    const formData = ctx.request.body as IAliyunSmsSetting;

    const aliyunSmsSettingRepo = ctx.db.getRepository('aliyunSmsSetting');

    const record = await aliyunSmsSettingRepo.findByTargetKey(ALIYUN_SMS_SETTING_RECORD_KEY);
    if (isNil(record)) {
      await aliyunSmsSettingRepo.create({
        values: {
          ...formData,
          key: ALIYUN_SMS_SETTING_RECORD_KEY,
        },
      });
    } else {
      await aliyunSmsSettingRepo.update({
        filterByTk: ALIYUN_SMS_SETTING_RECORD_KEY,
        values: formData,
      });
    }
    await SmsCenter.refreshClient();
    await next();
  };
};

const sendSms = () => {
  return async (ctx: Context, next: () => any) => {
    const formData = ctx.request.body as INormalSmsProps;
    // const aliyunSmsSettingRepo = ctx.db.getRepository('aliyunSmsSetting');
    // const record = await aliyunSmsSettingRepo.findByTargetKey(ALIYUN_SMS_SETTING_RECORD_KEY);
    // if (isNil(record)) {
    //   throw new Error(`阿里云短信服务没有配置,请先配置基础信息`);
    // }
    console.log(`---------[ sendSms ]---------`);

    await SmsCenter.sendSms(formData);
  };
};
