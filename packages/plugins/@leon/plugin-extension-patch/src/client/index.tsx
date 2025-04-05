import { Plugin } from '@nocobase/client';
import { registerComponents } from './components';

export class PluginExtensionPatchClient extends Plugin {
  async load() {
    registerComponents({ plugin: this });
  }
}

export default PluginExtensionPatchClient;
