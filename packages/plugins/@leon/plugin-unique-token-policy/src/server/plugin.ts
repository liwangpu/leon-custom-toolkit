import { Plugin } from '@nocobase/server';
import { implementMiddlewares } from './middlewares';

export class PluginUniqueTokenPolicyServer extends Plugin {
  async load() {
    implementMiddlewares({ plugin: this });
  }
}

export default PluginUniqueTokenPolicyServer;
