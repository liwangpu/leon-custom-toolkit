import { Plugin } from '@nocobase/client';
import { subscribeEvents } from './subscriptions';
import { registerComponents } from './components';
import { registerActions } from './actions';

export class PluginTiktokClient extends Plugin {
  async load() {
    registerActions({ plugin: this });
    registerComponents({ plugin: this });
    subscribeEvents();
  }
}

export default PluginTiktokClient;
