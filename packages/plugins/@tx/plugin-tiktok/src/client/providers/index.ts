import { Plugin } from '@nocobase/client';
import { registerCustomEventHandlerProvider } from './customEventHandler';

export const registerProviders = (props: { plugin: Plugin }) => {
  registerCustomEventHandlerProvider(props);
};
