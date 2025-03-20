import type { Plugin } from '@nocobase/server';
import { organizationResourceDBEvent, organizationResourceMiddeware } from './organization';
import { postingResourceReleaseMiddeware } from './postingResource';
import {
  hotSellMiddeware,
  newsBurstMiddeware,
  topFollowerMiddeware,
  topHashTagMiddeware,
  topSoldMiddeware,
  topVideoMiddeware,
} from './echoTikAPI';
import { searchTermDetailMiddeware } from './searchTermDetail';
import { implementInfluencerMiddleware } from './influencer';
import { implementProductMiddleware } from './product';
import { implementInfluencerVideoMiddleware } from './influencerVideo';
import { implementLiveMiddleware } from './live';
import { implementSellerMiddleware } from './seller';

export * from './common';

export const implementMiddlewares = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app, db } = plugin;
  app.on('afterStart', () => {
    // 给resource filter加上organizationId字段过滤
    app.acl.use(organizationResourceMiddeware(plugin));
    app.acl.use(postingResourceReleaseMiddeware(plugin));
    app.acl.use(topHashTagMiddeware(plugin));
    app.acl.use(topVideoMiddeware(plugin));
    app.acl.use(topFollowerMiddeware(plugin));
    app.acl.use(topSoldMiddeware(plugin));
    app.acl.use(hotSellMiddeware(plugin));
    app.acl.use(newsBurstMiddeware(plugin));
    // app.acl.use(accountVideoMiddeware(plugin));
    implementInfluencerMiddleware(plugin);
    implementProductMiddleware(plugin);
    implementInfluencerVideoMiddleware(plugin);
    implementLiveMiddleware(plugin);
    implementSellerMiddleware(plugin);
    // 养号计划关键词新增/编辑和删除触发养号计划更新
    app.acl.use(searchTermDetailMiddeware(plugin));
    // 监听db事件,填写organizationId字段信息
    organizationResourceDBEvent({ db });
  });
};
