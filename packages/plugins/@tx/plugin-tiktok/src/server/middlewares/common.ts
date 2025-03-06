import { isNil, pick } from 'lodash';
import { Context } from '@nocobase/actions';
import axios from 'axios';
import { Plugin } from '@nocobase/server';
import dayjs from 'dayjs';

/**
 * 获取当前用户信息
 * @param ctx 必须是middlewares中的ctx
 * @returns
 */
export function getUserInfo(props: { ctx: any }) {
  const { ctx } = props;
  const { currentUser, currentRole } = ctx.state || {};
  if (isNil(currentUser)) {
    return {};
  }
  const { organizationId, roles } = currentUser || { roles: [], organizationId: null };
  // const rolesSet = new Set(roles.map((r) => r.name));
  const isRootOrAdmin = currentRole === 'root' || currentRole === 'admin';
  const isOrganizationAdminUser = currentRole === 'organizationAdmin';
  const isOrganizationUser = currentRole === 'organizationAdmin';
  const { resourceName, actionName } = ctx.action;
  return {
    userId: currentUser.id,
    organizationId,
    isRootOrAdmin,
    isOrganizationAdminUser,
    isOrganizationUser,
    resourceName,
    actionName,
  };
}

export function serverRequest(props: { url: string; method?: string; ctx?: Context; data?: any; params?: any }) {
  const appPort = process.env['APP_PORT'] ? parseInt(process.env['APP_PORT']) : 13000;
  const serverBaseUrl = `http://127.0.0.1:${appPort}/api`;
  const commonHeader = ['content-type', 'accept', 'authorization', 'x-app', 'x-authenticator', 'x-timezone', 'x-role'];

  const { url, method, data, params, ctx } = props;
  const headers = ctx ? pick(ctx.request.headers, commonHeader) : {};
  return axios.request({
    url: `${serverBaseUrl}/${url}`,
    method: method || 'POST',
    headers,
    params,
    data,
  });
}

