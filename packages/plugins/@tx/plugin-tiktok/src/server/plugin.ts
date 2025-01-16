import { Plugin } from '@nocobase/server';
import { getSubcription, tkAuthorize, tkAuthorizeFeedback, tkDailyTaskReport } from './actions';
import { organizationResourceDBEvent, organizationResourceMiddeware } from './middlewares';
import { TikTokAuth } from './tiktok-auth';
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
        authorize: tkAuthorize(),
        authorizeFeedback: tkAuthorizeFeedback(),
      },
    });
    this.app.on('afterStart', () => {
      // 给resource filter加上organizationId字段过滤
      this.app.acl.use(organizationResourceMiddeware(this));
      // 监听db事件,填写organizationId字段信息
      organizationResourceDBEvent({ db: this.db });
    });

    this.app.acl.allow('tiktok', '*', 'loggedIn');
    this.app.acl.allow('tiktok', 'authorize', 'public');
    this.app.acl.allow('tiktok', 'authorizeFeedback', 'public');

    this.app.authManager.registerTypes('TikTok', {
      auth: TikTokAuth,
    });
    const appendFingerprint = async (account, options, ...sss) => {
      console.log(`---------[ appendFingerprint ]---------`);
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
