import { Plugin } from '@nocobase/client';
import { registerComponents } from './components';
import { registerScripts } from './scripts';

export class PluginTikpulseOfficialWebsiteClient extends Plugin {
  async load() {
    registerComponents({ plugin: this });
    registerScripts({ plugin: this });
  }
}

export default PluginTikpulseOfficialWebsiteClient;
