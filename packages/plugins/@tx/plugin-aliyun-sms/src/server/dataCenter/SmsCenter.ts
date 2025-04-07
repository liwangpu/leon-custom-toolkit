import { isFunction, isNil } from 'lodash';
import axios, { AxiosInstance } from 'axios';
import { Plugin } from '@nocobase/server';
import { ALIYUN_SMS_SETTING_RECORD_KEY } from '../consts';
import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import { customAlphabet } from 'nanoid/non-secure';
import dayjs from 'dayjs';
import type { IAliyunSmsSetting, INormalSmsProps } from '../../interfaces';
import * as $OpenApi from '@alicloud/openapi-client';

const INVALID_VERIFIACTION_CODE_MESSAGE = `验证码不正确，请仔细检查或重新发送！`;
const TIMEOUT_VERIFIACTION_CODE_MESSAGE = `验证码已经过期，请重新发送！`;

export const SmsCenter = (() => {
  let plugin: Plugin;
  let _client: Dysmsapi20170525;
  let lastClientAccessKeyId: string;
  let lastClientAccessKeySecret: string;
  const verificationMap = new Map<string, { verificationCode: string; issueAt: dayjs.Dayjs }>();
  const startup = (props: { plugin: Plugin }) => {
    plugin = props.plugin;
  };

  const refreshClient = async () => {
    const { db } = plugin;
    const aliyunSmsSettingRepo = db.getRepository('aliyunSmsSetting');
    const setting: IAliyunSmsSetting = await aliyunSmsSettingRepo.findByTargetKey(ALIYUN_SMS_SETTING_RECORD_KEY);
    if (!(setting && setting.accessKeyID && setting.accessKeySecret)) {
      throw new Error(`阿里云短信服务没有配置完整,请先配置基础信息`);
    }

    console.log(`---------[ refreshClient ]---------`);

    if (
      !isNil(_client) &&
      lastClientAccessKeyId === setting.accessKeyID &&
      lastClientAccessKeySecret === setting.accessKeySecret
    ) {
      console.log(`ins未改变`);
      return _client;
    }

    console.log(`生成ins`);
    lastClientAccessKeyId = setting.accessKeyID;
    lastClientAccessKeySecret = setting.accessKeySecret;

    const config = new $OpenApi.Config({
      accessKeyId: setting.accessKeyID,
      accessKeySecret: setting.accessKeySecret,
    });
    config.endpoint = `dysmsapi.aliyuncs.com`;
    _client = new Dysmsapi20170525(config);
  };

  const addVerification = (verificationKey: string, verificationCode: string) => {
    verificationMap.set(verificationKey, { verificationCode, issueAt: dayjs() });
    setTimeout(() => verificationMap.delete(verificationKey), 1000 * 60 * 3);
  };

  const send = async (fn: (client: Dysmsapi20170525) => void) => {
    const callFn = async () => {
      if (!isFunction(fn) || isNil(_client)) return;

      return fn(_client);
    };
    if (isNil(_client)) {
      await refreshClient();
    }

    return callFn();
  };

  const sendSms = async (props: INormalSmsProps) => {
    const { phone: phoneNumbers, signName, templateCode, params, verificationKey } = props;
    return send(async (client) => {
      const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
        phoneNumbers,
        signName,
        templateCode,
        templateParam: JSON.stringify(params),
      });
      console.log(`---------[ sendSms ]---------`);
      console.log(`props:`, props);
      if (!isNil(verificationKey) && params && params.code) {
        addVerification(verificationKey, params.code);
      }

      await client.sendSms(sendSmsRequest);
    });
  };

  /**
   * 如果校验通过,该方法不回返回任何东西,只是如果校验失败,那么会返回异常信息(文本)
   * @param props
   */
  const verificationCode = (props: { verificationKey: string; verificationCode: string }): string | null => {
    const { verificationKey, verificationCode } = props;
    const record = verificationMap.get(verificationKey);
    if (!record || record.verificationCode !== verificationCode) {
      return INVALID_VERIFIACTION_CODE_MESSAGE;
    }

    const issueAt = record.issueAt;
    const currentTime = dayjs();

    if (currentTime.diff(issueAt, 'minute') > 3) {
      return TIMEOUT_VERIFIACTION_CODE_MESSAGE;
    }
  };

  return {
    startup,
    refreshClient,
    sendSms,
    verificationCode,
  };
})();
