import { Plugin } from '@nocobase/server';
import { registerAnalysisActions } from './analysis';
import { registerProxySubscriptionActions } from './proxySubscription';
import { registerTiktokActions } from './tiktok';
import { registerPaymentActions } from './payment';
import { registerServicePermissionsActions } from './servicePermission';

export const registerActions = (props: { plugin: Plugin }) => {
  registerAnalysisActions(props);
  registerProxySubscriptionActions(props);
  registerTiktokActions(props);
  registerPaymentActions(props);
  registerServicePermissionsActions(props);
};
