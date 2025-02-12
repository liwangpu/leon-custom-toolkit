import { Context } from '@nocobase/actions';
import dayjs from 'dayjs';
import { floor, isArray, isNil } from 'lodash';
import { changeCurrentUserContext, getExtension } from '../utils';
import queryString from 'query-string';
import axios from 'axios';
import { faker } from '@faker-js/faker';
import { TIKTOK_API_URL } from '../../common';
import path from 'path';
import { promises } from 'fs';
// import { getVideoDurationInSeconds } from 'get-video-duration';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

interface ITKDailyTaskReportData {
  accountId: any;
  searchTermId: any;
  videoTime: number;
  followUser?: boolean;
  likeVideo?: boolean;
  noMoreVideo?: boolean;
}

export function tkDailyTaskReport() {
  return async (ctx: Context, next: () => any) => {
    const data = ctx.request.body as any;
    const { accountId, searchTermId, videoTime, followUser, likeVideo, noMoreVideo } = data as ITKDailyTaskReportData;
    const currentTime = dayjs();
    const currentTimeStr = currentTime.format('YYYY-MM-DD');
    const taskRepo = ctx.db.getRepository('tk_grow_fans_task');
    let task = await taskRepo.findOne({
      filter: {
        date: currentTimeStr,
        accountId,
        searchTermId,
      },
    });

    const videoTimeMinute = floor(videoTime / 60, 2);
    if (!task) {
      const tkAccountRepo = ctx.db.getRepository('tk_account');
      const tkAccount = await tkAccountRepo.findByTargetKey(accountId);
      const accountOwner = tkAccount.createdById;
      task = await taskRepo.create({
        values: {
          date: currentTimeStr,
          accountId,
          searchTermId,
          autoVideoTime: videoTimeMinute,
          autoVideoCount: 1,
          followCount: followUser ? 1 : 0,
          likeCount: likeVideo ? 1 : 0,
          createdById: accountOwner,
          updatedById: accountOwner,
          organizationId: tkAccount.organizationId,
          noMoreVideo,
        },
        context: changeCurrentUserContext(ctx, accountOwner),
      });
    } else {
      await taskRepo.update({
        filterByTk: task.id,
        values: {
          autoVideoTime: task.autoVideoTime + videoTimeMinute,
          autoVideoCount: task.autoVideoCount + 1,
          likeCount: likeVideo ? task.likeCount + 1 : task.likeCount,
          followCount: followUser ? task.followCount + 1 : task.followCount,
          noMoreVideo,
        },
      });
    }

    await next();
  };
}

interface IAuthorizationInfo {
  accountId?: number;
  userId?: number;
}

const authorizationMapping = new Map<string, IAuthorizationInfo>();

export function tkRegisterAuthorize() {
  const baseUrl = 'https://www.tiktok.com/v2/auth/authorize';
  const queryParams = {
    client_key: 'sbaw4lzoqtmuncf23w',
    scope: 'user.info.basic,user.info.profile,user.info.stats,video.list,video.upload,video.publish',
    response_type: 'code',
    redirect_uri: `${TIKTOK_API_URL}/api/tiktok:authorizeFeedback`,
    // state: 'v8riw1vurx',
  };

  return async (ctx: Context, next: () => any) => {
    const authorizationRep = ctx.db.getRepository('tk_authorization');

    const userRep = ctx.db.getRepository('users');
    const user = await userRep.create({
      values: {
        nickname: 'user',
        username: faker.internet.userName(),
        // phone: faker.phone.imei(),
        // email: faker.internet.email(),
        appLang: 'en-US',
        password: '123456',
        roles: [
          {
            name: 'tkAppRegisterDemoUser',
          },
        ],
      },
    });

    const state = Math.random().toString(36).substring(2);
    await authorizationRep.create({
      values: {
        state,
        registerUserId: user.id,
      },
    });
    const info: IAuthorizationInfo = { userId: user.id };
    authorizationMapping.set(state, info);
    const url = queryString.stringifyUrl({
      url: baseUrl,
      query: {
        ...queryParams,
        state,
      },
    });

    ctx.redirect(url);
  };
}

