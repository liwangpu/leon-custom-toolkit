import { Plugin } from '@nocobase/server';
import { getSubcription, tkDailyTaskReport } from './actions';
import { isNil } from 'lodash';
import { generateBrowserFingerprint } from './utils';

export class PluginTiktokServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    this.app.resourceManager.define({
      name: 'proxySubscription',
      actions: {
        subscribe: getSubcription(),
      },
    });
    this.app.acl.allow('proxySubscription', '*', 'public');

    this.app.resourceManager.define({
      name: 'tiktok',
      actions: {
        dailyTaskReport: tkDailyTaskReport(),
      },
    });
    this.app.acl.allow('tiktok', '*', 'loggedIn');

    const appendFingerprint = async (account, options) => {
      if (isNil(account.LanguageId) || !isNil(account.fingerprint)) return;
      const languageRep = this.db.getRepository('tk_language');

      const lang = await languageRep.findById(account.LanguageId);
      if (isNil(lang.language)) return;
      account.fingerprint = generateBrowserFingerprint({ language: lang.language });
    };

    this.db.on('tk_account.beforeUpdate', appendFingerprint);
    this.db.on('tk_account.beforeCreate', appendFingerprint);
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginTiktokServer;
