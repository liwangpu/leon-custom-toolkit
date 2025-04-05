import { Plugin } from '@nocobase/client';
import { registerForceOfflineProvider } from './forceOffline';

export const registerProviders = (props: { plugin: Plugin }) => {
  registerForceOfflineProvider(props);
};
