import { Plugin } from '@nocobase/client';
import { registerComponents } from './components';

export class PluginAliyunSmsClient extends Plugin {
  async load() {
    registerComponents({ plugin: this });
  }
}

export default PluginAliyunSmsClient;
