import type { Plugin } from '@nocobase/server';
import { getUserInfo } from './common';
import { EchoTikAPI, IEchoSort } from '../dataCenter';
import { parseListFilterCondition } from '../utils';
/**
 * 实施达人库相关中间件
 * @param plugin pPlugin
 */
export const implementInfluencerMiddleware = (plugin: Plugin) => {
  const { app } = plugin;
  const { acl } = app;
  acl.use(influencerListMiddeware(plugin));
  acl.use(influencerDetailMiddleware(plugin));
  acl.use(influencerVideoListMiddeware(plugin));
  acl.use(influencerLiveListMiddeware(plugin));
  acl.use(influencerProductListMiddeware(plugin));
};

const influencerListMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'influencers' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { filter, page, pageSize, sort } = params;
    console.log(`---------[ influencerListMiddeware ]---------`);
    // console.log(`params:`, params);
    console.log(`filter:`, JSON.stringify(filter));

    const searchMap: Map<string, any> = await parseListFilterCondition({
      filter,
      async parseFn(condition, add) {
        // console.log(`condition:`, condition);
        const propeties = Object.keys(condition);

        for (const propety of propeties) {
          const kv = condition[propety];
          // console.log(`propety:`, propety);
          // console.log(`kv:`, kv);
          switch (propety) {
            case 'keyword':
              add(propety, kv['$includes']);
              break;
            case 'search_followers_count':
            case 'search_digg_count':
            case 'searchConditionUid':
            case 'time_type':
              add(propety, kv['$eq']);
              break;
            case 'sales_flag':
              add(propety, kv['$isTruly']);
              break;
            case 'is_live':
              add(propety, kv['$isTruly']);
              break;
            case 'country':
              add(propety, kv['id']['$eq']);
              break;
            case 'productionCategory':
              add(propety, kv['categoryId']['$eq']);
              break;
            case 'influencerCategory':
              add(propety, kv['key']['$eq']);
              break;
            default:
              break;
          }
        }
      },
    })();

    let orderFieldMapping: Record<string, any> = {};
    const searchConditionUid = searchMap.get('searchConditionUid');
    switch (searchConditionUid) {
      case '带货达人榜':
        orderFieldMapping = {
          product_ifl_gmv_amt: 'total_gmv_amt',
          video_count: 'total_post_video_cnt',
          follower_count: 'total_followers_cnt',
        };
        break;
      case '飙升达人榜':
        orderFieldMapping = {
          follower_count: 'total_followers_cnt',
        };
        break;
      case '直播带货达人榜':
        orderFieldMapping = {
          // follower_count: 'total_followers_cnt',
        };
        break;
      default:
        break;
    }

    console.log(`searchMap:`, searchMap);
    const { data: ds, meta } = await EchoTikAPI.requestInfluencerList({
      keyword: searchMap.get('keyword'),
      country: searchMap.get('country'),
      salesFlag: searchMap.get('sales_flag'),
      isLive: searchMap.get('is_live'),
      productCategory: searchMap.get('productionCategory'),
      influencerCategory: searchMap.get('influencerCategory'),
      followersCount: searchMap.get('search_followers_count'),
      diggCount: searchMap.get('search_digg_count'),
      time_type: searchMap.get('time_type'),
      searchConditionUid,
      page,
      pageSize,
      ...EchoTikAPI.transferNocoSortToEchoSort({ sort, orderFieldMapping }),
    });
    ctx.withoutDataWrapping = true;
    ctx.body = {
      data: ds,
      meta,
    };
  };
};

const influencerDetailMiddleware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });
    if (!(resourceName === 'influencers' && actionName === 'get')) return await next();
    const params = ctx.action.params;
    const { filterByTk: influencerId } = params;
    const data = await EchoTikAPI.requestInfluencerDetail({ influencerId });
    const influencerCategory = await EchoTikAPI.getInfluencerCategoryByKey(data.category);
    const social_media_accounts = data.social_media_accounts;
    let youtubeUrl: string;
    let instagramUrl: string;
    if (social_media_accounts) {
      youtubeUrl = social_media_accounts.youtube?.url;
      instagramUrl = social_media_accounts.instagram?.url;
    }
    ctx.withoutDataWrapping = true;
    ctx.body = {
      data: {
        ...data,
        influencerCategory,
        youtubeUrl,
        instagramUrl,
      },
    };
  };
};

const influencerVideoListMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'influencers.videos' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { associatedIndex: influencerId, page, pageSize, sort } = params;

    const { data: ds, meta } = await EchoTikAPI.requestInfluencerVideoList({
      influencerId,
      page,
      pageSize,
      ...EchoTikAPI.transferNocoSortToEchoSort({ sort }),
    });
    ctx.withoutDataWrapping = true;
    ctx.body = {
      data: ds,
      meta,
    };
  };
};

const influencerLiveListMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'influencers.lives' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { associatedIndex: influencerId, page, pageSize } = params;

    const { data: ds, meta } = await EchoTikAPI.requestInfluencerLiveList({
      influencerId,
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

const influencerProductListMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'influencers.products' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { associatedIndex: influencerId, page, pageSize, sort } = params;

    const { data: ds, meta } = await EchoTikAPI.requestInfluencerProductList({
      influencerId,
      page,
      pageSize,
      ...EchoTikAPI.transferNocoSortToEchoSort({ sort }),
      transfer(data) {
        return {
          ...data,
          createdAt: data.create_time,
        };
      },
    });
    ctx.withoutDataWrapping = true;
    ctx.body = {
      data: ds,
      meta,
    };
  };
};
