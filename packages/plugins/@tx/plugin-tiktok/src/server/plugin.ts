import { Plugin } from '@nocobase/server';
import { getSubcription, tkAuthorize, tkAuthorizeFeedback, tkDailyTaskReport } from './actions';
import { cloneDeep, isNil } from 'lodash';
import { generateBrowserFingerprint } from './utils';
import { TikTokAuth } from './tiktok-auth';
import actions from '@nocobase/actions';
import { organizationResourceDBEvent, organizationResourceMiddeware } from './middlewares';

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

    // this.app.resource({
    //   name: 'users',
    //   actions: {
    //     async list(ctx, next) {
    //       console.log(`---------[ rewrite user ]---------`);
    //       // console.log(`ctx:`, ctx);
    //       console.log(`ctx.state.currentUser:`, ctx.state.currentUser);
    //       ctx.request.url = '/api/users:list';
    //       ctx.request.originalUrl = '/api/users:list';

    //       // console.log(`ctx:`, ctx);
    //       // console.log(`ctx.request.query:`, ctx.request.query);
    //       // ctx.request.query = {};

    //       const currentUser = ctx.state?.currentUser;
    //       const organizationId = currentUser.organizationId;
    //       // const is
    //       // console.log(`currentUser:`, currentUser);
    //       // console.log(`roles:`, currentUser.roles);
    //       const roles = currentUser.roles;
    //       const rolesSet = new Set(roles.map((r) => r.name));
    //       // const isRoot
    //       for (const r of roles) {
    //         console.log(`r.name:`, r.name);
    //       }
    //       console.log(`rolesSet.size:`, rolesSet.size);
    //       const isRootAdmin = rolesSet.has('root');
    //       const isOrganizationAdminUser = rolesSet.has('organizationAdmin');
    //       const isOrganizationUser = rolesSet.has('organizationAdmin');
    //       const resource = null;
    //       const action = null;

    //       ctx.action.mergeParams({
    //         filter: {
    //           $and: [{ username: { $includes: '黄雨昭' } }],
    //         },
    //       });
    //       return actions.list(ctx as any, next);
    //       await next();
    //     },
    //   },
    // });

    // this.app.acl.use(async (ctx, next) => {
    //   // console.log(`ctx:`, ctx);
    //   if (ctx.url.includes('users:list')) {
    //     // debugger;
    //     console.log(`ctx:`, ctx);
    //     console.log(`ctx.state.currentUser:`, ctx.state?.currentUser);
    //     // ctx.response.status = 403;
    //     return;
    //   }
    //   await next();
    // });

    // 给resource filter加上organizationId字段过滤
    this.app.acl.use(organizationResourceMiddeware(this));
    // 监听db事件,填写organizationId字段信息
    organizationResourceDBEvent({ db: this.db });

    // this.app.use(organizationResourceMiddeware());
    // this.app.use(organizationResourceMiddeware());
    this.app.acl.allow('tiktok', '*', 'loggedIn');
    this.app.acl.allow('tiktok', 'authorize', 'public');
    this.app.acl.allow('tiktok', 'authorizeFeedback', 'public');
    // this.app.acl.allow('tiktok', 'tokenFeedback', 'public');

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
