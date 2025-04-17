import axios, { AxiosInstance } from 'axios';
import { Plugin } from '@nocobase/server';
import dayjs from 'dayjs';
import { isArray, isFunction, isNil, isNumber, isString } from 'lodash';
import { formatEnglishNumber } from '../utils';

export type IEchoSort = 'asc' | 'desc';
export const EchoTikAPI = (() => {
  let plugin: Plugin;

  const echoTipAPIBase = `https://echotik.live/api/v1/data`;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const getAxiosInstance = (() => {
    let _axiosInstance: AxiosInstance;
    const baseURL = `https://echotik.live/api/v1/data`;

    return async () => {
      if (!isNil(_axiosInstance)) return _axiosInstance;
      const token = await getToken();
      _axiosInstance = axios.create({
        baseURL,
        // timeout单位ms
        timeout: 1000 * 60 * 3,
        headers: {
          Authorization: token,
          'x-lang': 'zh-CN',
        },
      });
      return _axiosInstance;
    };
  })();

  const startup = (props: { plugin: Plugin }) => {
    plugin = props.plugin;
  };

  const genMeta = (props: { page: number; pageSize: number; resData: any }) => {
    const { resData, pageSize, page } = props;
    const { total, last_page } = resData.meta || { total: 0, last_page: 1 };

    const meta = {
      page,
      pageSize,
      count: total,
      totalPage: last_page,
    };
    return meta;
  };

  const getCountryRegion = async (countryId: number) => {
    const { db } = plugin;
    const countryRep = db.getRepository('country');
    const country = await countryRep.findByTargetKey(countryId);
    if (!country) return null;
    return country.region;
  };

  const getCountryByKey = (() => {
    let map: Map<string, any>;
    return async (key: string) => {
      if (isNil(key)) return;
      if (isNil(map)) {
        const { db } = plugin;
        map = new Map<string, any>();
        const countryRep = db.getRepository('country');
        const records: Array<any> = await countryRep.find({});
        for (const r of records) {
          const v = r.dataValues;
          map.set(v.region, v);
        }
      }
      return map.get(key);
    };
  })();

  const getInfluencerCategoryByKey = (() => {
    let map: Map<string, { id: string; name: string; name_slug: string }>;
    return async (key: string) => {
      if (isNil(key)) return;
      if (isNil(map)) {
        const { db } = plugin;
        map = new Map();
        const countryRep = db.getRepository('influencer_category');
        const records: Array<any> = await countryRep.find({});
        for (const r of records) {
          const v = r.dataValues;
          map.set(v.key, v);
        }
      }
      return map.get(key);
    };
  })();

  const getToken = async () => {
    const { db } = plugin;
    const configSettingRep = db.getRepository('configSetting');
    const setting = await configSettingRep.findByTargetKey('echoTikToken');
    const { value } = setting.value;
    return value;
  };

  /**
   * 解析noco查询中间件参数中的排序转换成echo排序参数
   * @param params params
   */
  const transferNocoSortToEchoSort = (params: {
    sort?: string[];
    defaultOrder?: string;
    defaultSort?: 'asc' | 'desc';
    orderFieldMapping?: Record<string, string>;
  }) => {
    const { sort: sortArr, defaultOrder, defaultSort, orderFieldMapping } = params;
    let order: string = defaultOrder;
    let sort: 'asc' | 'desc' = defaultSort;
    if (isArray(sortArr)) {
      let first: string = sortArr[0];
      if (first[0] === '-') {
        first = first.slice(1);
        sort = 'desc';
      } else {
        sort = 'asc';
      }
      order = first;
    }
    if (!isNil(orderFieldMapping) && !isNil(orderFieldMapping[order])) {
      order = orderFieldMapping[order];
    }
    return {
      order,
      sort,
    };
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

  /**
   * 带货达人榜
   * @param props
   * @returns
   */
  const requestChampionSalesList = async (props: {
    time_type: string;
    country: number;
    productCategory: string;
    page: number;
    pageSize: number;
  }) => {
    // https://echotik.live/api/v1/data/influencers/leaderboard/champion-sales?time_type=weekly&time_range=20250407-20250413&page=1&influencer_role=2&influencer_categories=&product_categories=&per_page=20;
    const { time_type, country, productCategory, page, pageSize } = props;
    const url = `${echoTipAPIBase}/influencers/leaderboard/champion-sales?`;

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

    const meta = genMeta({ resData: res, page, pageSize });

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

  const requestNewBurstList = async (props: {
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

  const requestInfluencerList = async (props: {
    page: number;
    pageSize: number;
    keyword?: string;
    country?: number;
    salesFlag?: boolean;
    isLive?: boolean;
    productCategory?: string;
    influencerCategory?: string;
    followersCount?: string;
    diggCount?: string;
    searchConditionUid?: string;
    time_type?: string;
    order?: string;
    sort?: IEchoSort;
  }) => {
    const {
      keyword,
      country,
      salesFlag,
      isLive,
      productCategory,
      influencerCategory,
      followersCount,
      diggCount,
      searchConditionUid,
      time_type,
      page,
      pageSize,
      order,
      sort,
    } = props;
    // const url=`https://echotik.live/api/v1/data/influencers?page=1&per_page=&influencer_categories=&product_categories=&show_case=&is_email=&order=follower_30d_count&sort=desc&keyword=`;
    let url = `${echoTipAPIBase}/influencers`;
    const region = await getCountryRegion(country);

    const instance = await getAxiosInstance();

    const transfers: Array<(item: Record<string, any>) => void> = [];

    const params: Record<string, any> = {
      page,
      per_page: pageSize,
      product_categories: productCategory,
      keyword,
      time_type,
      influencer_categories: influencerCategory,
      followers_count: followersCount,
      likes_count: diggCount,
      order,
      sort,
    };
    if (salesFlag) {
      params['sales_flag'] = 1;
    }
    if (isLive) {
      params['is_live'] = 1;
    }

    if (!isNil(searchConditionUid)) {
      switch (searchConditionUid) {
        case '带货达人榜':
          {
            // https://echotik.live/api/v1/data/influencers/leaderboard/champion-sales?time_type=weekly&time_range=20250407-20250413&page=1&influencer_role=2&influencer_categories=&product_categories=&per_page=20
            url = `${echoTipAPIBase}/influencers/leaderboard/champion-sales`;
            params['time_range'] = getTimeRange(time_type);
            transfers.push((item) => {
              const categoryName: string = item.category_product;
              if (!isNil(categoryName)) {
                item['productionCategory'] = {
                  categoryId: categoryName,
                  name: categoryName,
                };
              }
              item['influencer_name'] = item.nick_name;
              item['sales'] = item.total_sales_cnt;
              item['product_ifl_gmv_amt'] = item.total_gmv_amt;
              item['video_count'] = item.total_post_video_cnt;
              item['follower_count'] = item.total_followers_cnt;
            });
          }
          break;
        case '飙升达人榜':
          {
            // https://echotik.live/api/v1/data/influencers/leaderboard/followers-increment?time_type=daily&time_range=20250415&page=1&influencer_role=&influencer_categories=&product_categories=&order=total_followers_increment&per_page=20
            url = `${echoTipAPIBase}/influencers/leaderboard/followers-increment`;
            params['time_range'] = getTimeRange(time_type);
            transfers.push((item) => {
              const categoryName: string = item.category;
              if (!isNil(categoryName)) {
                item['influencerCategory'] = {
                  categoryId: categoryName,
                  name: categoryName,
                };
              }
              item['influencer_name'] = item.nick_name;
              item['follower_count'] = item.total_followers_cnt;
            });
          }
          break;
        case '直播带货达人榜':
          {
            // https://echotik.live/api/v1/data/influencers/leaderboard/hot-live?time_type=monthly&time_range=20250301-20250331&page=1&influencer_role=&influencer_categories=&product_categories=&order=total_live_cnt&per_page=20
            url = `${echoTipAPIBase}/influencers/leaderboard/hot-live`;
            params['time_range'] = getTimeRange(time_type);
            transfers.push((item) => {
              const categoryName: string = item.category_product;
              if (!isNil(categoryName)) {
                item['productionCategory'] = {
                  categoryId: categoryName,
                  name: categoryName,
                };
              }
              item['influencer_name'] = item.nick_name;
              item['total_live_count'] = item.total_live_cnt;
              item['sales'] = item.total_live_sale_cnt;
              item['product_ifl_gmv_amt'] = item.total_live_gmv_amt;
            });
          }
          break;
        default:
          break;
      }
    }
    console.log(`params:`, params);
    const { data: res } = await instance.request({
      url,
      method: 'GET',
      headers: {
        'x-region': region,
      },
      params,
    });

    const meta = genMeta({ resData: res, page, pageSize });

    return {
      data: (res.data as Array<any>).map((item) => {
        for (const transfer of transfers) {
          transfer(item);
        }
        return item;
      }),
      meta,
    };
  };

  const requestInfluencerDetail = async (props: { influencerId: string }) => {
    const { influencerId } = props;
    const instance = await getAxiosInstance();
    const {
      data: { data, msg, code },
    } = (await instance.request({
      url: `/influencers/${influencerId}`,
    })) as any;

    const { id: countryKey } = data.region || {};
    let country;
    if (!isNil(countryKey)) {
      country = await getCountryByKey(countryKey);
    }

    return {
      ...data,
      video_count: data.videos_count,
      follower_count: data.followers_count,
      view_count: data.views,
      country,
    };
  };

  const requestInfluencerVideoList = async (props: {
    influencerId: string;
    page: number;
    pageSize: number;
    order?: string;
    sort?: IEchoSort;
  }) => {
    const { influencerId, page, pageSize, order, sort } = props;
    // https://echotik.live/api/v1/data/influencers/127905465618821121/videos?page=1&per_page=12&is_sale=&sort=desc&order=publish_time
    const instance = await getAxiosInstance();
    const { data: res } = (await instance.request({
      url: `/influencers/${influencerId}/videos`,
      params: {
        page,
        per_page: pageSize,
        order: order || 'publish_time',
        sort,
      },
    })) as any;
    const meta = genMeta({ resData: res, page, pageSize });

    return {
      data: res.data as Array<any>,
      meta,
    };
  };

  const requestInfluencerLiveList = async (props: { influencerId: string; page: number; pageSize: number }) => {
    const { influencerId, page, pageSize } = props;
    // https://echotik.live/api/v1/data/influencers/21609287/lives?page=1&per_page=10&sort=asc&order=viewers_count
    const instance = await getAxiosInstance();
    const { data: res } = (await instance.request({
      url: `/influencers/${influencerId}/lives`,
      params: {
        page,
        per_page: pageSize,
        order: 'viewers_count',
      },
    })) as any;
    const meta = genMeta({ resData: res, page, pageSize });

    return {
      data: res.data as Array<any>,
      meta,
    };
  };

  const requestInfluencerProductList = async (props: {
    influencerId: string;
    page: number;
    pageSize: number;
    order?: string;
    sort?: IEchoSort;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { influencerId, page, pageSize, order, sort, transfer } = props;
    // https://echotik.live/api/v1/data/influencers/21609287/products?order=avg_price&sort=desc&page=1&per_page=10&product_categories=601352
    const instance = await getAxiosInstance();
    const { data: res } = (await instance.request({
      url: `/influencers/${influencerId}/products`,
      params: {
        page,
        per_page: pageSize,
        order: order || 'avg_price',
        sort,
      },
    })) as any;
    const meta = genMeta({ resData: res, page, pageSize });
    const datas = res.data as Array<any>;
    return {
      data: isFunction(transfer) ? datas.map((d) => transfer(d)) : datas,
      meta,
    };
  };

  const formatEnNumberFormat = (arr: Array<{ value: number }>) => {
    if (!(isArray(arr) && arr.length > 0)) return arr;
    return arr.map((d) => {
      let v = d.value;
      if (isNumber(v)) {
        v = formatEnglishNumber(v) as any;
      }
      return {
        ...d,
        value: v,
      };
    });
  };

  // // 把这种离散的数组内容合成双轴图
  // [
  //   {
  //     "legend": "粉丝数",
  //     "axis_x": "2025-03-31",
  //     "axis_y": 13401103,
  //     "axis_y_f": "13.40M"
  //   },
  //   {
  //     "legend": "粉丝增长",
  //     "axis_x": "2025-03-31",
  //     "axis_y": 24056,
  //     "axis_y_f": "24.06K"
  //   },
  //   ...
  // ]
  const mergeDualAxesDataFromArray = (props: {
    datas: any[];
    xAxisProperty: string;
    yAxisProperty: string;
    legendProperty: string;
    xAxisPropertyAlias?: string;
    xAxisPropertyDataOnlyMS?: boolean;
  }) => {
    const { datas, xAxisProperty, xAxisPropertyAlias, yAxisProperty, legendProperty, xAxisPropertyDataOnlyMS } = props;

    const dsMap = new Map<string, Record<string, any>>();
    for (const it of datas) {
      const xAxisValue: string = it[xAxisProperty];
      const date = xAxisPropertyDataOnlyMS ? xAxisValue.slice(5) : xAxisValue;
      const rc = dsMap.get(date) || {};
      const xAxisAlias = xAxisPropertyAlias || xAxisProperty;
      rc[xAxisAlias] = date;
      const legendValue = it[legendProperty];
      rc[legendValue] = it[yAxisProperty];
      dsMap.set(date, rc);
    }
    return [...dsMap.values()];
  };

  const requestInfluencerTrend = async (props: { influencerId: string; dateRange: number }) => {
    const { influencerId, dateRange } = props;
    // https://echotik.live/api/v1/data/influencers/21609287/products?order=avg_price&sort=desc&page=1&per_page=10&product_categories=601352
    const instance = await getAxiosInstance();
    const data: Record<string, any> = {};

    const url = `/influencers/${influencerId}/analysis`;

    const requestBasicOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        params: {
          tag: 'basic.overview',
          dateRange,
        },
      })) as any;

      const ds: Array<any> = res.data;
      data['basic.overview'] = formatEnNumberFormat(ds);
    };

    const requestSaleOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        params: {
          tag: 'basic.sale.overview',
          dateRange,
        },
      })) as any;

      const ds: Array<any> = res.data?.basic?.video;
      data['basic.sale.overview'] = formatEnNumberFormat(ds);
    };

    const requestVideoOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        params: {
          tag: 'basic.video.overview',
          dateRange,
        },
      })) as any;

      const record: Record<string, any> = res.data;
      data['basic.video.overview'] = record;
    };

    const requestLiveOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        params: {
          tag: 'basic.live.overview',
          dateRange,
        },
      })) as any;

      const record: Record<string, any> = res.data;
      data['basic.live.overview'] = record;
    };

    const requestFollowerOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        params: {
          tag: 'basic.follower.trending',
          dateRange,
        },
      })) as any;

      data['basic.follower.trending'] = mergeDualAxesDataFromArray({
        datas: res.data,
        xAxisProperty: 'axis_x',
        yAxisProperty: 'axis_y',
        legendProperty: 'legend',
        xAxisPropertyAlias: '日期',
        xAxisPropertyDataOnlyMS: true,
      });
    };

    const requestDiggOverview = async () => {
      const tag = 'basic.digg.trending';
      const { data: res } = (await instance.request({
        url,
        params: {
          tag,
          dateRange,
        },
      })) as any;

      data[tag] = mergeDualAxesDataFromArray({
        datas: res.data,
        xAxisProperty: 'axis_x',
        yAxisProperty: 'axis_y',
        legendProperty: 'legend',
        xAxisPropertyAlias: '日期',
        xAxisPropertyDataOnlyMS: true,
      });
    };

    await Promise.all([
      requestBasicOverview(),
      requestSaleOverview(),
      requestVideoOverview(),
      requestLiveOverview(),
      requestFollowerOverview(),
      requestDiggOverview(),
    ]);

    return {
      data,
    };
  };

  const requestInfluencerVideoTrend = async (props: { influencerId: string; dateRange: number }) => {
    const { influencerId, dateRange } = props;
    // https://echotik.live/api/v1/data/influencers/7026015251758613509/analysis?tag=video.overview&dateRange=90
    const instance = await getAxiosInstance();
    const data: Record<string, any> = {};

    const url = `/influencers/${influencerId}/analysis`;

    const requestBasicOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        params: {
          tag: 'video.overview',
          dateRange,
        },
      })) as any;

      const ds: Array<any> = res.data;
      data['video.overview'] = formatEnNumberFormat(ds);
    };

    await Promise.all([requestBasicOverview()]);

    return {
      data,
    };
  };

  const requestInfluencerLiveTrend = async (props: { influencerId: string; dateRange: number }) => {
    const { influencerId, dateRange } = props;
    // https://echotik.live/api/v1/data/influencers/7026015251758613509/analysis?tag=live.overview&dateRange=90
    const instance = await getAxiosInstance();
    const data: Record<string, any> = {};

    const url = `/influencers/${influencerId}/analysis`;

    const requestBasicOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        params: {
          tag: 'live.overview',
          dateRange,
        },
      })) as any;

      const ds: Array<any> = res.data;
      data['live.overview'] = formatEnNumberFormat(ds);
    };

    await Promise.all([requestBasicOverview()]);

    return {
      data,
    };
  };

  const requestInfluencerSalesTrend = async (props: { influencerId: string; dateRange: number }) => {
    const { influencerId, dateRange } = props;
    // https://echotik.live/api/v1/data/influencers/7026015251758613509/analysis?tag=live.overview&dateRange=90
    const instance = await getAxiosInstance();
    const data: Record<string, any> = {};

    const url = `/influencers/${influencerId}/analysis`;

    const requestBasicOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        params: {
          tag: 'sales.overview',
          dateRange,
        },
      })) as any;

      const ds: Array<any> = res.data;
      data['sales.overview'] = formatEnNumberFormat(ds);
    };

    await Promise.all([requestBasicOverview()]);

    return {
      data,
    };
  };

  interface IConditionCheckProps {
    field: string;
    preConditionField?: string;
    cb: (params: { value: any; preValue?: any }) => void;
  }

  const searchConditionJudgement = (conditionMap: Map<string, any>) => {
    const available = conditionMap && conditionMap.size;

    const conditionCheck = async (props: IConditionCheckProps) => {
      if (!available) return;
      const { field, preConditionField, cb } = props;
      if (isNil(field) || !conditionMap.has(field)) return;
      let preValue: any;
      if (!isNil(preConditionField)) {
        preValue = conditionMap.get(preConditionField);
        if (isNil(preValue)) {
          return;
        }
      }
      await cb({ value: conditionMap.get(field), preValue });
    };

    const countryConditionCheck = async (props: IConditionCheckProps) => {
      await conditionCheck({
        ...props,
        async cb({ value }) {
          const region = await getCountryRegion(value);
          if (!isNil(region)) {
            props.cb({ value: region });
          }
        },
      });
    };

    return {
      conditionCheck,
      countryConditionCheck,
    };
  };

  const requestProductList = async (props: {
    page: number;
    pageSize: number;
    searchCondition?: Map<string, any>;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { page, pageSize, searchCondition, transfer } = props;
    // const url=`https://echotik.live/api/v1/data/products?page=1&per_page=&price=&commission_rate=&related_influencers=&videos_count=&views_count=&dateRange=&order=total_sale_nd_cnt&sort=desc&keyword=`;
    const url = `${echoTipAPIBase}/products`;

    let region: string;

    const instance = await getAxiosInstance();

    const params: Record<string, any> = {
      page,
      per_page: pageSize,
    };

    const { conditionCheck, countryConditionCheck } = searchConditionJudgement(searchCondition);

    await conditionCheck({
      field: 'keyword',
      cb({ value }) {
        params['keyword'] = value;
      },
    });

    await conditionCheck({
      field: 'category',
      cb({ value }) {
        params['product_categories'] = value;
      },
    });

    await conditionCheck({
      field: 'sales',
      preConditionField: 'saleType',
      cb({ value: sales, preValue: saleType }) {
        switch (saleType) {
          case 'latest_30days':
            params['sales'] = sales;
            break;
          case 'total':
            params['total_sale_cnt'] = sales;
            break;
          default:
            break;
        }
      },
    });

    await conditionCheck({
      field: 'searchConditionGMV',
      preConditionField: 'searchConditionGMVType',
      cb({ value, preValue: type }) {
        switch (type) {
          case 'latest30days':
            params['gmv_amt_30d'] = value;
            break;
          case 'total':
            params['gmv'] = value;
            break;
          default:
            break;
        }
      },
    });

    await countryConditionCheck({
      field: 'country',
      cb({ value }) {
        region = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionPrice',
      cb({ value }) {
        params['price'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionCommissionRate',
      cb({ value }) {
        params['commission_rate'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionInfluencerCount',
      cb({ value }) {
        params['related_influencers'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionVideoCount',
      cb({ value }) {
        params['videos_count'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionVideoViewCount',
      cb({ value }) {
        params['views_count'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionCommentCount',
      cb({ value }) {
        params['review_count'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionSalesFlag',
      cb({ value }) {
        params['sales_flag'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionSalesTrendFlag',
      cb({ value }) {
        params['sales_trend_flag'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionIsSShop',
      cb({ value }) {
        params['is_s_shop'] = value;
      },
    });

    const { data: res } = await instance.request({
      url,
      method: 'GET',
      headers: {
        'x-region': region,
      },
      params,
    });

    const meta = genMeta({ resData: res, page, pageSize });

    const datas = res.data as Array<any>;
    return {
      data: isFunction(transfer) ? datas.map((d) => transfer(d)) : datas,
      meta,
    };
  };

  const requestProductDetail = async (props: {
    id: string;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { id, transfer } = props;
    const instance = await getAxiosInstance();
    const {
      data: { data, msg, code },
    } = (await instance.request({
      url: `/products/${id}`,
    })) as any;

    const { id: countryKey } = data.region || {};
    let country;
    if (!isNil(countryKey)) {
      country = await getCountryByKey(countryKey);
    }

    return isFunction(transfer) ? transfer(data) : data;
  };

  const transferENUnit = (value: string | number) => {
    if (isString(value)) {
      const unit = value[value.length - 1].toLocaleLowerCase();
      let ma = Number(value.slice(0, value.length - 1));
      switch (unit) {
        case 'k':
          ma = ma * 1000;
          break;
        case 'm':
          ma = ma * 10000000;
          break;
        default:
          break;
      }
      return ma;
    } else {
      return value;
    }
  };

  const transferArrayEnUnit = (arr: any[], transferProperties: string[]) => {
    if (!isArray(arr)) return arr;
    return arr.map((it) => {
      const val = { ...it };
      for (const property of transferProperties) {
        val[property] = transferENUnit(val[property]);
      }
      return val;
    });
  };

  const requestProductTrend = async (props: { id: string; dateRange: number }) => {
    const { id, dateRange } = props;
    // https://echotik.live/api/v1/data/products/1730294730237252435/analysis?tag=basic.overview&dateRange=30&start_time=&end_time=
    const instance = await getAxiosInstance();
    const data: Record<string, any> = {};

    const url = `/products/${id}/analysis`;

    const requestBasicOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        params: {
          tag: 'basic.overview',
          dateRange,
        },
      })) as any;

      const ds: Array<any> = res.data;
      data['basic.overview'] = formatEnNumberFormat(ds);
    };

    // 销量和销售额
    const requestBasicSalesTrendingOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        params: {
          tag: 'basic.sales.trending',
          indicator: 'total_sale_cnt',
          dateRange,
        },
      })) as any;

      data['basic.sales.trending'] = mergeDualAxesDataFromArray({
        datas: res.data,
        xAxisProperty: 'axis_x',
        yAxisProperty: 'axis_y',
        legendProperty: 'legend',
        xAxisPropertyAlias: '日期',
        xAxisPropertyDataOnlyMS: true,
      });
    };

    // 关联达人趋势
    const requestInfluencerTrendingOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        params: {
          tag: 'basic.sales.trending',
          indicator: 'total_ifl_cnt',
          dateRange,
        },
      })) as any;

      data['basic.influencer.trending'] = mergeDualAxesDataFromArray({
        datas: res.data,
        xAxisProperty: 'axis_x',
        yAxisProperty: 'axis_y',
        legendProperty: 'legend',
        xAxisPropertyAlias: '日期',
        xAxisPropertyDataOnlyMS: true,
      });
    };

    // 每日视频直播趋势
    const requestInsightsTrendingOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        params: {
          tag: 'basic.sales.insights',
          dateRange,
        },
      })) as any;

      const ds: Array<any> = res.data || [];
      data['basic.insights.trending'] = ds.map((d) => ({
        类别: d['legend'],
        日期: (d['axis_x'] as string).slice(5),
        数量: d['axis_y'],
      }));
    };

    await Promise.all([
      requestBasicOverview(),
      requestBasicSalesTrendingOverview(),
      requestInfluencerTrendingOverview(),
      requestInsightsTrendingOverview(),
    ]);

    return {
      data,
    };
  };

  const requestProductLiveTrend = async (props: { id: string; dateRange: number }) => {
    const { id, dateRange } = props;
    // https://echotik.live/api/v1/data/products/1729562343719538908/analysis?tag=live.overview&dateRange=30&start_time=&end_time=
    const instance = await getAxiosInstance();
    const data: Record<string, any> = {};

    const url = `/products/${id}/analysis`;

    const requestBasicOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        params: {
          tag: 'live.overview',
          dateRange,
        },
      })) as any;

      const ds: Array<any> = res.data;
      data['live.overview'] = formatEnNumberFormat(ds);
    };

    await Promise.all([requestBasicOverview()]);

    return {
      data,
    };
  };

  const requestProductVideoTrend = async (props: { id: string; dateRange: number }) => {
    const { id, dateRange } = props;
    // https://echotik.live/api/v1/data/products/1729562343719538908/analysis?tag=video.overview&dateRange=30&start_time=&end_time=
    const instance = await getAxiosInstance();
    const data: Record<string, any> = {};

    const url = `/products/${id}/analysis`;

    const requestBasicOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        params: {
          tag: 'video.overview',
          dateRange,
        },
      })) as any;

      const ds: Array<any> = res.data;
      data['video.overview'] = formatEnNumberFormat(ds);
    };

    await Promise.all([requestBasicOverview()]);

    return {
      data,
    };
  };

  const requestProductSalesInfluencerList = async (props: {
    productId: string;
    page: number;
    pageSize: number;
    order?: string;
    sort?: IEchoSort;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { productId, page, pageSize, order, sort, transfer } = props;
    // https://echotik.live/api/v1/data/products/1730294730237252435/influencers?page=1&per_page=10&sort=desc&order=follower_count
    const url = `${echoTipAPIBase}/products/${productId}/influencers`;

    const instance = await getAxiosInstance();

    const params: Record<string, any> = {
      page,
      per_page: pageSize,
      order: order || 'follower_count',
      sort,
    };

    const { data: res } = await instance.request({
      url,
      method: 'GET',
      headers: {
        // 'x-region': region,
      },
      params,
    });

    const meta = genMeta({ resData: res, page, pageSize });

    const datas = res.data as Array<any>;
    return {
      data: isFunction(transfer) ? datas.map((d) => transfer(d)) : datas,
      meta,
    };
  };

  const requestProductSalesVideoList = async (props: {
    productId: string;
    page: number;
    pageSize: number;
    order?: string;
    sort?: IEchoSort;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { productId, page, pageSize, order, sort, transfer } = props;
    // https://echotik.live/api/v1/data/products/1730294730237252435/videos?page=1&per_page=12&sort=desc&order=publish_time&start_time=&end_time=
    const url = `${echoTipAPIBase}/products/${productId}/videos`;

    const instance = await getAxiosInstance();

    const params: Record<string, any> = {
      page,
      per_page: pageSize,
      order: order,
      sort,
    };

    const { data: res } = await instance.request({
      url,
      method: 'GET',
      headers: {
        // 'x-region': region,
      },
      params,
    });

    const meta = genMeta({ resData: res, page, pageSize });

    const datas = res.data as Array<any>;
    return {
      data: isFunction(transfer) ? datas.map((d) => transfer(d)) : datas,
      meta,
    };
  };

  const requestProductLiveVideoList = async (props: {
    productId: string;
    page: number;
    pageSize: number;
    order?: string;
    sort?: IEchoSort;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { productId, page, pageSize, order, sort, transfer } = props;
    // https://echotik.live/api/v1/data/products/1730294730237252435/lives?page=1&per_page=10&sort=desc&order=viewers_count

    const url = `${echoTipAPIBase}/products/${productId}/lives`;

    const instance = await getAxiosInstance();

    const params: Record<string, any> = {
      page,
      per_page: pageSize,
      order: order,
      sort,
    };

    const { data: res } = await instance.request({
      url,
      method: 'GET',
      headers: {
        // 'x-region': region,
      },
      params,
    });

    const meta = genMeta({ resData: res, page, pageSize });

    const datas = res.data as Array<any>;
    return {
      data: isFunction(transfer) ? datas.map((d) => transfer(d)) : datas,
      meta,
    };
  };

  const requestProductCompetitorVideoList = async (props: {
    productId: string;
    page: number;
    pageSize: number;
    order?: string;
    sort?: IEchoSort;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { productId, page, pageSize, order, sort, transfer } = props;
    // https://echotik.live/api/v1/data/products/1730294730237252435/similar?per_page=5&page=1

    const url = `${echoTipAPIBase}/products/${productId}/similar`;

    const instance = await getAxiosInstance();

    const params: Record<string, any> = {
      page,
      per_page: pageSize,
      order: order,
      sort,
    };

    const { data: res } = await instance.request({
      url,
      method: 'GET',
      headers: {
        // 'x-region': region,
      },
      params,
    });

    const meta = genMeta({ resData: res, page, pageSize });

    const datas = res.data as Array<any>;
    return {
      data: isFunction(transfer) ? datas.map((d) => transfer(d)) : datas,
      meta,
    };
  };

  const requestIndependentInfluencerVideoList = async (props: {
    page: number;
    pageSize: number;
    searchCondition?: Map<string, any>;
    order?: string;
    sort?: IEchoSort;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { page, pageSize, searchCondition, order, sort, transfer } = props;
    // https://echotik.live/api/v1/data/videos?page=1&per_page=10&influencer_categories=&time_range=90&sort=desc&order=digg_count
    const url = `${echoTipAPIBase}/videos`;

    let region: string;

    const instance = await getAxiosInstance();

    const params: Record<string, any> = {
      page,
      per_page: pageSize,
      order: order,
      sort,
    };

    const { conditionCheck, countryConditionCheck } = searchConditionJudgement(searchCondition);

    await conditionCheck({
      field: 'keyword',
      cb({ value }) {
        params['keyword'] = value;
      },
    });

    await countryConditionCheck({
      field: 'country',
      cb({ value }) {
        region = value;
      },
    });

    await conditionCheck({
      field: 'influencerCategory',
      cb({ value }) {
        params['influencer_categories'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionViewCount',
      cb({ value }) {
        params['views_count'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionLikeCount',
      cb({ value }) {
        params['likes_count'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionCommentCount',
      cb({ value }) {
        params['comments_count'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionShareCount',
      cb({ value }) {
        params['shares_count'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionDuration',
      cb({ value }) {
        params['duration'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionTimeRange',
      cb({ value }) {
        params['time_range'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionTimeRange',
      cb({ value }) {
        params['time_range'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionSales',
      cb({ value }) {
        params['is_sale'] = value === true ? 1 : 0;
      },
    });

    await conditionCheck({
      field: 'searchConditionTimeIsLatest',
      cb({ value }) {
        params['is_latest'] = value === true ? 1 : 0;
      },
    });

    const { data: res } = await instance.request({
      url,
      method: 'GET',
      headers: {
        'x-region': region,
      },
      params,
    });

    const meta = genMeta({ resData: res, page, pageSize });

    const datas = res.data as Array<any>;
    return {
      data: isFunction(transfer) ? datas.map((d) => transfer(d)) : datas,
      meta,
    };
  };

  const requestIndependentInfluencerVideoDetail = async (props: {
    id: string;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { id, transfer } = props;
    const instance = await getAxiosInstance();
    const {
      data: { data, msg, code },
    } = (await instance.request({
      url: `/videos/${id}`,
    })) as any;

    return isFunction(transfer) ? transfer(data) : data;
  };

  const requestIndependentLiveList = async (props: {
    page: number;
    pageSize: number;
    searchCondition?: Map<string, any>;
    order?: string;
    sort?: IEchoSort;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { page, pageSize, order, sort, searchCondition, transfer } = props;
    // https://echotik.live/api/v1/data/videos?page=1&per_page=10&influencer_categories=&time_range=90&sort=desc&order=digg_count
    const url = `${echoTipAPIBase}/lives`;

    let region: string;

    const instance = await getAxiosInstance();

    const params: Record<string, any> = {
      page,
      per_page: pageSize,
      order,
      sort,
    };

    const { conditionCheck, countryConditionCheck } = searchConditionJudgement(searchCondition);

    await conditionCheck({
      field: 'keyword',
      cb({ value }) {
        params['keyword'] = value;
      },
    });

    await countryConditionCheck({
      field: 'country',
      cb({ value }) {
        region = value;
      },
    });

    await conditionCheck({
      field: 'category',
      cb({ value }) {
        params['product_categories'] = value;
      },
    });

    await conditionCheck({
      field: 'influencerCategory',
      cb({ value }) {
        params['influencer_categories'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionFollowerCount',
      cb({ value }) {
        params['followers_count'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionSales',
      cb({ value }) {
        params['sales'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionIsSale',
      cb({ value }) {
        params['is_sale'] = value === true ? 1 : 0;
      },
    });

    await conditionCheck({
      field: 'searchConditionIsLiving',
      cb({ value }) {
        params['live_status'] = value === true ? 1 : 0;
      },
    });

    const { data: res } = await instance.request({
      url,
      method: 'GET',
      headers: {
        'x-region': region,
      },
      params,
    });

    const meta = genMeta({ resData: res, page, pageSize });

    const datas = res.data as Array<any>;
    return {
      data: isFunction(transfer) ? datas.map((d) => transfer(d)) : datas,
      meta,
    };
  };

  const requestIndependentLiveDetail = async (props: {
    id: string;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { id, transfer } = props;
    const instance = await getAxiosInstance();
    // https://echotik.live/api/v1/data/lives/7482222612275628846/analysis?tag=basic.overview
    const {
      data: { data, msg, code },
    } = (await instance.request({
      url: `/lives/${id}`,
    })) as any;

    return isFunction(transfer) ? transfer(data) : data;
  };

  const requestLiveDetailProductList = async (props: {
    liveId: string;
    page: number;
    pageSize: number;
    order?: string;
    sort?: IEchoSort;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { liveId, page, pageSize, order, sort, transfer } = props;
    // https://echotik.live/api/v1/data/lives/7388435030240250656/products?page=1&per_page=10&order=price&sort=desc
    const instance = await getAxiosInstance();
    const { data: res } = (await instance.request({
      url: `/lives/${liveId}/products`,
      params: {
        page,
        per_page: pageSize,
        order,
        sort,
      },
    })) as any;
    const meta = genMeta({ resData: res, page, pageSize });
    const datas = res.data as Array<any>;
    return {
      data: isFunction(transfer) ? datas.map((d) => transfer(d)) : datas,
      meta,
    };
  };

  const requestLiveTrend = async (props: { id: string }) => {
    const { id } = props;
    // https://echotik.live/api/v1/data/lives/7482222612275628846/analysis?tag=basic.overview
    const instance = await getAxiosInstance();
    const data: Record<string, any> = {};

    const url = `/lives/${id}/analysis`;

    const requestBasicOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        params: {
          tag: 'basic.overview',
        },
      })) as any;

      const ds: Array<any> = res.data;
      data['basic.overview'] = formatEnNumberFormat(ds);
    };

    await Promise.all([requestBasicOverview()]);

    return {
      data,
    };
  };

  const requestIndependentSellerList = async (props: {
    page: number;
    pageSize: number;
    searchCondition?: Map<string, any>;
    order?: string;
    sort?: IEchoSort;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { page, pageSize, order, sort, searchCondition, transfer } = props;
    // https://echotik.live/api/v1/data/sellers?page=1&per_page=10&product_categories=&product_categories_name_slug=&sales=&total_sale_cnt=&related_influencers=&gmv=&order=total_sale_nd_cnt&sort=desc&keyword=
    const url = `${echoTipAPIBase}/sellers`;

    let region: string;

    const instance = await getAxiosInstance();

    const params: Record<string, any> = {
      page,
      per_page: pageSize,
      order,
      sort,
    };

    const { conditionCheck, countryConditionCheck } = searchConditionJudgement(searchCondition);

    await conditionCheck({
      field: 'keyword',
      cb({ value }) {
        params['keyword'] = value;
      },
    });

    await countryConditionCheck({
      field: 'country',
      cb({ value }) {
        region = value;
      },
    });

    await conditionCheck({
      field: 'productCategory',
      cb({ value }) {
        params['product_categories'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionLatest30Sales',
      cb({ value }) {
        params['sales'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionTotalSales',
      cb({ value }) {
        params['total_sale_cnt'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionSellerRating',
      cb({ value }) {
        params['seller_rating'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionSellerType',
      cb({ value }) {
        params['seller_type'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionSellerFlag',
      cb({ value }) {
        params['sales_flag'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionSellerTrendFlag',
      cb({ value }) {
        params['sales_trend_flag'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionIsSShop',
      cb({ value }) {
        params['is_s_shop'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionGMV',
      cb({ value }) {
        params['gmv'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionRelatedInfluencers',
      cb({ value }) {
        params['related_influencers'] = value;
      },
    });

    const { data: res } = await instance.request({
      url,
      method: 'GET',
      headers: {
        'x-region': region,
      },
      params,
    });

    const meta = genMeta({ resData: res, page, pageSize });

    const datas = res.data as Array<any>;
    return {
      data: isFunction(transfer) ? datas.map((d) => transfer(d)) : datas,
      meta,
    };
  };

  const requestIndependentSellerDetail = async (props: {
    id: string;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { id, transfer } = props;
    const instance = await getAxiosInstance();
    // https://echotik.live/api/v1/data/lives/7482222612275628846/analysis?tag=basic.overview
    const {
      data: { data, msg, code },
    } = (await instance.request({
      url: `/sellers/${id}`,
    })) as any;

    return isFunction(transfer) ? transfer(data) : data;
  };

  const requestSellerTrend = async (props: { id: string; dateRange: number }) => {
    const { id, dateRange } = props;
    // https://echotik.live/api/v1/data/sellers/7495794203056835079/analysis?tag=basic.overview&dateRange=30&start_time=&end_time=
    const instance = await getAxiosInstance();
    const data: Record<string, any> = {};

    const url = `/sellers/${id}/analysis`;

    const requestBasicOverview = async () => {
      const tag = 'basic.overview';
      const { data: res } = (await instance.request({
        url,
        params: {
          tag,
          dateRange,
        },
      })) as any;

      const ds: Array<any> = res.data;
      data[tag] = formatEnNumberFormat(ds);
    };

    const requestSalesCNTOverview = async () => {
      const tag = 'basic.sales.trending';
      const { data: res } = (await instance.request({
        url,
        params: {
          tag,
          indicator: 'total_sale_cnt',
          dateRange,
        },
      })) as any;

      data['basic.sales.cnt.trending'] = mergeDualAxesDataFromArray({
        datas: res.data,
        xAxisProperty: 'axis_x',
        yAxisProperty: 'axis_y',
        legendProperty: 'legend',
        xAxisPropertyAlias: '日期',
        xAxisPropertyDataOnlyMS: true,
      });
    };

    const requestSalesGMVOverview = async () => {
      const tag = 'basic.sales.trending';
      const { data: res } = (await instance.request({
        url,
        params: {
          tag,
          indicator: 'total_sale_gmv_amt',
          dateRange,
        },
      })) as any;

      data['basic.sales.gmv.trending'] = mergeDualAxesDataFromArray({
        datas: res.data,
        xAxisProperty: 'axis_x',
        yAxisProperty: 'axis_y',
        legendProperty: 'legend',
        xAxisPropertyAlias: '日期',
        xAxisPropertyDataOnlyMS: true,
      });
    };

    const requestInfluencerOverview = async () => {
      const tag = 'basic.influencer.trending';
      const { data: res } = (await instance.request({
        url,
        params: {
          tag,
          dateRange,
        },
      })) as any;

      data[tag] = mergeDualAxesDataFromArray({
        datas: res.data,
        xAxisProperty: 'axis_x',
        yAxisProperty: 'axis_y',
        legendProperty: 'legend',
        xAxisPropertyAlias: '日期',
        xAxisPropertyDataOnlyMS: true,
      });
    };

    const requestInsightsTrendingOverview = async () => {
      const tag = 'basic.video.trending';
      const { data: res } = (await instance.request({
        url,
        params: {
          tag,
          dateRange,
        },
      })) as any;

      const ds: Array<any> = res.data || [];
      data[tag] = ds.map((d) => ({
        类别: d['legend'],
        日期: (d['axis_x'] as string).slice(5),
        数量: d['axis_y'],
      }));
    };

    await Promise.all([
      requestBasicOverview(),
      requestSalesCNTOverview(),
      requestSalesGMVOverview(),
      requestInfluencerOverview(),
      requestInsightsTrendingOverview(),
    ]);

    return {
      data,
    };
  };

  const requestSellerVideoTrend = async (props: { id: string; dateRange: number }) => {
    const { id, dateRange } = props;
    // https://echotik.live/api/v1/data/sellers/7495794203056835079/analysis?tag=video.overview&dateRange=30&start_time=&end_time=
    const instance = await getAxiosInstance();
    const data: Record<string, any> = {};

    const url = `/sellers/${id}/analysis`;

    const requestBasicOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        params: {
          tag: 'video.overview',
          dateRange,
        },
      })) as any;

      const ds: Array<any> = res.data;
      data['video.overview'] = formatEnNumberFormat(ds);
    };

    await Promise.all([requestBasicOverview()]);

    return {
      data,
    };
  };

  const requestSellerLiveTrend = async (props: { id: string; dateRange: number }) => {
    const { id, dateRange } = props;
    // https://echotik.live/api/v1/data/sellers/7495794203056835079/analysis?tag=video.overview&dateRange=30&start_time=&end_time=
    const instance = await getAxiosInstance();
    const data: Record<string, any> = {};

    const url = `/sellers/${id}/analysis`;

    const requestBasicOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        params: {
          tag: 'live.overview',
          dateRange,
        },
      })) as any;

      const ds: Array<any> = res.data;
      data['live.overview'] = formatEnNumberFormat(ds);
    };

    await Promise.all([requestBasicOverview()]);

    return {
      data,
    };
  };

  const requestSellerProductList = async (props: {
    sellerId: string;
    page: number;
    pageSize: number;
    order?: string;
    sort?: IEchoSort;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { sellerId, page, pageSize, order, sort, transfer } = props;
    // https://echotik.live/api/v1/data/sellers/7495794203056835079/products?page=1&per_page=10&sort=desc&order=total_sale_cnt&product_categories=
    const instance = await getAxiosInstance();
    const { data: res } = (await instance.request({
      url: `/sellers/${sellerId}/products`,
      params: {
        page,
        per_page: pageSize,
        order,
        sort,
      },
    })) as any;
    const meta = genMeta({ resData: res, page, pageSize });
    const datas = res.data as Array<any>;
    return {
      data: isFunction(transfer) ? datas.map((d) => transfer(d)) : datas,
      meta,
    };
  };

  const requestSellerInfluencerList = async (props: {
    sellerId: string;
    page: number;
    pageSize: number;
    order?: string;
    sort?: IEchoSort;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { sellerId, page, pageSize, order, sort, transfer } = props;
    // https://echotik.live/api/v1/data/sellers/7495794203056835079/influencers?page=1&per_page=10&sort=desc&order=follower_count
    const instance = await getAxiosInstance();
    const { data: res } = (await instance.request({
      url: `/sellers/${sellerId}/influencers`,
      params: {
        page,
        per_page: pageSize,
        order,
        sort,
      },
    })) as any;
    const meta = genMeta({ resData: res, page, pageSize });
    const datas = res.data as Array<any>;
    return {
      data: isFunction(transfer) ? datas.map((d) => transfer(d)) : datas,
      meta,
    };
  };

  const requestSellerVideoList = async (props: {
    sellerId: string;
    page: number;
    pageSize: number;
    order?: string;
    sort?: IEchoSort;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { sellerId, page, pageSize, order, sort, transfer } = props;
    // https://echotik.live/api/v1/data/sellers/7495794203056835079/videos?page=1&per_page=10&sort=desc&order=views_count
    const instance = await getAxiosInstance();
    const { data: res } = (await instance.request({
      url: `/sellers/${sellerId}/videos`,
      params: {
        page,
        per_page: pageSize,
        order,
        sort,
      },
    })) as any;
    const meta = genMeta({ resData: res, page, pageSize });
    const datas = res.data as Array<any>;
    return {
      data: isFunction(transfer) ? datas.map((d) => transfer(d)) : datas,
      meta,
    };
  };

  const requestSellerLiveList = async (props: {
    sellerId: string;
    page: number;
    pageSize: number;
    order?: string;
    sort?: IEchoSort;
    transfer?: (data: { [key: string]: any }) => { [key: string]: any };
  }) => {
    const { sellerId, page, pageSize, order, sort, transfer } = props;
    // https://echotik.live/api/v1/data/sellers/7495794203056835079/lives?page=1&per_page=10&sort=desc&order=viewers_count
    const instance = await getAxiosInstance();
    const { data: res } = (await instance.request({
      url: `/sellers/${sellerId}/lives`,
      params: {
        page,
        per_page: pageSize,
        order,
        sort,
      },
    })) as any;
    const meta = genMeta({ resData: res, page, pageSize });
    const datas = res.data as Array<any>;
    return {
      data: isFunction(transfer) ? datas.map((d) => transfer(d)) : datas,
      meta,
    };
  };

  const hasTagIdTool = (() => {
    const splitFlag = '@';
    const defaultRegion = 'US';
    const generateTagId = (id: string, region: string = defaultRegion) => {
      return `${id}${splitFlag}${region}`;
    };
    const parseId = (id: string) => {
      let region = defaultRegion;
      const idx = id.indexOf(splitFlag);
      if (idx > -1) {
        region = id.slice(idx + 1);
        id = id.slice(0, idx);
      }
      return { region, id };
    };
    return {
      generateTagId,
      parseId,
    };
  })();

  const requestHashTagList = async (props: {
    page: number;
    pageSize: number;
    keyword?: string;
    country?: number;
    searchCondition?: Map<string, any>;
    order?: string;
    sort?: IEchoSort;
  }) => {
    const { searchCondition, page, pageSize, order, sort } = props;
    // https://echotik.live/api/v1/data/tags?page=1&per_page=10&sort=desc&order=views_count&keyword=
    const url = `${echoTipAPIBase}/tags`;
    let region: string;

    const instance = await getAxiosInstance();

    const transfers: Array<(item: Record<string, any>) => void> = [];

    const params: Record<string, any> = {
      page,
      per_page: pageSize,
      order,
      sort,
    };

    const { conditionCheck, countryConditionCheck } = searchConditionJudgement(searchCondition);

    await conditionCheck({
      field: 'tag_title',
      cb({ value }) {
        params['keyword'] = value;
      },
    });

    await countryConditionCheck({
      field: 'country',
      cb({ value }) {
        region = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionViewCount',
      cb({ value }) {
        params['views_count'] = value;
      },
    });

    await conditionCheck({
      field: 'searchConditionDiggCount',
      cb({ value }) {
        params['digg_count'] = value;
      },
    });

    region = region || 'US';

    transfers.push((it) => {
      if (!isNil(region)) {
        it['tag_id'] = hasTagIdTool.generateTagId(it.tag_id, region);
      }
      return it;
    });

    const { data: res } = await instance.request({
      url,
      method: 'GET',
      headers: {
        'x-region': region,
      },
      params,
    });

    const meta = genMeta({ resData: res, page, pageSize });

    return {
      data: (res.data as Array<any>).map((item) => {
        for (const transfer of transfers) {
          transfer(item);
        }
        return item;
      }),
      meta,
    };
  };

  const requestHasTagDetail = async (props: { dataId: string }) => {
    const { dataId: _id } = props;
    const { id: dataId, region } = hasTagIdTool.parseId(_id);

    const instance = await getAxiosInstance();
    const {
      data: { data, msg, code },
    } = (await instance.request({
      url: `/tags/${dataId}`,
      headers: {
        'x-region': region,
      },
      params: {
        region,
      },
    })) as any;

    const { id: countryKey } = data.region || {};
    let country;
    if (!isNil(countryKey)) {
      country = await getCountryByKey(countryKey);
    }

    return {
      ...data,
      video_count: data.videos_count,
      follower_count: data.followers_count,
      view_count: data.views,
      country,
    };
  };

  const requestHashTagVideoList = async (props: {
    tagId: string;
    page: number;
    pageSize: number;
    order?: string;
    sort?: IEchoSort;
  }) => {
    const { tagId: _id, page, pageSize, order, sort } = props;
    const { id: tagId, region } = hasTagIdTool.parseId(_id);
    // https://echotik.live/api/v1/data/tags/229207/videos?page=1&per_page=12&is_sale=0&dateRange=30&sort=desc&order=publish_time&region=US
    const url = `${echoTipAPIBase}/tags/${tagId}/videos`;

    const instance = await getAxiosInstance();

    const params: Record<string, any> = {
      page,
      per_page: pageSize,
      order,
      sort,
      region,
    };

    const { data: res } = await instance.request({
      url,
      method: 'GET',
      headers: {
        'x-region': region,
      },
      params,
    });

    const meta = genMeta({ resData: res, page, pageSize });

    return {
      data: (res.data as Array<any>).map((item) => {
        // for (const transfer of transfers) {
        //   transfer(item);
        // }
        return item;
      }),
      meta,
    };
  };

  const requestHashTagsTrend = async (props: { id: string }) => {
    const { id: _id } = props;
    const { id, region } = hasTagIdTool.parseId(_id);
    // https://echotik.live/api/v1/data/tags/229207/analysis?tag=basic.tags.trending&region=US&dateRange=30

    const instance = await getAxiosInstance();
    const data: Record<string, any> = {};

    const url = `/tags/${id}/analysis`;
    const tag = 'basic.tags.trending';
    const requestBasicOverview = async () => {
      const { data: res } = (await instance.request({
        url,
        headers: {
          'x-region': region,
        },
        params: {
          tag,
          dateRange: 30,
          region,
        },
      })) as any;

      const ds: Array<any> = res.data || [];
      data[tag] = ds.map((d) => ({
        类别: d['legend'],
        日期: (d['axis_x'] as string).slice(5),
        数量: d['axis_y'],
      }));
    };

    await Promise.all([requestBasicOverview()]);

    return {
      data,
    };
  };

  return {
    startup,
    transferNocoSortToEchoSort,
    getInfluencerCategoryByKey,
    requestTopHashTagList,
    requestTopVideoList,
    requestTopFollowerList,
    requestTopSoldList,
    requestHotSellList,
    requestNewBurstList,
    requestInfluencerList,
    requestInfluencerDetail,
    requestInfluencerVideoList,
    requestInfluencerLiveList,
    requestInfluencerProductList,
    requestInfluencerTrend,
    requestInfluencerVideoTrend,
    requestInfluencerLiveTrend,
    requestLiveDetailProductList,
    requestInfluencerSalesTrend,
    requestProductList,
    requestProductDetail,
    requestProductTrend,
    requestProductVideoTrend,
    requestProductLiveTrend,
    requestProductSalesInfluencerList,
    requestProductSalesVideoList,
    requestProductLiveVideoList,
    requestProductCompetitorVideoList,
    requestIndependentInfluencerVideoList,
    requestIndependentInfluencerVideoDetail,
    requestIndependentLiveList,
    requestIndependentLiveDetail,
    requestLiveTrend,
    requestIndependentSellerList,
    requestIndependentSellerDetail,
    requestSellerTrend,
    requestSellerVideoTrend,
    requestSellerLiveTrend,
    requestSellerProductList,
    requestSellerInfluencerList,
    requestSellerVideoList,
    requestSellerLiveList,
    requestHashTagList,
    requestHasTagDetail,
    requestHashTagVideoList,
    requestHashTagsTrend,
  };
})();
