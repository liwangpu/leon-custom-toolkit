import { Plugin } from '@nocobase/server';
import { registerActions } from './actions';
import { SmsCenter } from './dataCenter';

export class PluginAliyunSmsServer extends Plugin {
  async load() {
    SmsCenter.startup({ plugin: this });
    registerActions({ plugin: this });
  }
}

export default PluginAliyunSmsServer;
