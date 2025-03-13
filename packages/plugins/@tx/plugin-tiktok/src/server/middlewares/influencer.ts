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
  acl.use(influencerGetMiddleware(plugin));
  acl.use(influencerVideoListMiddeware(plugin));
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

const influencerGetMiddleware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });
    if (!(resourceName === 'influencers' && actionName === 'get')) return await next();
    const params = ctx.action.params;
    const { filterByTk: influencerId } = params;
    const data = await EchoTikAPI.requestInfluencerDetail({ influencerId });
    // console.log(`data:`, data);

    ctx.withoutDataWrapping = true;
    ctx.body = {
      data,
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
    const { filter, page, pageSize } = params;
    const $and = filter['$and'];

    if (isNil($and)) {
      ctx.body = {
        data: [],
      };
      return;
    }
    console.log(`---------[ influencerVideoListMiddeware ]---------`);
    console.log(`---------[ influencerVideoListMiddeware ]---------`);
    console.log(`params:`, params);
    console.log(`$and:`, $and);
    const searchMap = new Map<string, any>();
    for (const it of $and) {
      const propeties = Object.keys(it);

      for (const propety of propeties) {
        const kv = it[propety];
        console.log(`propety:`, propety);
        console.log(`kv:`, kv);
        switch (propety) {
          case 'influencer':
            searchMap.set(propety, kv['influencer_id']['$eq']);
            break;
          default:
            break;
        }
      }
    }
    console.log(`searchMap:`, searchMap);
    const { data: ds, meta } = await EchoTikAPI.requestInfluencerVideoList({
      influencerId: searchMap.get('influencer'),
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