async function getTKUserInfo(props: { token: string }): Promise<{
  open_id: string;
  union_id: string;
  username: string;
  display_name: string;
  follower_count: number;
  following_count: number;
  likes_count: number;
  video_count: number;
}> {
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
}

export function tkUpdateRegisterUserInfo() {
  return async (ctx: Context, next: () => any) => {
    const { userId } = (ctx.query as any) || {};

    console.log(`userId:`, userId);
    const tokenRep = ctx.db.getRepository('tk_token');
    const token = await tokenRep.findOne({
      filter: {
        registerUserId: userId,
      },
    });

    // console.log(`token:`, token);
    console.log(`token:`, token.access_token);

    const user = await getTKUserInfo({ token: token.access_token });

    const { username, display_name } = user;

    console.log(`user:`, user);
  };
}

export function tkAuthorize() {
  const baseUrl = 'https://www.tiktok.com/v2/auth/authorize';
  const queryParams = {
    client_key: 'sbaw4lzoqtmuncf23w',
    scope: 'user.info.basic,user.info.profile,user.info.stats,video.list',
    response_type: 'code',
    redirect_uri: `${TIKTOK_API_URL}/tk-authorize`,
    // state: 'v8riw1vurx',
  };
  return async (ctx: Context, next: () => any) => {
    let { accountId } = (ctx.request.query as any) || {};

    const authorizationRep = ctx.db.getRepository('tk_authorization');

    // 如果没有accountId,那么创建一个用户
    if (isNil(accountId)) {
      const userRep = ctx.db.getRepository('users');
      const user = await userRep.create({
        values: {
          nickname: 'user',
          username: faker.internet.userName(),
          phone: faker.phone.imei(),
          email: faker.internet.email(),
          password: '123456',
          // organizationId: organization.id,
          roles: [
            {
              name: 'tkAppRegisterDemoUser',
            },
            // {
            //   name: 'organizationUser',
            // },
          ],
        },
      });
      accountId = user.id;
    }

    let record = await authorizationRep.findOne({
      filter: {
        tk_account_id: accountId,
      },
    });

    const state = Math.random().toString(36).substring(2);
    if (isNil(record)) {
      record = await authorizationRep.create({
        values: {
          tk_account_id: accountId,
          state,
        },
      });
    }

    const url = queryString.stringifyUrl({
      url: baseUrl,
      query: {
        ...queryParams,
        state,
      },
    });

    ctx.redirect(url);
  };
}

export function tkAuthorizeFeedback() {
  const appPort = process.env['APP_PORT'] ? parseInt(process.env['APP_PORT']) : 13000;
  const serverBaseUrl = `http://127.0.0.1:${appPort}/api`;
  const singInUrl = `${serverBaseUrl}/auth:signIn`;
  return async (ctx: Context, next: () => any) => {
    const { code, state, error, errorDescription } = (ctx.query as any) || {};

    if (isNil(code) || isNil(state)) return;

    const authorizationRep = ctx.db.getRepository('tk_authorization');
    const authorization = await authorizationRep.findOne({
      filter: {
        state,
      },
    });

    if (!isNil(authorization.tokenId)) return;

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
        accountId: authorization.accountId,
        registerUserId: authorization.registerUserId,
      },
    });

    await authorizationRep.update({
      filterByTk: authorization.id,
      values: {
        code,
        error,
        errorDescription,
        tokenId: tokenRecord.id,
      },
    });

    if (!isNil(authorization.registerUserId)) {
      const user = await getTKUserInfo({ token: tokenRecord.access_token });
      const feedbackUrl = `${TIKTOK_API_URL}/tk-authorize-feedback`;
      const userRep = ctx.db.getRepository('users');
      await userRep.update({
        values: {
          nickname: user.display_name,
          username: user.username,
        },
        filter: {
          id: authorization.registerUserId,
        },
      });

      const {
        data: { data: tokenRes },
      } = await axios.request({
        url: singInUrl,
        method: 'POST',
        data: {
          account: user.username,
          password: '123456',
        },
      });

      ctx.redirect(
        queryString.stringifyUrl({
          url: feedbackUrl,
          query: {
            type: 'backToHome',
            token: tokenRes.token,
          },
        }),
      );
    }
  };
}

