import { Context } from '@nocobase/actions';
import dayjs from 'dayjs';
import { floor, isNil } from 'lodash';
import { changeCurrentUserContext } from '../utils';
import queryString from 'query-string';
import axios from 'axios';

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

export function tkAuthorize() {
  const baseUrl = 'https://www.tiktok.com/v2/auth/authorize';
  const queryParams = {
    client_key: 'sbaw4lzoqtmuncf23w',
    scope: 'user.info.basic,user.info.profile,user.info.stats,video.list',
    response_type: 'code',
    redirect_uri: 'https://astrolabe.taixiang-tech.com/tk-authorize',
    state: 'v8riw1vurx',
  };
  return async (ctx: Context, next: () => any) => {
    const { accountId } = (ctx.request.query as any) || {};
    console.log(`----------------[ data ]----------------`);
    console.log(accountId);
    const authorizationRep = ctx.db.getRepository('tk_authorization');
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
  const persistingCodes = new Set<string>();
  return async (ctx: Context, next: () => any) => {
    const { code, state, error, errorDescription } = (ctx.request.body as any) || {};
    console.log(`----------------[ data ]----------------`);
    if (isNil(code) || isNil(state) || persistingCodes.has(code)) return;
    persistingCodes.add(code);
    const authorizationRep = ctx.db.getRepository('tk_authorization');
    const record = await authorizationRep.findOne({
      filter: {
        state,
      },
    });
    // 因为授权页面会刷新两次,所以如果是第二次请求,那么就不用更新了
    if (record.code === code && record.error === error && record.errorDescription === errorDescription) return;

    await authorizationRep.update({
      filterByTk: record.id,
      values: {
        code,
        error,
        errorDescription,
      },
    });

    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_key', 'sbaw4lzoqtmuncf23w');
    params.append('client_secret', 'WM4ScBYDkntf3E99EBM3J386He0AB1Gt');
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', 'https://astrolabe.taixiang-tech.com/tk-authorize');

    const { data } = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const tokenRep = ctx.db.getRepository('tk_token');
    console.log(`---------[ data ]---------`);
    console.log(data);
    await tokenRep.create({
      values: data,
    });

    persistingCodes.delete(code);
  };
}

// export function tkFetchTokenFeedback() {
//   return async (ctx: Context, next: () => any) => {
//     // const { open_id, scope, access_token, expires_in, refresh_token, refresh_expires_in, token_type } =
//     //   (ctx.request.body as any) || {};
//     console.log(`----------------[ data ]----------------`);

//     const tokenRep = ctx.db.getRepository('tk_token');

//     // tokenRep.create({
//     //   values: ctx.request.body,
//     // });

//     const params = new URLSearchParams();
//     params.append(
//       'code',
//       'TIfJRZsbKvuAXReXY3DnC371vPaviYTCrx2EAibIshSHSkQuHl9bHnjej9HIPHgJuu5jMM1SV8rShXScKUqoinVczXFjIyugKBMyIMtDqjhiUtK2dKol17vC15iAVq3XpbuImW9l9E3jyd4gvtoZk7osNYEsQz2jaiDcIt66KssO9hH_SJ1FBHso6T1z7fOllSSWm5pmHZfmcqHzh1vbFQ*0!5022.e1',
//     );
//     params.append('client_key', 'sbaw4lzoqtmuncf23w');
//     params.append('client_secret', 'WM4ScBYDkntf3E99EBM3J386He0AB1Gt');
//     params.append('grant_type', 'authorization_code');
//     params.append('redirect_uri', 'https://astrolabe.taixiang-tech.com/tk-authorize');

//     const { data } = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', params, {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//     });

//     console.log(`---------[ data ]---------`);
//     console.log(data);
//     tokenRep.create({
//       values: data,
//     });
//   };
// }
