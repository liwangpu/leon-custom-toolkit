import { Plugin } from '@nocobase/server';
import {
  getSubcription,
  makeDevicePayment,
  devicePaymentFeedback,
  tkAuthorize,
  summaryGrowFansPlan,
  tkAuthorizeFeedback,
  tkGrowFansPlanReport,
  tkRegisterAuthorize,
  tkUpdateRegisterUserInfo,
  releaseResource,
  syncAccountInfo,
  syncAllAccountInfos,
} from './actions';
import {
  organizationResourceDBEvent,
  organizationResourceMiddeware,
  postingResourceReleaseMiddeware,
} from './middlewares';
import { TikTokAuth } from './tiktok-auth';
import { afterAccountCreateOrUpdate, afterCreatePostingResourceRelease, calculateVideoDuration } from './hooks';

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
        growFansPlanReport: tkGrowFansPlanReport(),
        summaryGrowFansPlan: summaryGrowFansPlan(),
        authorize: tkAuthorize(),
        registerAuthorize: tkRegisterAuthorize(),
        updateRegisterUserInfo: tkUpdateRegisterUserInfo(),
        authorizeFeedback: tkAuthorizeFeedback(),
        releaseResource: releaseResource(),
        syncAccountInfo: syncAccountInfo(),
        syncAllAccountInfos: syncAllAccountInfos(),
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

    // hooks
    this.db.on('tk_account.beforeSave', afterAccountCreateOrUpdate({ db: this.db }));
    this.db.on('tk_posting_resource.beforeSave', calculateVideoDuration({ db: this.db }));
    // this.db.on('tk_posting_resource_release.afterCreate', afterCreatePostingResourceRelease({ db: this.db }));
    this.db.on('tk_posting_resource_release.afterCreate', afterCreatePostingResourceRelease({ db: this.db }));
    this.app.on('afterStart', () => {
      // 给resource filter加上organizationId字段过滤
      this.app.acl.use(organizationResourceMiddeware(this));
      this.app.acl.use(postingResourceReleaseMiddeware(this));
      // 监听db事件,填写organizationId字段信息
      organizationResourceDBEvent({ db: this.db });
    });

    // this.app.use(async (ctx, next) => {
    //   ctx.body = ctx.body || [];
    //   // ctx.body.push(1);
    //   const { resourceName, actionName } = ctx.action;
    //   if (resourceName !== 'tk_posting_resource_release' || actionName !== 'create') return;
    //   console.log(`---------[ title ]---------`);
    //   console.log(`---------[ title ]---------`);
    //   console.log(`ctx.request:`, ctx.request);
    //   console.log(` ctx.request.body:`, ctx.request.body);
    //   // console.log(`resourceName:`, resourceName);
    //   // console.log(`actionName:`, actionName);
    //   console.log(`body:`, ctx.body);
    //   // ctx.request.body = null;
    //   // (ctx.request.body as any).accounts = [];
    //   // ctx.body.dataValues.accounts = [];
    //   // ctx.body.accounts = [];

    //   console.log(`after:`, ctx.body);
    //   await next();

    //   // ctx.body.push(2);
    // });
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginTiktokServer;
