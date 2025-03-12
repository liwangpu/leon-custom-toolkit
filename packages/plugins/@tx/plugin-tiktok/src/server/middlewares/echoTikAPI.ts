import { isNil } from 'lodash';
import { Plugin } from '@nocobase/server';
import { getUserInfo } from './common';
import { EchoTikAPI } from '../dataCenter';

export function topHashTagMiddeware(plugin: Plugin) {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });
    if (!(resourceName === 'top_hashtag' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { filter, page, pageSize } = params;
    const $and = filter['$and'];
    ctx.withoutDataWrapping = true;

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
          case 'time_type':
            searchMap.set(propety, kv['$eq']);
            break;
          case 'country':
            searchMap.set(propety, kv['id']['$eq']);
            break;
          default:
            break;
        }
      }
    }

    const { data, meta } = await EchoTikAPI.requestTopHashTagList({
      time_type: searchMap.get('time_type'),
      country: searchMap.get('country'),
      page,
      pageSize,
    });

    ctx.body = {
      data,
      meta: {
        ...meta,
        page,
        pageSize,
      },
    };
  };
}

export function topVideoMiddeware(plugin: Plugin) {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });
    if (!(resourceName === 'top_video' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { filter, page, pageSize } = params;
    const $and = filter['$and'];
    ctx.withoutDataWrapping = true;
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
          case 'time_type':
            searchMap.set(propety, kv['$eq']);
            break;
          case 'country':
            searchMap.set(propety, kv['id']['$eq']);
            break;
          case 'influencerCategory':
            searchMap.set(propety, kv['key']['$eq']);
            break;
          default:
            break;
        }
      }
    }

    const { data, meta } = await EchoTikAPI.requestTopVideoList({
      time_type: searchMap.get('time_type'),
      country: searchMap.get('country'),
      influencerCategory: searchMap.get('influencerCategory'),
      page,
      pageSize,
    });

    ctx.body = {
      data,
      meta: {
        ...meta,
        page,
        pageSize,
      },
    };
  };
}

export function topFollowerMiddeware(plugin: Plugin) {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });
    if (!(resourceName === 'top_follower' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { filter, page, pageSize } = params;
    const $and = filter['$and'];
    ctx.withoutDataWrapping = true;
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
          case 'time_type':
            searchMap.set(propety, kv['$eq']);
            break;
          case 'country':
            searchMap.set(propety, kv['id']['$eq']);
            break;
          case 'influencerCategory':
            searchMap.set(propety, kv['key']['$eq']);
            break;
          default:
            break;
        }
      }
    }

    const { data, meta } = await EchoTikAPI.requestTopFollowerList({
      time_type: searchMap.get('time_type'),
      country: searchMap.get('country'),
      influencerCategory: searchMap.get('influencerCategory'),
      page,
      pageSize,
    });

    ctx.body = {
      data,
      meta: {
        ...meta,
        page,
        pageSize,
      },
    };
  };
}

export function topSoldMiddeware(plugin: Plugin) {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });
    if (!(resourceName === 'top_sold' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { filter, page, pageSize } = params;
    const $and = filter['$and'];
    ctx.withoutDataWrapping = true;

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
          case 'time_type':
            searchMap.set(propety, kv['$eq']);
            break;
          case 'country':
            searchMap.set(propety, kv['id']['$eq']);
            break;
          case 'productCategory':
            searchMap.set(propety, kv['categoryId']['$eq']);
            break;
          default:
            break;
        }
      }
    }
    // console.log(`searchMap:`, searchMap);

    const { data: ds, meta } = await EchoTikAPI.requestTopSoldList({
      time_type: searchMap.get('time_type'),
      country: searchMap.get('country'),
      productCategory: searchMap.get('productCategory'),
      page,
      pageSize,
    });
    const data = ds.map((d) => {
      const seller = d.seller || {};
      const { seller_name, cover_url: seller_cover_url } = seller;
      return { ...d, seller_name, seller_cover_url };
    });

    ctx.body = {
      data,
      meta: {
        ...meta,
        page,
        pageSize,
      },
    };
  };
}

export function hotSellMiddeware(plugin: Plugin) {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });
    if (!(resourceName === 'hot-sell' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { filter, page, pageSize } = params;
    const $and = filter['$and'];
    ctx.withoutDataWrapping = true;

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
          case 'time_type':
            searchMap.set(propety, kv['$eq']);
            break;
          case 'country':
            searchMap.set(propety, kv['id']['$eq']);
            break;
          case 'productCategory':
            searchMap.set(propety, kv['categoryId']['$eq']);
            break;
          default:
            break;
        }
      }
    }
    // console.log(`searchMap:`, searchMap);

    const { data: ds, meta } = await EchoTikAPI.requestHotSellList({
      time_type: searchMap.get('time_type'),
      country: searchMap.get('country'),
      productCategory: searchMap.get('productCategory'),
      page,
      pageSize,
    });
    const data = ds.map((d) => {
      const seller = d.seller || {};
      const { seller_name, cover_url: seller_cover_url } = seller;
      return { ...d, seller_name, seller_cover_url };
    });

    ctx.body = {
      data,
      meta: {
        ...meta,
        page,
        pageSize,
      },
    };
  };
}

export function newsBurstMiddeware(plugin: Plugin) {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });
    if (!(resourceName === 'news_burst' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { filter, page, pageSize } = params;
    const $and = filter['$and'];
    ctx.withoutDataWrapping = true;

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
          case 'time_range':
            searchMap.set(propety, kv['$dateOn']);
            break;
          case 'country':
            searchMap.set(propety, kv['id']['$eq']);
            break;
          case 'productCategory':
            searchMap.set(propety, kv['categoryId']['$eq']);
            break;
          default:
            break;
        }
      }
    }
    // console.log(`searchMap:`, searchMap);

    const { data: ds, meta } = await EchoTikAPI.requestNewBurstList({
      time_range: searchMap.get('time_range'),
      country: searchMap.get('country'),
      productCategory: searchMap.get('productCategory'),
      page,
      pageSize,
    });
    const data = ds.map((d) => {
      const seller = d.seller || {};
      const { seller_name, cover_url: seller_cover_url } = seller;
      return { ...d, seller_name, seller_cover_url };
    });

    ctx.body = {
      data,
      meta: {
        ...meta,
        page,
        pageSize,
      },
    };
  };
}

export function influencerMiddeware(plugin: Plugin) {
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
    console.log(`---------[ title ]---------`);
    console.log(`---------[ title ]---------`);
    console.log(`params:`, params);
    console.log(`$and:`, $and);
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
}
