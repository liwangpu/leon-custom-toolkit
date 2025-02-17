import { Plugin } from '@nocobase/client';
import AuthPlugin from '@nocobase/plugin-auth/client';
import {
  copySubscribeActionSettings,
  createCopySubscribeActionInitializerItem,
  createTKManageButtonActionInitializerItem,
  tkManageButtonActionSettings,
  useCopyProxySubscribeActionProps,
} from './actions';
import { Payment, TikTokSignIn, TKAuthorizeFeedback, TKManageButton } from './components';
import { CopyProxySubscribeActionName, TKManageButtonName } from './consts';
import { PaymentInitializerItem } from './Initializer';
import { PaymentSettings } from './settings';

export class PluginTiktokClient extends Plugin {
  async load() {
    this.app.addComponents({ TKManageButton, Payment });
    this.app.addScopes({ useCopyProxySubscribeActionProps });
    this.app.schemaSettingsManager.add(tkManageButtonActionSettings);
    this.app.schemaSettingsManager.add(copySubscribeActionSettings);
    this.app.schemaInitializerManager.addItem(
      'table:configureItemActions',
      TKManageButtonName,
      createTKManageButtonActionInitializerItem(),
    );
    this.app.schemaInitializerManager.addItem(
      'table:configureItemActions',
      CopyProxySubscribeActionName,
      createCopySubscribeActionInitializerItem(),
    );

    this.app.schemaSettingsManager.add(PaymentSettings);
    this.app.schemaInitializerManager.addItem(
      'popup:addNew:addBlock',
      `otherBlocks.${PaymentInitializerItem.name}`,
      PaymentInitializerItem,
    );
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
  }
}

export default PluginTiktokClient;
