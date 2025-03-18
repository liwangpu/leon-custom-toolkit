import type { Plugin } from '@nocobase/server';
import { getUserInfo } from './common';
import { EchoTikAPI } from '../dataCenter';
import { isArray, isNil } from 'lodash';

/**
 * 实施产品库相关中间件
 * @param plugin pPlugin
 */
export const implementProductMiddleware = (plugin: Plugin) => {
  const { app } = plugin;
  const { acl } = app;
  acl.use(productListMiddeware(plugin));
  acl.use(productDetailMiddleware(plugin));
  acl.use(productInfluencerListMiddeware(plugin));
  acl.use(productVideoListMiddeware(plugin));
  acl.use(productLiveListMiddeware(plugin));
  acl.use(productCompetitorListMiddeware(plugin));
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
            case 'saleType':
            case 'sales':
            case 'searchConditionGMVType':
            case 'searchConditionGMV':
            case 'searchConditionPrice':
            case 'searchConditionCommissionRate':
            case 'searchConditionInfluencerCount':
            case 'searchConditionVideoCount':
            case 'searchConditionVideoViewCount':
            case 'searchConditionCommentCount':
            case 'searchConditionProductRating':
            case 'searchConditionSalesFlag':
            case 'searchConditionSalesTrendFlag':
            case 'searchConditionIsSShop':
              propertyValue = kv['$eq'];
              break;
            case 'keyword':
              propertyValue = kv['$includes'];
              break;
            case 'category':
              propertyValue = kv['categoryId']['$eq'];
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
    const { data: ds, meta } = await EchoTikAPI.requestProductList({
      searchCondition,
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

const productDetailMiddleware = (plugin: Plugin) => {
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

const productInfluencerListMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'product.salesInfluencer' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { associatedIndex: productId, page, pageSize, sort } = params;

    const { data: ds, meta } = await EchoTikAPI.requestProductSalesInfluencerList({
      productId,
      page,
      pageSize,
      ...EchoTikAPI.transferNocoSortToEchoSort({
        sort,
        defaultOrder: 'follower_count',
        defaultSort: 'desc',
        orderFieldMapping: {
          likes_count: 'heart_count',
          views_per_video: 'total_video_viewers',
        },
      }),
      transfer(data) {
        return {
          ...data,
          likes_count: data.heart_count,
          // 用视频数替代带货视频数字段
          video_count: data.related_video,
          // 用总平均视频播放量替代视频总播放数
          views_per_video: data.total_video_viewers,
          total_live_count: data.related_live,
          productionCategory: {
            name: data.category_product,
          },
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

const productVideoListMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'product.salesVideo' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { associatedIndex: productId, page, pageSize, sort } = params;

    const { data: ds, meta } = await EchoTikAPI.requestProductSalesVideoList({
      productId,
      page,
      pageSize,
      ...EchoTikAPI.transferNocoSortToEchoSort({
        sort,
        defaultOrder: 'gmv',
        defaultSort: 'desc',
        orderFieldMapping: {
          // likes_count: 'heart_count',
        },
      }),
      transfer(data) {
        return {
          ...data,
          // likes_count: data.heart_count,
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

const productLiveListMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'product.influencerLive' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { associatedIndex: productId, page, pageSize, sort } = params;

    const { data: ds, meta } = await EchoTikAPI.requestProductLiveVideoList({
      productId,
      page,
      pageSize,
      ...EchoTikAPI.transferNocoSortToEchoSort({
        sort,
        defaultOrder: 'product_gmv_amt',
        defaultSort: 'desc',
        orderFieldMapping: {
          // likes_count: 'heart_count',
        },
      }),
      transfer(data) {
        return {
          ...data,
          // likes_count: data.heart_count,
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

const productCompetitorListMiddeware = (plugin: Plugin) => {
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });

    if (!(resourceName === 'product.competitorProduct' && actionName === 'list')) return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { associatedIndex: productId, page, pageSize } = params;

    const { data: ds, meta } = await EchoTikAPI.requestProductCompetitorVideoList({
      productId,
      page,
      pageSize,
      transfer(data) {
        return {
          ...data,
          total_live_cnt: data.total_live_count,
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
