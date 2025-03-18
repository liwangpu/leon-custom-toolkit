import { isArray, isNil } from 'lodash';
import type { Plugin } from '@nocobase/server';
import { getUserInfo } from './common';
import { EchoTikAPI } from '../dataCenter';

/**
 * 实施产品库相关中间件
 * @param plugin pPlugin
 */
export const implementProductMiddleware = (plugin: Plugin) => {
  const { app } = plugin;
  const { acl } = app;
  acl.use(productListMiddeware(plugin));
  acl.use(influencerDetailMiddleware(plugin));
};

const productListMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'product' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { filter, page, pageSize } = params;
    const $and = filter['$and'];
    console.log(`---------[ productListMiddeware ]---------`);
    console.log(`params:`, params);
    console.log(`$and:`, JSON.stringify($and));
    const searchMap = new Map<string, any>();
    // if (isArray($and)) {
    //   for (const it of $and) {
    //     const propeties = Object.keys(it);

    //     for (const propety of propeties) {
    //       const kv = it[propety];
    //       // console.log(`propety:`, propety);
    //       // console.log(`kv:`, kv);
    //       switch (propety) {
    //         case 'keyword':
    //           searchMap.set(propety, kv['$includes']);
    //           break;
    //         case 'search_followers_count':
    //           searchMap.set(propety, kv['$eq']);
    //           break;
    //         case 'search_digg_count':
    //           searchMap.set(propety, kv['$eq']);
    //           break;
    //         case 'sales_flag':
    //           searchMap.set(propety, kv['$isTruly']);
    //           break;
    //         case 'is_live':
    //           searchMap.set(propety, kv['$isTruly']);
    //           break;
    //         case 'country':
    //           searchMap.set(propety, kv['id']['$eq']);
    //           break;
    //         case 'productionCategory':
    //           searchMap.set(propety, kv['categoryId']['$eq']);
    //           break;
    //         default:
    //           break;
    //       }
    //     }
    //   }
    // }
    console.log(`searchMap:`, searchMap);
    const { data: ds, meta } = await EchoTikAPI.requestProductList({
      keyword: searchMap.get('keyword'),
      country: searchMap.get('country'),
      // salesFlag: searchMap.get('sales_flag'),
      // isLive: searchMap.get('is_live'),
      // productCategory: searchMap.get('productionCategory'),
      // followersCount: searchMap.get('search_followers_count'),
      // diggCount: searchMap.get('search_digg_count'),
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

const influencerDetailMiddleware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });
    if (!(resourceName === 'product' && actionName === 'get')) return await next();
    const params = ctx.action.params;
    const { filterByTk: id } = params;
    const data = await EchoTikAPI.requestProductDetail({
      id,
      transfer(data) {
        const salesFlagName = data.sales_flag?.name;
        const seller: Record<string, any> = data.seller || {};
        const images: Array<string> = data.images || [];
        return {
          ...data,
          categoryName: data.category,
          avg_price: data.price,
          cover_url: images[0],
          commentCount: data.review_count,
          total_sale_cnt: data.sale_cnt,
          total_sale_gmv_amt: data.gmv_amt,
          influencers_count: data.total_ifl_cnt,
          total_video_count: data.total_video_cnt,
          sales_flag: salesFlagName,
          seller_name: seller.seller_name,
          seller_id: seller.seller_id,
        };
      },
    });

    ctx.withoutDataWrapping = true;
    ctx.body = {
      data,
    };
  };
};
