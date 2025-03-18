import { Plugin } from '@nocobase/server';
import queryString from 'query-string';
import axios from 'axios';
import { Context } from '@nocobase/actions';
import { getTiktokAPIBaseUrl } from '../../common';
import { isNil } from 'lodash';
import dayjs from 'dayjs';
import { generateRegisterAuthorizePage, TK_FEEDBACK_PAGE } from '../utils';

interface IAuthorizationInfo {
  accountId?: number;
  isRegisterUser?: boolean;
  token?: string;
}

export const TiktokDataCenter = (() => {
  let plugin: Plugin;

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const authorizationMapping = new Map<string, IAuthorizationInfo>();
  const clientKey = 'sbaw4lzoqtmuncf23w';
  const scope = 'user.info.basic,user.info.profile,user.info.stats,video.list,video.upload,video.publish';
  const TIKTOK_API_URL = getTiktokAPIBaseUrl();

  const startup = (props: { plugin: Plugin }) => {
    plugin = props.plugin;
  };

  /**
   * 根据token获取当前账号基础信息
   * @param props
   * @returns
   */
  const getAccountInfo = async (props: {
    token: string;
  }): Promise<{
    open_id: string;
    union_id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    follower_count: number;
    following_count: number;
    likes_count: number;
    video_count: number;
  }> => {
    const { token } = props;
    const {
      data: {
        data: { user },
      },
    } = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        fields:
          'open_id,union_id,avatar_url,display_name,username,follower_count,following_count,likes_count,video_count',
      },
    });
    return user;
  };

  const getToken = async (props: { ctx: Context; accountId?: number }) => {
    const { ctx, accountId } = props;
    if (isNil(accountId)) return null;
    const tokenRep = ctx.db.getRepository('tk_token');

    const $or = [];

    if (!isNil(accountId)) {
      $or.push({ accountId });
    }

    const record = await tokenRep.findOne({
      filter: { $or },
    });
    if (isNil(record)) return null;

    const updatedAt = dayjs(record.updatedAt);
    const tokenExpiresIn = updatedAt.add(record.expires_in, 's');
    const currentTime = dayjs();
    if (tokenExpiresIn.isAfter(currentTime)) return record.access_token;

    const params = new URLSearchParams();
    params.append('client_key', 'sbaw4lzoqtmuncf23w');
    params.append('client_secret', 'WM4ScBYDkntf3E99EBM3J386He0AB1Gt');
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', record.refresh_token);

    const { data } = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    await tokenRep.update({
      values: data,
      filter: {
        id: record.id,
      },
    });

    return data.access_token;
  };

  function checkIsSupportVideo(extension: string) {
    return extension === 'mp4' || extension === 'mov' || extension === 'webm';
  }

  const requestToken = async (props: {
    ctx: Context;
    next: () => any;
    accountId: number;
    feedbackRedirectParam?: { isRegisterUser?: boolean; token?: string };
  }) => {
    const { ctx, next, accountId, feedbackRedirectParam = {} } = props;
    const authorizationRep = ctx.db.getRepository('tk_authorization');
    const record: any = await authorizationRep.findOne({
      filter: {
        tk_account_id: accountId,
      },
    });
    let state: string;
    if (!isNil(record)) {
      state = record.state;
    } else {
      state = Math.random().toString(36).substring(2);
      await authorizationRep.create({
        values: {
          state,
          tk_account_id: accountId,
        },
      });
    }

    const info: IAuthorizationInfo = { accountId, ...feedbackRedirectParam };
    authorizationMapping.set(state, info);
    const queryParams = {
      client_key: clientKey,
      scope,
      response_type: 'code',
      redirect_uri: `${TIKTOK_API_URL}/api/tiktok:authorizeFeedback`,
    };
    const url = queryString.stringifyUrl({
      url: 'https://www.tiktok.com/v2/auth/authorize',
      query: {
        ...queryParams,
        state,
      },
    });
    ctx.redirect(url);
  };

  const tokenFeedback = async (props: { ctx: Context; next: () => any }) => {
    const { ctx, next } = props;
    const { code, state, error, errorDescription } = (ctx.query as any) || {};
    if (isNil(code) || isNil(state)) return;
    const authorizationRep = ctx.db.getRepository('tk_authorization');
    const accountRep = ctx.db.getRepository('tk_account');
    const authorization = await authorizationRep.findOne({
      filter: {
        state,
      },
    });

    const info = authorizationMapping.get(state);
    const accountId = authorization.tk_account_id;

    if (isNil(authorization.tokenId)) {
      const params = new URLSearchParams();
      params.append('code', code);
      params.append('client_key', 'sbaw4lzoqtmuncf23w');
      params.append('client_secret', 'WM4ScBYDkntf3E99EBM3J386He0AB1Gt');
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', `${TIKTOK_API_URL}/api/tiktok:authorizeFeedback`);

      const { data } = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (data.error) return;

      const tokenRep = ctx.db.getRepository('tk_token');

      const tokenRecord = await tokenRep.create({
        values: {
          ...data,
          accountId,
        },
      });

      await authorizationRep.update({
        filterByTk: authorization.state,
        values: {
          code,
          error,
          errorDescription,
          tokenId: tokenRecord.id,
        },
      });

      const res = await getAccountInfo({ token: data.access_token });

      const latestSyncTime = dayjs().format('YYYY-MM-DD HHmmss');
      await accountRep.update({
        filterByTk: accountId,
        values: {
          followerCount: res.follower_count,
          followingCount: res.following_count,
          videoCount: res.video_count,
          likesCount: res.likes_count,
          username: res.username,
          latestSyncTime,
          tokenId: tokenRecord.id,
        },
      });
    }

    ctx.set({
      'Content-Type': 'text/html; charset=UTF-8',
    });
    ctx.withoutDataWrapping = true;

    let page = TK_FEEDBACK_PAGE;
    if (info.isRegisterUser) {
      page = generateRegisterAuthorizePage(info.token);
    }
    // const tkUserInfo = await syncAccountInfo({ ctx, accountId });
    syncAccountInfo({ ctx, accountId });
    ctx.body = page;

    next();
  };

  /**
   * 同步tk账号基础信息:视频数,粉丝,点赞等
   * @param props
   */
  const syncAccountInfo = async (props: { ctx: Context; accountId: number }) => {
    const { ctx, accountId } = props;
    const token = await TiktokDataCenter.getToken({ ctx, accountId });
    const res = await TiktokDataCenter.getAccountInfo({ token });
    const videoCount: number = res.video_count;
    const accountRep = ctx.db.getRepository('tk_account');
    const accountVideoRep = ctx.db.getRepository('tk_account_video');
    console.log(`---------[ syncAccountInfo ]---------`);
    console.log(`videoCount:`, videoCount);
    let videoListCursor: number;
    // 同步账号视频信息
    const requestVideoList = async () => {
      // 文档: https://developers.tiktok.com/doc/tiktok-api-v2-video-list?enter_method=left_navigation
      // 最大数 20
      const pageSize = 20;

      const {
        data: { data },
      } = await axios.request({
        url: 'https://open.tiktokapis.com/v2/video/list/',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          fields:
            'id,title,video_description,duration,cover_image_url,embed_link,like_count,comment_count,view_count,share_count,create_time',
        },
        data: {
          cursor: videoListCursor,
          max_count: pageSize,
        },
      });

      const videos: Array<any> = data.videos;
      for (const vd of videos) {
        // UTC Unix epoch (in seconds) of when the TikTok video was posted.
        const create_time: number = vd.create_time;
        const createTime = dayjs.unix(create_time).format('YYYY-MM-DD');
        const r = await accountVideoRep.findById(vd.id);
        if (isNil(r)) {
          accountVideoRep.create({
            values: {
              ...vd,
              publish_date: createTime,
              accountId,
            },
          });
        } else {
          accountVideoRep.update({
            filterByTk: vd.id,
            values: {
              ...vd,
              publish_date: createTime,
              accountId,
            },
          });
        }
      }
      const hasMore = data.has_more;
      videoListCursor = data.cursor;
      console.log(`---------[ request video ]---------`);
      console.log(`hasMore:`, hasMore);
      console.log(`videoListCursor:`, videoListCursor);
      if (hasMore) {
        await requestVideoList();
      }
    };
    if (videoCount) {
      await requestVideoList();
    }
    const latestSyncTime = dayjs().format('YYYY-MM-DD HHmmss');
    await accountRep.update({
      filterByTk: accountId,
      values: {
        followerCount: res.follower_count,
        followingCount: res.following_count,
        videoCount: res.video_count,
        likesCount: res.likes_count,
        username: res.username,
        origin_avatar_url: res.avatar_url,
        latestSyncTime,
      },
    });

    return res;
  };

  const getVideoList = async (props: { ctx: Context; accountId: number; page: number; pageSize: number }) => {
    const { ctx, accountId, page, pageSize } = props;
    const token = await TiktokDataCenter.getToken({ ctx, accountId });
    // console.log(`token:`, token);
    console.log(`---------[ getVideoList ]---------`);
    console.log(`---------[ getVideoList ]---------`);
    const accountRep = ctx.db.getRepository('tk_account');
    const account = await accountRep.findById(accountId);
    const videoCount = account.videoCount;

    console.log(`videoCount:`, videoCount);
    const {
      data: { data },
    } = await axios.request({
      url: 'https://open.tiktokapis.com/v2/video/list/',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        fields:
          'id,title,video_description,duration,cover_image_url,embed_link,like_count,comment_count,view_count,share_count,create_time',
      },
      data: {
        max_count: pageSize,
      },
    });
    const videos: Array<any> = data.videos;
    const has_more: boolean = data.has_more;
    const cursor: number = data.cursor;
    const remainder = videoCount % pageSize;
    const totalPage = (videoCount - remainder) / pageSize + (remainder > 0 ? 1 : 0);
    // console.log(`title:`, title);
    console.log(`remainder:`, remainder);

    // console.log(`data:`, data);
    return {
      data: videos,
      meta: {
        count: videoCount,
        page,
        pageSize,
        totalPage,
        cursor,
      },
    };
  };

  return {
    startup,
    requestToken,
    tokenFeedback,
    getAccountInfo,
    getToken,
    syncAccountInfo,
    getVideoList,
  };
})();
