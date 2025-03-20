import type { Plugin } from '@nocobase/server';
import { getUserInfo } from './common';
import { EchoTikAPI } from '../dataCenter';
import { isArray, isNil } from 'lodash';

/**
 * 实施直播相关中间件
 * @param plugin Plugin
 */
export const implementSellerMiddleware = (plugin: Plugin) => {
  const { app } = plugin;
  const { acl } = app;

  acl.use(sellerListMiddeware(plugin));
  acl.use(sellerDetailMiddeware(plugin));
  acl.use(sellerProductListMiddeware(plugin));
  acl.use(sellerInfluencerListMiddeware(plugin));
  acl.use(sellerVideoListMiddeware(plugin));
  acl.use(sellerLiveListMiddeware(plugin));
};

const sellerListMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'seller' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { filter, page, pageSize, sort } = params;
    const $and = filter['$and'];
    // console.log(`params:`, params);
    // console.log(`---------[ sellerListMiddeware ]---------`);
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
            case 'searchConditionLatest30Sales':
            case 'searchConditionTotalSales':
            case 'searchConditionSellerRating':
            case 'searchConditionSellerType':
            case 'searchConditionSellerFlag':
            case 'searchConditionSellerTrendFlag':
            case 'searchConditionIsSShop':
            case 'searchConditionGMV':
            case 'searchConditionRelatedInfluencers':
              propertyValue = kv['$eq'];
              break;
            case 'keyword':
              propertyValue = kv['$includes'];
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

    const { data: ds, meta } = await EchoTikAPI.requestIndependentSellerList({
      searchCondition,
      ...EchoTikAPI.transferNocoSortToEchoSort({ sort }),
      transfer(data) {
        return {
          ...data,
          seller_name: data.seller_name_brief,
          categoryName: data.category,
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

const sellerDetailMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });
    if (!(resourceName === 'seller' && actionName === 'get')) return await next();
    const params = ctx.action.params;
    const { filterByTk: id } = params;
    const data = await EchoTikAPI.requestIndependentSellerDetail({
      id,
      transfer(data) {
        const images = data.images || [];
        const country = data.region;
        const { name: sellerType } = data.sales_flag || {};
        const { name: shipmentType } = data.seller_type || {};
        const { unique_id: tiktokUniqueId } = data.influencer || {};
        const priceRange = `${data.min_price || 0} - ${data.max_price || 0} , 平均价格:${data.price}`;
        return {
          ...data,
          cover_url: images[0],
          country,
          categoryName: data.category,
          sellerType,
          shipmentType,
          tiktokUniqueId,
          priceRange,
        };
      },
    });

    ctx.withoutDataWrapping = true;
    ctx.body = {
      data,
    };
  };
};

const sellerProductListMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'seller.products' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { associatedIndex: sellerId, page, pageSize, sort } = params;

    const { data: ds, meta } = await EchoTikAPI.requestSellerProductList({
      sellerId,
      page,
      pageSize,
      ...EchoTikAPI.transferNocoSortToEchoSort({
        sort,
        orderFieldMapping: {
          total_sale_nd_cnt: 'sold_count',
          total_sale_gmv_nd_amt: 'total_gmv_amt',
          total_video_count: 'videos_count',
          total_live_cnt: 'lives_count',
        },
      }),
      transfer(data) {
        return {
          ...data,
          total_sale_nd_cnt: data.sold_count,
          total_sale_gmv_nd_amt: data.total_gmv_amt,
          total_video_count: data.videos_count,
          total_live_cnt: data.lives_count,
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

const sellerInfluencerListMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'seller.influencers' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { associatedIndex: sellerId, page, pageSize, sort } = params;

    const { data: ds, meta } = await EchoTikAPI.requestSellerInfluencerList({
      sellerId,
      page,
      pageSize,
      ...EchoTikAPI.transferNocoSortToEchoSort({
        sort,
        orderFieldMapping: {
          // total_sale_nd_cnt: 'sold_count',
          // total_sale_gmv_nd_amt: 'total_gmv_amt',
          // total_video_count: 'videos_count',
          // total_live_cnt: 'lives_count',
        },
      }),
      transfer(data) {
        return {
          ...data,
          likes_count: data.heart_count,
          productionCategory: {
            categoryId: data.category_product,
            name: data.category_product,
          },
          // total_sale_nd_cnt: data.sold_count,
          // total_sale_gmv_nd_amt: data.total_gmv_amt,
          // total_video_count: data.videos_count,
          // total_live_cnt: data.lives_count,
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

const sellerVideoListMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'seller.videos' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { associatedIndex: sellerId, page, pageSize, sort } = params;

    const { data: ds, meta } = await EchoTikAPI.requestSellerVideoList({
      sellerId,
      page,
      pageSize,
      ...EchoTikAPI.transferNocoSortToEchoSort({
        sort,
        orderFieldMapping: {
          // total_sale_nd_cnt: 'sold_count',
          // total_sale_gmv_nd_amt: 'total_gmv_amt',
          // total_video_count: 'videos_count',
          // total_live_cnt: 'lives_count',
        },
      }),
      transfer(data) {
        return {
          ...data,
          // likes_count: data.heart_count,
          // total_sale_nd_cnt: data.sold_count,
          // total_sale_gmv_nd_amt: data.total_gmv_amt,
          // total_video_count: data.videos_count,
          // total_live_cnt: data.lives_count,
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

const sellerLiveListMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'seller.lives' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { associatedIndex: sellerId, page, pageSize, sort } = params;

    const { data: ds, meta } = await EchoTikAPI.requestSellerLiveList({
      sellerId,
      page,
      pageSize,
      ...EchoTikAPI.transferNocoSortToEchoSort({
        sort,
        orderFieldMapping: {
          // total_sale_nd_cnt: 'sold_count',
          // total_sale_gmv_nd_amt: 'total_gmv_amt',
          // total_video_count: 'videos_count',
          // total_live_cnt: 'lives_count',
        },
      }),
      transfer(data) {
        return {
          ...data,
          // likes_count: data.heart_count,
          // total_sale_nd_cnt: data.sold_count,
          // total_sale_gmv_nd_amt: data.total_gmv_amt,
          // total_video_count: data.videos_count,
          // total_live_cnt: data.lives_count,
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
