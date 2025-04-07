import { Plugin } from '@nocobase/server';
import { registerActions } from './actions';
import { SmsCenter } from './dataCenter';
import { Transactionable } from '@nocobase/database';
import { INormalSmsProps } from '../interfaces';

export class PluginAliyunSmsServer extends Plugin {
  async load() {
    SmsCenter.startup({ plugin: this });
    registerActions({ plugin: this });
  }

  async sendSMSMessage(props: INormalSmsProps): Promise<any> {
    return SmsCenter.sendSms(props);
  }

  verificationCode(props: { verificationKey: string; verificationCode: string }) {
    return SmsCenter.verificationCode(props);
  }
}

export default PluginAliyunSmsServer;