export function tkAuthorizeFeedback_1() {
  const persistingCodes = new Set<string>();
  return async (ctx: Context, next: () => any) => {
    const { code, state, error, errorDescription } = (ctx.request.body as any) || {};

    if (isNil(code) || isNil(state) || persistingCodes.has(code)) return;
    persistingCodes.add(code);
    const authorizationRep = ctx.db.getRepository('tk_authorization');
    const authorization = await authorizationRep.findOne({
      filter: {
        state,
      },
    });
    // 因为授权页面会刷新两次,所以如果是第二次请求,那么就不用更新了
    if (
      !isNil(authorization.tokenId) ||
      (authorization.code === code &&
        authorization.error === error &&
        authorization.errorDescription === errorDescription)
    )
      return;
    const info = authorizationMapping.get(state);

    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_key', 'sbaw4lzoqtmuncf23w');
    params.append('client_secret', 'WM4ScBYDkntf3E99EBM3J386He0AB1Gt');
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', `${TIKTOK_API_URL}/tk-authorize`);

    const { data } = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    if (data.error) return;

    console.log(`---------[ tkAuthorizeFeedback ]---------`);
    console.log(`data:`, data);

    const tokenRep = ctx.db.getRepository('tk_token');

    const tokenRecord = await tokenRep.create({
      values: {
        ...data,
        accountId: info.accountId,
        registerUserId: info.userId,
      },
    });

    await authorizationRep.update({
      filterByTk: authorization.id,
      values: {
        code,
        error,
        errorDescription,
        tokenId: tokenRecord.id,
      },
    });

    const user = await getTKUserInfo({ token: tokenRecord.access_token });
    if (!isNil(authorization.registerUserId)) {
      const userRep = ctx.db.getRepository('users');
      await userRep.update({
        values: {
          nickname: user.display_name,
          username: user.username,
        },
        filterByTk: authorization.registerUserId,
      });
    }

    // if (!isNil(authorization.tk_account_id)) {
    // }

    persistingCodes.delete(code);

    ctx.body = {
      accountId: info.accountId,
      registerUserId: info.userId,
      registerUserName: user.username,
      registerUserPassword: '123456',
    };
  };
}

