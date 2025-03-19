import type { Plugin } from '@nocobase/server';
import { getUserInfo } from './common';
import { EchoTikAPI } from '../dataCenter';
import { isArray, isNil } from 'lodash';

/**
 * 实施产品库相关中间件
 * @param plugin pPlugin
 */
export const implementInfluencerVideoMiddleware = (plugin: Plugin) => {
  const { app } = plugin;
  const { acl } = app;

  acl.use(influencerVideoListMiddeware(plugin));
  acl.use(influencerVideoDetailMiddeware(plugin));
};

const influencerVideoListMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'influencer_video' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { filter, page, pageSize, sort } = params;
    const $and = filter['$and'];
    // console.log(`---------[ influencerVideoListMiddeware ]---------`);
    // console.log(`params:`, params);
    // console.log(`$and:`, JSON.stringify($and));
    const searchCondition = new Map<string, any>();
    if (isArray($and)) {
      for (const it of $and) {
        const propeties = Object.keys(it);

        for (const propety of propeties) {
          const kv = it[propety];
          // console.log(`propety:`, propety);
          // console.log(`kv:`, kv);
          let propertyValue: any;
          switch (propety) {
            case 'searchConditionViewCount':
            case 'searchConditionLikeCount':
            case 'searchConditionCommentCount':
            case 'searchConditionShareCount':
            case 'searchConditionDuration':
            case 'searchConditionTimeRange':
              propertyValue = kv['$eq'];
              break;
            case 'keyword':
              propertyValue = kv['$includes'];
              break;
            case 'influencerCategory':
              propertyValue = kv['key']['$eq'];
              break;
            case 'country':
              propertyValue = kv['id']['$eq'];
              break;
            case 'searchConditionSales':
            case 'searchConditionTimeIsLatest':
              propertyValue = kv['$isTruly'];
              break;
            default:
              break;
          }
          if (!isNil(propertyValue)) {
            searchCondition.set(propety, propertyValue);
          }
        }
      }
    }
    // console.log(`sort:`, sort);
    // console.log(`searchCondition:`, searchCondition);
    const { data: ds, meta } = await EchoTikAPI.requestIndependentInfluencerVideoList({
      searchCondition,
      ...EchoTikAPI.transferNocoSortToEchoSort({ sort }),
      transfer(data) {
        const seller: Record<string, any> = data.seller || {};
        return {
          ...data,
          seller_id: seller.seller_id,
          seller_name: seller.seller_name,
          seller_cover_url: seller.cover_url,
        };
      },
      page,
      pageSize,
    });
    ctx.withoutDataWrapping = true;
    ctx.body = {
      data: ds,
      meta,
    };
  };
};

const influencerVideoDetailMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });
    if (!(resourceName === 'influencer_video' && actionName === 'get')) return await next();
    const params = ctx.action.params;
    const { filterByTk: id } = params;
    const data = await EchoTikAPI.requestIndependentInfluencerVideoDetail({
      id,
      transfer(data) {
        const influencer = data.influencer || {};
        return {
          ...data,
          digg_count: data.likes_count,
          comment_count: data.comments_count,
          share_count: data.shares_count,
          country: data.region,
          influencer: {
            ...influencer,
            follower_count: influencer.followers_count,
            video_count: influencer.videos_count,
          },
        };
      },
    });

    ctx.withoutDataWrapping = true;
    ctx.body = {
      data,
    };
  };
};
