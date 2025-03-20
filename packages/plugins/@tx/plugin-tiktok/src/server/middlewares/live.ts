import type { Plugin } from '@nocobase/server';
import { getUserInfo } from './common';
import { EchoTikAPI } from '../dataCenter';
import { isArray, isNil } from 'lodash';

/**
 * 实施直播相关中间件
 * @param plugin Plugin
 */
export const implementLiveMiddleware = (plugin: Plugin) => {
  const { app } = plugin;
  const { acl } = app;

  acl.use(liveListMiddeware(plugin));
  acl.use(liveDetailMiddeware(plugin));
  acl.use(liveDetailProductMiddeware(plugin));
};

const liveListMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'influencer_live' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { filter, page, pageSize, sort } = params;
    const $and = filter['$and'];
    // console.log(`params:`, params);
    // console.log(`$and:`, JSON.stringify($and));
    const searchCondition = new Map<string, any>();
    if (isArray($and)) {
      for (const it of $and) {
        const propeties = Object.keys(it);

        for (const propety of propeties) {
          const kv = it[propety];
          console.log(`propety:`, propety);
          console.log(`kv:`, kv);
          let propertyValue: any;
          switch (propety) {
            case 'searchConditionFollowerCount':
            case 'searchConditionSales':
              propertyValue = kv['$eq'];
              break;
            case 'keyword':
              propertyValue = kv['$includes'];
              break;
            case 'searchConditionIsSale':
            case 'searchConditionIsLiving':
              propertyValue = kv['$isTruly'];
              break;
            case 'productCategory':
              propertyValue = kv['categoryId']['$eq'];
              break;
            case 'influencerCategory':
              propertyValue = kv['key']['$eq'];
              break;
            case 'country':
              propertyValue = kv['id']['$eq'];
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

    const { data: ds, meta } = await EchoTikAPI.requestIndependentLiveList({
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

const liveDetailMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });
    if (!(resourceName === 'influencer_live' && actionName === 'get')) return await next();
    const params = ctx.action.params;
    const { filterByTk: id } = params;
    const data = await EchoTikAPI.requestIndependentLiveDetail({
      id,
      transfer(data) {
        return {
          ...data,
          live_id: id,
          start_time: data.create_time_f,
          end_time: data.finish_time_f,
          country: data.region,
          searchConditionIsLiving: data.status?.key === 'on',
        };
      },
    });

    ctx.withoutDataWrapping = true;
    ctx.body = {
      data,
    };
  };
};

const liveDetailProductMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'influencer_live.product' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { associatedIndex: liveId, page, pageSize, sort } = params;

    const { data: ds, meta } = await EchoTikAPI.requestLiveDetailProductList({
      liveId,
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
