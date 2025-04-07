import { Plugin } from '@nocobase/client';
import { subscribeEvents } from './subscriptions';
import { registerComponents } from './components';
import { registerActions } from './actions';
import axios from 'axios';
import { registerProviders } from './providers';

axios.defaults.timeout === 30000;

export class PluginTiktokClient extends Plugin {
  async load() {
    registerActions({ plugin: this });
    registerComponents({ plugin: this });
    registerProviders({ plugin: this });
    subscribeEvents();
  }
}

export default PluginTiktokClient;
