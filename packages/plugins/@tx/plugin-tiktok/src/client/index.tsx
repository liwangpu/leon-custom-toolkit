import { Plugin } from '@nocobase/client';
import AuthPlugin from '@nocobase/plugin-auth/client';
import {
  copySubscribeActionSettings,
  createCopySubscribeActionInitializerItem,
  useCopyProxySubscribeActionProps,
} from './actions';
import { Payment, TikTokSignIn, TKAuthorizeFeedback } from './components';
import { CopyProxySubscribeActionName } from './consts';
import { PaymentInitializerItem } from './Initializer';
import { PaymentSettings } from './settings';
import {
  subscribeGrowPlanStart,
  subscribeGrowPlanStop,
  subscribeGrowFansPlanStatusChange,
  subscribeOpenWindow,
  subscribeTKAuthorize,
  subscribeTKAuthorizeSandbox,
  subscribeCopyAttachmentResourceUrl,
  subscribeWatchTKVideo,
  subscribeViewInfluencer,
  subscribePublishResource,
} from './subscriptions';

export class PluginTiktokClient extends Plugin {
  async load() {
    this.app.addComponents({ Payment });
    this.app.addScopes({ useCopyProxySubscribeActionProps });
    // 注册组件相关
    this.app.schemaInitializerManager.addItem(
      'table:configureItemActions',
      CopyProxySubscribeActionName,
      createCopySubscribeActionInitializerItem(),
    );
    this.app.schemaSettingsManager.add(copySubscribeActionSettings);

    this.app.schemaSettingsManager.add(PaymentSettings);
    this.app.schemaInitializerManager.addItem(
      'popup:addNew:addBlock',
      `otherBlocks.${PaymentInitializerItem.name}`,
      PaymentInitializerItem,
    );
    this.app.schemaInitializerManager.addItem(
      'page:addBlock',
      `otherBlocks.${PaymentInitializerItem.name}`,
      PaymentInitializerItem,
    );
    this.app.router.add('payment', {
      path: 'payment',
      Component: Payment,
    });
    this.app.router.add('tk_authorize_feedback', {
      path: 'tk-authorize-feedback',
      Component: TKAuthorizeFeedback,
    });
    const auth = this.app.pm.get(AuthPlugin);
    auth.registerType('TikTok', {
      components: {
        SignInButton: TikTokSignIn,
      },
    });

    subscribeGrowPlanStart.subscribe();
    subscribeGrowPlanStop.subscribe();
    subscribeOpenWindow.subscribe();
    subscribeTKAuthorize.subscribe();
    subscribeTKAuthorizeSandbox.subscribe();
    subscribeGrowFansPlanStatusChange.subscribe();
    subscribeCopyAttachmentResourceUrl.subscribe();
    subscribeWatchTKVideo.subscribe();
    subscribeViewInfluencer.subscribe();
    subscribePublishResource.subscribe();
  }
}

export default PluginTiktokClient;
