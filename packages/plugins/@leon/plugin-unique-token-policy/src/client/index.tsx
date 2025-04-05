import { Plugin } from '@nocobase/client';
import { registerComponents } from './components';
import { registerProviders } from './providers';

export class PluginUniqueTokenPolicyClient extends Plugin {
  async load() {
    registerComponents({ plugin: this });
    registerProviders({ plugin: this });
  }
}

export default PluginUniqueTokenPolicyClient;
