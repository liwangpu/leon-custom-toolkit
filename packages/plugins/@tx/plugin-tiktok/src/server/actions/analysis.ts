import { Plugin } from '@nocobase/server';
import { Context } from '@nocobase/actions';
import { EchoTikAPI } from '../dataCenter';

export const registerAnalysisActions = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.resourceManager.define({
    name: 'analysis',
    actions: {
      influencerTrend: getInfluencerTrend(),
      influencerVideoTrend: getInfluencerVideoTrend(),
      influencerLiveTrend: getInfluencerLiveTrend(),
      influencerSalesTrend: getInfluencerSalesTrend(),
      productTrend: getProductTrend(),
    },
  });
  app.acl.allow('analysis', '*', 'loggedIn');
};

const getInfluencerTrend = () => {
  return async (ctx: Context, next: () => any) => {
    const { influencerId, dateRange } = ctx.request.query as any;
    const { data } = await EchoTikAPI.requestInfluencerTrend({ influencerId, dateRange });
    ctx.withoutDataWrapping = true;
    ctx.body = {
      data,
    };
  };
};

const getInfluencerVideoTrend = () => {
  return async (ctx: Context, next: () => any) => {
    const { influencerId, dateRange } = ctx.request.query as any;
    const { data } = await EchoTikAPI.requestInfluencerVideoTrend({ influencerId, dateRange });
    ctx.withoutDataWrapping = true;
    ctx.body = {
      data,
    };
  };
};

const getInfluencerLiveTrend = () => {
  return async (ctx: Context, next: () => any) => {
    const { influencerId, dateRange } = ctx.request.query as any;
    const { data } = await EchoTikAPI.requestInfluencerLiveTrend({ influencerId, dateRange });
    ctx.withoutDataWrapping = true;
    ctx.body = {
      data,
    };
  };
};

const getInfluencerSalesTrend = () => {
  return async (ctx: Context, next: () => any) => {
    const { influencerId, dateRange } = ctx.request.query as any;
    const { data } = await EchoTikAPI.requestInfluencerSalesTrend({ influencerId, dateRange });
    ctx.withoutDataWrapping = true;
    ctx.body = {
      data,
    };
  };
};

const getProductTrend = () => {
  return async (ctx: Context, next: () => any) => {
    const { id, dateRange } = ctx.request.query as any;
    const { data } = await EchoTikAPI.requestProductTrend({ id, dateRange });
    ctx.withoutDataWrapping = true;
    ctx.body = {
      data,
    };
  };
};
