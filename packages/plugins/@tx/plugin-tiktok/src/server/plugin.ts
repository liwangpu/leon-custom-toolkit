import { Plugin } from '@nocobase/server';
import {
  getSubcription,
  makeDevicePayment,
  devicePaymentFeedback,
  tkAuthorize,
  tkGrowFansPlanReport,
  tkRegisterAuthorize,
  // tkUpdateRegisterUserInfo,
  releaseResource,
  syncAccountInfo,
  syncAllAccountInfos,
  // tkMockAuthorizeFeedback,
  doTranslate,
  tkAuthorizeFeedback,
  mockPublishVideoToCurrentUserToAccount,
} from './actions';
import {
  hotSellMiddeware,
  influencerMiddeware,
  newsBurstMiddeware,
  organizationResourceDBEvent,
  organizationResourceMiddeware,
  postingResourceReleaseMiddeware,
  searchTermDetailMiddeware,
  topFollowerMiddeware,
  topHashTagMiddeware,
  topSoldMiddeware,
  topVideoMiddeware,
} from './middlewares';
import { TikTokAuth } from './tiktok-auth';
import { afterAccountCreateOrUpdate, afterCreatePostingResourceRelease, calculateVideoDuration } from './hooks';
import { EchoTikAPI, TiktokDataCenter } from './dataCenter';

export class PluginTiktokServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    this.app.resourceManager.define({
      name: 'proxySubscription',
      actions: {
        subscribe: getSubcription(),
        doTranslate: doTranslate(),
      },
    });
    this.app.acl.allow('proxySubscription', '*', 'public');

    this.app.resourceManager.define({
      name: 'tiktok',
      actions: {
        growFansPlanReport: tkGrowFansPlanReport(),
        authorize: tkAuthorize(),
        registerAuthorize: tkRegisterAuthorize(),
        // updateRegisterUserInfo: tkUpdateRegisterUserInfo(),
        authorizeFeedback: tkAuthorizeFeedback(),
        // authorizeFeedback: tkMockAuthorizeFeedback(),
        releaseResource: releaseResource(),
        syncAccountInfo: syncAccountInfo(),
        syncAllAccountInfos: syncAllAccountInfos(),
        mockPublishVideoToCurrentUserToAccount: mockPublishVideoToCurrentUserToAccount(),
      },
    });
    this.app.acl.allow('tiktok', '*', 'loggedIn');
    this.app.acl.allow('tiktok', 'authorize', 'public');
    this.app.acl.allow('tiktok', 'registerAuthorize', 'public');
    this.app.acl.allow('tiktok', 'updateRegisterUserInfo', 'public');
    this.app.acl.allow('tiktok', 'authorizeFeedback', 'public');
    this.app.acl.allow('tiktok', 'releaseResource', 'public');
    this.app.acl.allow('tiktok', 'syncAccountInfo', 'public');
    this.app.acl.allow('tiktok', 'syncAllAccountInfos', 'public');

    this.app.resourceManager.define({
      name: 'payment',
      actions: {
        makeDevicePayment: makeDevicePayment(),
        devicePaymentFeedback: devicePaymentFeedback(),
      },
    });
    this.app.acl.allow('payment', '*', 'public');

    this.app.authManager.registerTypes('TikTok', {
      auth: TikTokAuth,
    });

    EchoTikAPI.startup({ plugin: this });
    TiktokDataCenter.startup({ plugin: this });

    // hooks
    this.db.on('tk_account.beforeSave', afterAccountCreateOrUpdate({ db: this.db }));
    this.db.on('tk_posting_resource.beforeSave', calculateVideoDuration({ db: this.db }));
    // this.db.on('tk_posting_resource_release.afterCreate', afterCreatePostingResourceRelease({ db: this.db }));
    this.db.on('tk_posting_resource_release.afterCreate', afterCreatePostingResourceRelease({ db: this.db }));
    this.app.on('afterStart', () => {
      // 给resource filter加上organizationId字段过滤
      this.app.acl.use(organizationResourceMiddeware(this));
      this.app.acl.use(postingResourceReleaseMiddeware(this));
      this.app.acl.use(topHashTagMiddeware(this));
      this.app.acl.use(topVideoMiddeware(this));
      this.app.acl.use(topFollowerMiddeware(this));
      this.app.acl.use(topSoldMiddeware(this));
      this.app.acl.use(hotSellMiddeware(this));
      this.app.acl.use(newsBurstMiddeware(this));
      this.app.acl.use(influencerMiddeware(this));
      // this.app.acl.use(accountVideoMiddeware(this));
      // 养号计划关键词新增/编辑和删除触发养号计划更新
      this.app.acl.use(searchTermDetailMiddeware(this));
      // 监听db事件,填写organizationId字段信息
      organizationResourceDBEvent({ db: this.db });
    });
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginTiktokServer;