export const EchoTikAPI = (() => {
  let plugin: Plugin;

  const echoTipAPIBase = `https://echotik.live/api/v1/data`;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const startup = (props: { plugin: Plugin }) => {
    plugin = props.plugin;
  };

  const getCountryRegion = async (countryId: number) => {
    const { db } = plugin;
    const countryRep = db.getRepository('country');
    const country = await countryRep.findByTargetKey(countryId);
    if (!country) return null;
    return country.region;
  };

  const getToken = async () => {
    const { db } = plugin;
    const configSettingRep = db.getRepository('configSetting');
    const setting = await configSettingRep.findByTargetKey('echoTikToken');
    const { value } = setting.value;
    return value;
  };

  const getTimeRange = (timeType: string) => {
    const currentTime = dayjs();
    switch (timeType) {
      case 'monthly':
        // eslint-disable-next-line no-case-declarations
        const lastMonth = currentTime.add(-1, 'month');
        return `${lastMonth.startOf('month').format('YYYYMMDD')}-${lastMonth.endOf('month').format('YYYYMMDD')}`;
      case 'weekly':
        // eslint-disable-next-line no-case-declarations
        const lastWeek = currentTime.add(-1, 'week');
        return `${lastWeek.startOf('week').add(1, 'day').format('YYYYMMDD')}-${lastWeek.endOf('week').add(1, 'day').format('YYYYMMDD')}`;
      default:
        return currentTime.add(-1, 'd').format('YYYYMMDD');
    }
  };

  /**
   * 热门话题
   * @param props
   */
  const requestTopHashTagList = async (props: {
    time_type: string;
    country: number;
    page: number;
    pageSize: number;
  }) => {
    const { time_type, country, page, pageSize } = props;
    // const urlBase = `https://echotik.live/api/v1/data/tags/leaderboard/top-hashtag?time_type=monthly&time_range=20250201-20250228&page=1&per_page=20`;
    const url = `${echoTipAPIBase}/tags/leaderboard/top-hashtag`;

    const token = await getToken();
    const region = await getCountryRegion(country);
    const timeRange = getTimeRange(time_type);
    const params: any = {
      page,
      per_page: pageSize,
      time_type,
      time_range: timeRange,
    };

    const { data: res } = await axios.request({
      url,
      method: 'GET',
      headers: {
        Authorization: token,
        'x-region': region,
      },
      params,
    });

    const { total, last_page } = res.meta;

    const meta = {
      count: total,
      totalPage: last_page,
    };

    return {
      data: res.data,
      meta,
    };
  };

  const requestTopVideoList = async (props: {
    time_type: string;
    country: number;
    influencerCategory: string;
    page: number;
    pageSize: number;
  }) => {
    // const url = `https://echotik.live/api/v1/data/videos/leaderboard/top-videos?time_type=weekly&time_range=20250224-20250302&page=1&influencer_categories=Beauty&product_categories=&per_page=20`;
    const { time_type, country, influencerCategory, page, pageSize } = props;
    const url = `${echoTipAPIBase}/videos/leaderboard/top-videos`;

    const token = await getToken();
    const region = await getCountryRegion(country);
    const timeRange = getTimeRange(time_type);
    const params: any = {
      page,
      per_page: pageSize,
      time_type,
      time_range: timeRange,
    };

    if (influencerCategory !== 'All') {
      params.influencer_categories = influencerCategory;
    }

    const { data: res } = await axios.request({
      url,
      method: 'GET',
      headers: {
        Authorization: token,
        'x-region': region,
      },
      params,
    });

    const { total, last_page } = res.meta;

    const meta = {
      count: total,
      totalPage: last_page,
    };

    return {
      data: res.data,
      meta,
    };
  };

  const requestTopFollowerList = async (props: {
    time_type: string;
    country: number;
    influencerCategory: string;
    page: number;
    pageSize: number;
  }) => {
    // const url = `https://echotik.live/api/v1/data/influencers/leaderboard/followers?time_type=weekly&time_range=20250224-20250302&page=1&influencer_role=&influencer_categories=&product_categories=&per_page=20`;
    const { time_type, country, influencerCategory, page, pageSize } = props;
    const url = `${echoTipAPIBase}/influencers/leaderboard/followers`;

    const token = await getToken();
    const region = await getCountryRegion(country);
    const timeRange = getTimeRange(time_type);
    const params: any = {
      page,
      per_page: pageSize,
      time_type,
      time_range: timeRange,
    };

    if (influencerCategory !== 'All') {
      params.influencer_categories = influencerCategory;
    }

    const { data: res } = await axios.request({
      url,
      method: 'GET',
      headers: {
        Authorization: token,
        'x-region': region,
      },
      params,
    });

    const { total, last_page } = res.meta;

    const meta = {
      count: total,
      totalPage: last_page,
    };

    return {
      data: res.data,
      meta,
    };
  };

  const requestTopSoldList = async (props: {
    time_type: string;
    country: number;
    productCategory: string;
    page: number;
    pageSize: number;
  }) => {
    // const url = `https://echotik.live/api/v1/data/products/leaderboard/top-sold?time_type=daily&time_range=20250305&page=1&product_categories=601739&order=sale_cnt&per_page=20`;
    const { time_type, country, productCategory, page, pageSize } = props;
    const url = `${echoTipAPIBase}/products/leaderboard/top-sold`;

    const token = await getToken();
    const region = await getCountryRegion(country);
    const timeRange = getTimeRange(time_type);
    const params: any = {
      page,
      per_page: pageSize,
      time_type,
      time_range: timeRange,
      order: 'sale_cnt',
    };

    if (productCategory !== 'All') {
      params.product_categories = productCategory;
    }

    const { data: res } = await axios.request({
      url,
      method: 'GET',
      headers: {
        Authorization: token,
        'x-region': region,
      },
      params,
    });

    const { total, last_page } = res.meta;

    const meta = {
      count: total,
      totalPage: last_page,
    };

    return {
      data: res.data as Array<any>,
      meta,
    };
  };

  const requestHotSellList = async (props: {
    time_type: string;
    country: number;
    productCategory: string;
    page: number;
    pageSize: number;
  }) => {
    // const url = `https://echotik.live/api/v1/data/products/leaderboard/hot-sell?time_type=daily&time_range=20250305&page=1&product_categories=&per_page=20`;
    const { time_type, country, productCategory, page, pageSize } = props;
    const url = `${echoTipAPIBase}/products/leaderboard/hot-sell`;

    const token = await getToken();
    const region = await getCountryRegion(country);
    const timeRange = getTimeRange(time_type);
    const params: any = {
      page,
      per_page: pageSize,
      time_type,
      time_range: timeRange,
    };

    if (productCategory !== 'All') {
      params.product_categories = productCategory;
    }

    const { data: res } = await axios.request({
      url,
      method: 'GET',
      headers: {
        Authorization: token,
        'x-region': region,
      },
      params,
    });

    const { total, last_page } = res.meta;

    const meta = {
      count: total,
      totalPage: last_page,
    };

    return {
      data: res.data as Array<any>,
      meta,
    };
  };

  const requestNewBurstist = async (props: {
    time_range: string;
    country: number;
    productCategory: string;
    page: number;
    pageSize: number;
  }) => {
    // const url = `https://echotik.live/api/v1/data/products/leaderboard/news-burst?time_type=daily&time_range=20250228&page=1&product_categories=&order=total_sale_gmv_7d_amt&per_page=20`;
    const { time_range, country, productCategory, page, pageSize } = props;
    const url = `${echoTipAPIBase}/products/leaderboard/news-burst`;

    const token = await getToken();
    const region = await getCountryRegion(country);
    const params: any = {
      page,
      per_page: pageSize,
      time_type: 'daily',
      time_range: dayjs(time_range).format('YYYYMMDD'),
      order: 'total_sale_gmv_7d_amt',
    };

    if (productCategory !== 'All') {
      params.product_categories = productCategory;
    }

    const { data: res } = await axios.request({
      url,
      method: 'GET',
      headers: {
        Authorization: token,
        'x-region': region,
      },
      params,
    });

    const { total, last_page } = res.meta;

    const meta = {
      count: total,
      totalPage: last_page,
    };

    return {
      data: res.data as Array<any>,
      meta,
    };
  };

  return {
    startup,
    requestTopHashTagList,
    requestTopVideoList,
    requestTopFollowerList,
    requestTopSoldList,
    requestHotSellList,
    requestNewBurstist,
  };
})();
