import { isNil } from 'lodash';
import type { Plugin } from '@nocobase/server';
import { getUserInfo } from './common';
import { EchoTikAPI } from '../dataCenter';

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
    const { filter, page, pageSize } = params;
    const $and = filter['$and'];

    // if (isNil($and)) {
    //   ctx.body = {
    //     data: [],
    //   };
    //   return;
    // }
    // console.log(`---------[ title ]---------`);
    // console.log(`---------[ title ]---------`);
    // console.log(`params:`, params);
    // console.log(`$and:`, $and);
    // const searchMap = new Map<string, any>();
    // for (const it of $and) {
    //   const propeties = Object.keys(it);

    //   for (const propety of propeties) {
    //     const kv = it[propety];
    //     switch (propety) {
    //       case 'time_range':
    //         searchMap.set(propety, kv['$dateOn']);
    //         break;
    //       case 'country':
    //         searchMap.set(propety, kv['id']['$eq']);
    //         break;
    //       case 'productCategory':
    //         searchMap.set(propety, kv['categoryId']['$eq']);
    //         break;
    //       default:
    //         break;
    //     }
    //   }
    // }
    const { data: ds, meta } = await EchoTikAPI.requestInfluencerList({
      // country: searchMap.get('country'),
      // productCategory: searchMap.get('productCategory'),
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

    if (!(resourceName === 'influencer_video' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { filter, page, pageSize, sort } = params;
    const $and = filter['$and'];
    if (isNil($and)) {
      ctx.body = {
        data: [],
      };
      return;
    }

    const searchMap = new Map<string, any>();
    for (const it of $and) {
      const propeties = Object.keys(it);

      for (const propety of propeties) {
        const kv = it[propety];
        switch (propety) {
          case 'influencerId':
            searchMap.set(propety, kv['$eq']);
            break;
          default:
            break;
        }
      }
    }

    const { data: ds, meta } = await EchoTikAPI.requestInfluencerVideoList({
      influencerId: searchMap.get('influencerId'),
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

    if (!(resourceName === 'influencer_live' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { filter, page, pageSize } = params;
    const $and = filter['$and'];
    if (isNil($and)) {
      ctx.body = {
        data: [],
      };
      return;
    }

    const searchMap = new Map<string, any>();
    for (const it of $and) {
      const propeties = Object.keys(it);

      for (const propety of propeties) {
        const kv = it[propety];
        switch (propety) {
          case 'influencerId':
            searchMap.set(propety, kv['$eq']);
            break;
          default:
            break;
        }
      }
    }

    const { data: ds, meta } = await EchoTikAPI.requestInfluencerLiveList({
      influencerId: searchMap.get('influencerId'),
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

    if (!(resourceName === 'influencer_product' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { filter, page, pageSize, sort } = params;
    const $and = filter['$and'];
    if (isNil($and)) {
      ctx.body = {
        data: [],
      };
      return;
    }

    const searchMap = new Map<string, any>();
    for (const it of $and) {
      const propeties = Object.keys(it);

      for (const propety of propeties) {
        const kv = it[propety];
        switch (propety) {
          case 'influencerId':
            searchMap.set(propety, kv['$eq']);
            break;
          default:
            break;
        }
      }
    }

    const { data: ds, meta } = await EchoTikAPI.requestInfluencerProductList({
      influencerId: searchMap.get('influencerId'),
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
