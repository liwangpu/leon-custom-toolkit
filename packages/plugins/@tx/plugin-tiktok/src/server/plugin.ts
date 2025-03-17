import { Plugin } from '@nocobase/server';
import { registerActions } from './actions';
import { EchoTikAPI, TiktokDataCenter } from './dataCenter';
import { implementMiddlewares } from './middlewares';

export class PluginTiktokServer extends Plugin {
  async load() {
    EchoTikAPI.startup({ plugin: this });
    TiktokDataCenter.startup({ plugin: this });

    registerActions({ plugin: this });
    implementMiddlewares({ plugin: this });
  }
}

export default PluginTiktokServer;