const getToken = async (props: { ctx: Context; accountId?: number; registerUserId?: number }) => {
  const { ctx, accountId, registerUserId } = props;
  if (isNil(accountId) && isNil(registerUserId)) return null;
  const tokenRep = ctx.db.getRepository('tk_token');

  const $or = [];

  if (!isNil(accountId)) {
    $or.push({ accountId });
  }

  if (!isNil(registerUserId)) {
    $or.push({ registerUserId });
  }

  const record = await tokenRep.findOne({
    filter: { $or },
  });
  if (isNil(record)) return null;

  const updatedAt = dayjs(record.updatedAt);
  const tokenExpiresIn = updatedAt.add(record.expires_in, 's');
  const currentTime = dayjs();
  if (tokenExpiresIn.isAfter(currentTime)) return record.access_token;
  console.log(`---------[ refresh token ]---------`);
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

export function tkUploadResource() {
  // 附件切片 1024*1024是MB,当前切片用500kb
  const CHUNK_UNIT_SIZE = (1024 * 1024) / 2;
  return async (ctx: Context, next: () => any) => {
    const { id } = (ctx.query as any) || {};
    console.log(`---------[ title ]---------`);
    console.log(`---------[ title ]---------`);
    console.log(`---------[ title ]---------`);
    console.log(`query:`, ctx.query);
    console.log(`body:`, ctx.body);
    console.log(`id:`, id);
    if (isNil(id)) return;

    const currentUserId = ctx.state.currentUser?.id;
    console.log(`---------[ currentUser ]---------`);
    console.log(`currentUserId:`, currentUserId);

    const resourceRep = ctx.db.getRepository('tk_posting_resource');

    const resourceRecord = await resourceRep.findOne({
      filterByTk: id,
      appends: ['attachment'],
    });
    // console.log(`resourceRecord:`, resourceRecord);
    if (!isArray(resourceRecord.attachment) || !resourceRecord.attachment.length) return;
    const attachment = resourceRecord.attachment[0];
    // console.log(`attachment:`, attachment);

    const postInfo: { [key: string]: any } = {
      privacy_level: 'SELF_ONLY',
      title: resourceRecord.title,
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
    };

    const filePath = path.join(process.cwd(), attachment.url);
    console.log(`path:`, filePath);
    const videoSize = attachment.size;
    console.log(`videoSize:`, videoSize);
    const extension = getExtension(filePath);
    console.log(`extension:`, extension);

    if (checkIsSupportVideo(extension)) {
      // const videoDuration = await getVideoDurationInSeconds(filePath);
      const videoDuration = 35;
      console.log(`videoDuration:`, videoDuration);
      postInfo.video_cover_timestamp_ms = floor(videoDuration * 1000, 0);
    }

    // console.log(`CHUNK_UNIT_SIZE:`, CHUNK_UNIT_SIZE);
    // const remain = videoSize % CHUNK_UNIT_SIZE;

    // const chunkTotal = (videoSize - remain) / CHUNK_UNIT_SIZE + (remain > 0 ? 1 : 0);
    // console.log(`remain:`, remain);
    // console.log(`chunkTotal:`, chunkTotal);

    const token = await getToken({ ctx, registerUserId: currentUserId });
    console.log(`token:`, token);
    // const arr = Array.from({ length: chunkTotal }).map((_, idx) => {
    //   console.log(`it:`, idx);

    //   // return ()=>new Promise();
    //   const startRange = idx * CHUNK_UNIT_SIZE;
    //   const endRange = idx + 1 !== chunkTotal ? (idx + 1) * CHUNK_UNIT_SIZE : idx * CHUNK_UNIT_SIZE + remain;
    //   const range = `${startRange}-${endRange}`;

    //   return range;
    // });

    const contentRange = `bytes 0-${videoSize - 1}/${videoSize}`;
    console.log(`contentRange:`, contentRange);

    try {
      const {
        data: {
          data: { publish_id, upload_url },
        },
      } = await axios.post(
        'https://open.tiktokapis.com/v2/post/publish/video/init/',
        {
          post_info: postInfo,
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: videoSize,
            chunk_size: videoSize,
            total_chunk_count: 1,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(`---------[ rrrrrrrr ]---------`);
      console.log(`publish_id:`, publish_id);
      console.log(`upload_url:`, upload_url);
      const fileContent = await promises.readFile(filePath);

      const res = await axios.request({
        url: upload_url,
        method: 'PUT',
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Range': contentRange,
          'Content-Length': videoSize,
          Authorization: `Bearer ${token}`,
        },
        data: fileContent,
      });

      const requestStatus = res.status;
      console.log(`requestStatus:`, requestStatus);

      await resourceRep.update({
        values: {
          published: true,
        },
        filter: {
          id: resourceRecord.id,
        },
      });
    } catch (error) {
      console.log(`---------[ upload error ]---------`);
      console.log(error);
    }

    // console.log(`fileContent:`, fileContent);
  };
}

export function tkUploadResource1() {
  return async (ctx: Context, next: () => any) => {
    console.log(`---------[ get id ]---------`);
    console.log(`ctx:`, ctx);
    const { id } = (ctx.request.body as any) || {};
    console.log(`---------[ title ]---------`);
    console.log(`---------[ title ]---------`);
    console.log(`---------[ title ]---------`);
    console.log(`---------[ title ]---------`);
    console.log(`---------[ title ]---------`);
    console.log(`query:`, ctx.query);
    console.log(`body:`, ctx.request.body);

    ctx.body = {
      id,
    };
  };
}
