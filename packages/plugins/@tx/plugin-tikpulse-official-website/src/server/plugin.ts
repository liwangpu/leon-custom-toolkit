import { Plugin } from '@nocobase/server';
import { registerActions } from './actions';

export class PluginTikpulseOfficialWebsiteServer extends Plugin {
  async load() {
    registerActions({ plugin: this });
  }
}

export default PluginTikpulseOfficialWebsiteServer;
