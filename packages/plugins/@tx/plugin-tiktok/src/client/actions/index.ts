import { Plugin } from '@nocobase/client';
import { registerProxySubscriptionAction } from './proxySubscription';

export const registerActions = (props: { plugin: Plugin }) => {
  registerProxySubscriptionAction(props);
};
