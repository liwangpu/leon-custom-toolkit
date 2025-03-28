import { Plugin } from '@nocobase/server';
import { registerActions } from './actions';
import { implementDataCenter } from './dataCenter';
import { implementMiddlewares } from './middlewares';
import { registerHooks } from './hooks';

export class PluginTiktokServer extends Plugin {
  async load() {
    registerActions({ plugin: this });
    registerHooks({ plugin: this });
    implementMiddlewares({ plugin: this });
    implementDataCenter({ plugin: this });
  }
}

export default PluginTiktokServer;
