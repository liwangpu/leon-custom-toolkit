import { Context } from '@nocobase/actions';
import { isNil } from 'lodash';
import { Plugin } from '@nocobase/server';
import { EchoTikAPI } from '../dataCenter';
import { parseListFilterCondition } from '../utils';

export const registerHashTagActions = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.resourceManager.define({
    name: 'hashtags',
    actions: {
      get: getAction(),
      list: listAction(),
      latestTrending: latestTrendingAction(),
    },
  });

  app.acl.allow('hashtags', '*', 'loggedIn');

  app.resourceManager.define({
    name: 'hashtags.videos',
    actions: {
      list: videoListAction(),
    },
  });
  app.acl.allow('hashtags.videos', '*', 'loggedIn');
};

const listAction = () => {
  return async (ctx: Context, next: () => any) => {
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { filter, page, pageSize, sort } = params;
    // console.log(`---------[ hashTagListMiddeware ]---------`);
    // console.log(`params:`, params);

    // console.log(`filter:`, JSON.stringify(filter));

    const searchCondition = await parseListFilterCondition({
      filter,
      async parseFn(condition, add) {
        // console.log(`condition:`, condition);
        const propeties = Object.keys(condition);

        for (const propety of propeties) {
          const kv = condition[propety];
          // console.log(`propety:`, propety);
          // console.log(`kv:`, kv);
          switch (propety) {
            case 'tag_title':
              add(propety, kv['$includes']);
              break;
            case 'searchConditionViewCount':
            case 'searchConditionDiggCount':
              add(propety, kv['$eq']);
              break;
            case 'country':
              add(propety, kv['id']['$eq']);
              break;
            default:
              break;
          }
        }
      },
    })();

    const orderFieldMapping: Record<string, any> = {};

    // console.log(`searchCondition:`, searchCondition);
    const { data: ds, meta } = await EchoTikAPI.requestHashTagList({
      searchCondition,
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

const getAction = () => {
  return async (ctx: Context, next: () => any) => {
    const params = ctx.action.params;
    const { filterByTk: dataId } = params;
    const data = await EchoTikAPI.requestHasTagDetail({ dataId });
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

const latestTrendingAction = () => {
  return async (ctx: Context, next: () => any) => {
    const params = ctx.action.params;
    const { id } = params;
    const data = await EchoTikAPI.requestHashTagsTrend({ id });
    ctx.withoutDataWrapping = true;
    ctx.body = data;
  };
};

const videoListAction = () => {
  return async (ctx: Context, next: () => any) => {
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { associatedIndex: tagId, filter, page, pageSize, sort } = params;

    const { data: ds, meta } = await EchoTikAPI.requestHashTagVideoList({
      tagId,
      page,
      pageSize,
      ...EchoTikAPI.transferNocoSortToEchoSort({ sort, orderFieldMapping: {} }),
    });

    ctx.withoutDataWrapping = true;
    ctx.body = {
      data: ds,
      meta,
    };
  };
};
