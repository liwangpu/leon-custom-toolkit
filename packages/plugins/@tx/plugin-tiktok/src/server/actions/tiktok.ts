import { Context } from '@nocobase/actions';
import dayjs from 'dayjs';
import { floor, isArray, isNil, snakeCase } from 'lodash';
import { changeCurrentUserContext, getExtension } from '../utils';
import axios from 'axios';
import path from 'path';
import { promises } from 'fs';
import { ITKToken } from '../../interfaces';
import { TiktokDataCenter } from '../dataCenter';
import { getUserInfo } from '../middlewares';

interface IGrowFansPlanReportData {
  planId: number;
  planDetailId: number;
  searchTermId: number;
  accountId: any;
  videoTime: number;
  followUser?: boolean;
  likeVideo?: boolean;
  noMoreVideo?: boolean;
}

export function tkGrowFansPlanReport() {
  return async (ctx: Context, next: () => any) => {
    const data = ctx.request.body as any;
    const { planId, planDetailId, searchTermId, accountId, videoTime, followUser, likeVideo, noMoreVideo } =
      data as IGrowFansPlanReportData;
    console.log(`---------[ tkGrowFansPlanReport ]---------`);
    console.log(`data:`, data);
    const currentTime = dayjs();
    const currentTimeStr = currentTime.format('YYYY-MM-DD');
    const logRepo = ctx.db.getRepository('tk_grow_fans_plan_log');
    const planDetailRepo = ctx.db.getRepository('tk_grow_fans_plan_detail');

    let log = await logRepo.findOne({
      filter: {
        date: currentTimeStr,
        planId,
        planDetailId,
        searchTermId,
        accountId,
      },
    });

    const planDetail = await planDetailRepo.findById(planDetailId);

    const videoTimeMinute = floor(videoTime / 60, 2);
    if (!log) {
      const tkAccountRepo = ctx.db.getRepository('tk_account');
      const tkAccount = await tkAccountRepo.findByTargetKey(accountId);
      const accountOwner = tkAccount.createdById;
      log = await logRepo.create({
        values: {
          date: currentTimeStr,
          planId,
          planDetailId,
          accountId,
          searchTermId,
          watchTime: videoTimeMinute,
          watchCount: 1,
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
      await logRepo.update({
        filterByTk: log.id,
        values: {
          watchTime: log.watchTime + videoTimeMinute,
          watchCount: log.watchCount + 1,
          likeCount: likeVideo ? log.likeCount + 1 : log.likeCount,
          followCount: followUser ? log.followCount + 1 : log.followCount,
          noMoreVideo,
        },
      });
    }

    await planDetailRepo.update({
      filterByTk: planDetailId,
      values: {
        watchTime: planDetail.watchTime + videoTimeMinute,
        watchCount: planDetail.watchCount + 1,
        likeCount: likeVideo ? planDetail.likeCount + 1 : planDetail.likeCount,
        followCount: followUser ? planDetail.followCount + 1 : planDetail.followCount,
        noMoreVideo,
      },
    });

    await next();
  };
}

export function tkRegisterAuthorize() {
  const appPort = process.env['APP_PORT'] ? parseInt(process.env['APP_PORT']) : 13000;
  const serverBaseUrl = `http://127.0.0.1:${appPort}/api`;
  const singInUrl = `${serverBaseUrl}/auth:signIn`;
  return async (ctx: Context, next: () => any) => {
    // tk注册演示用户,需要设置一个对应的tk account id
    const tkRegisterMapToAccountId = 79;

    const {
      data: {
        data: { token },
      },
    } = await axios.request({
      url: singInUrl,
      method: 'POST',
      data: {
        account: 'tkRegister',
        password: '123456',
      },
    });
    console.log(`---------[ tkRegisterAuthorize ]---------`);
    console.log(`tokenRes:`, token);
    await TiktokDataCenter.requestToken({
      ctx,
      next,
      accountId: tkRegisterMapToAccountId,
      feedbackRedirectParam: { isRegisterUser: true, token },
    });
  };
}

export function tkAuthorize() {
  return async (ctx: Context, next: () => any) => {
    const { accountId } = (ctx.request.query as any) || {};

    await TiktokDataCenter.requestToken({ ctx, next, accountId });
  };
}

export function tkAuthorizeFeedback() {
  return (ctx: Context, next: () => any) => {
    return TiktokDataCenter.tokenFeedback({ ctx, next });
  };
}

function checkIsSupportVideo(extension: string) {
  return extension === 'mp4' || extension === 'mov' || extension === 'webm';
}

export function releaseResource() {
  // 附件切片 1024*1024是MB,当前切片用500kb
  const CHUNK_UNIT_SIZE = (1024 * 1024) / 2;
  const publishingSet = new Set<number>();
  return async (ctx: Context, next: () => any) => {
    const { id } = (ctx.query as any) || {};

    if (isNil(id) || publishingSet.has(id)) return;
    publishingSet.add(id);

    const resourceRep = ctx.db.getRepository('tk_posting_resource');
    const releaseRep = ctx.db.getRepository('tk_posting_resource_release');

    const releaseRecord = await releaseRep.findOne({
      filterByTk: id,
      appends: ['attachment', 'accounts'],
    });
    // console.log(`releaseRecord:`, releaseRecord);
    if (!isArray(releaseRecord.attachment) || !releaseRecord.attachment.length) return;
    const attachment = releaseRecord.attachment[0];
    // console.log(`attachment:`, attachment);

    const resourceRecord = await resourceRep.findOne({
      filterByTk: releaseRecord.sourceResourceId,
    });

    const content = `${releaseRecord.content} #${releaseRecord.title}`;
    const postInfo: { [key: string]: any } = {
      privacy_level: 'SELF_ONLY',
      title: content,
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
    };

    const filePath = path.join(process.cwd(), attachment.url);
    const videoSize = attachment.size;
    const extension = getExtension(filePath);
    // console.log(`extension:`, extension);

    if (checkIsSupportVideo(extension)) {
      const videoDuration = resourceRecord.duration;
      postInfo.video_cover_timestamp_ms = floor(videoDuration * 1000, 0);
    }

    // console.log(`CHUNK_UNIT_SIZE:`, CHUNK_UNIT_SIZE);
    // const remain = videoSize % CHUNK_UNIT_SIZE;

    // const chunkTotal = (videoSize - remain) / CHUNK_UNIT_SIZE + (remain > 0 ? 1 : 0);
    // console.log(`remain:`, remain);
    // console.log(`chunkTotal:`, chunkTotal);

    const accounts: Array<any> = releaseRecord.accounts;
    if (!isArray(accounts) || !accounts.length) return;
    const firstAccount = accounts[0];
    // console.log(`firstAccount:`, firstAccount);
    const releaseToAccount = async (accountId: number) => {
      //
      const token = await TiktokDataCenter.getToken({ ctx, accountId });
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

      try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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

        const fileContent = await promises.readFile(filePath);

        const res = await axios.request({
          url: upload_url,
          method: 'PUT',
          headers: {
            'Content-Type': `video/${extension}`,
            'Content-Range': contentRange,
            'Content-Length': videoSize,
            Authorization: `Bearer ${token}`,
          },
          data: fileContent,
        });

        const requestStatus = res.status;

        await releaseRep.update({
          filterByTk: id,
          values: {
            status: 'uploadSuccessful',
            errorMessage: null,
          },
        });
      } catch (error) {
        console.log(`---------[ upload error ]---------`);
        const { status, statusText } = error?.response || {};
        const errorMessage = `状态:${status};详细信息:${statusText}`;
        console.log(`response:`, error);
        console.log(`errorMessage:`, errorMessage);
        await releaseRep.update({
          filterByTk: id,
          values: {
            status: 'uploadError',
            errorMessage,
          },
        });
      }
    };
    publishingSet.delete(id);
    await releaseToAccount(firstAccount.id);
    // await Promise.all(accounts.map((acc) => releaseToAccount(acc.id)));
  };
}

export function syncAccountInfo() {
  return async (ctx: Context, next: () => any) => {
    const { id: accountId } = (ctx.query as any) || {};
    return TiktokDataCenter.syncAccountInfo({ ctx, accountId });
  };
}

export function syncAllAccountInfos() {
  return async (ctx: Context, next: () => any) => {
    const tokenRep = ctx.db.getRepository('tk_token');
    const tokenRecords: Array<ITKToken> = await tokenRep.find({
      filter: {
        accountId: {
          $notEmpty: true,
        },
      },
    });

    for (const record of tokenRecords) {
      await TiktokDataCenter.syncAccountInfo({ ctx, accountId: record.accountId });
    }

    ctx.body = {
      tokenRecords,
    };
  };
}

export function mockPublishVideoToCurrentUserToAccount() {
  return async (ctx: Context, next: () => any) => {
    const { id: sourceResourceId } = (ctx.query as any) || {};
    console.log(`---------[ mockPublishVideoToCurrentUserToAccount ]---------`);
    console.log(`sourceResourceId:`, sourceResourceId);
    const { organizationId, userId } = getUserInfo({
      ctx,
    });
    const resourceRep = ctx.db.getRepository('tk_posting_resource');
    const releaseRep = ctx.db.getRepository('tk_posting_resource_release');
    const resource = await resourceRep.findOne({
      filterByTk: sourceResourceId,
      appends: ['attachment'],
    });
    const configSettingRep = ctx.db.getRepository('configSetting');
    const setting = await configSettingRep.findByTargetKey('tiktokAppRegisterConfig');
    const { accountId } = setting.value;
    console.log(`accountId:`, accountId);
    console.log(`resource.attachment:`, resource.attachment);
    const data = {
      title: resource.title,
      content: resource.content,
      duration: resource.duration,
      attachment: resource.attachment,
      accounts: [
        {
          id: accountId,
        },
      ],
      organizationId,
    };

    // console.log(`resource:`, resource);
    console.log(`data:`, data);

    await releaseRep.create({
      values: data,
    });
    // const data = {
    //   ...values,
    //   id: null,
    //   organizationId,
    //   attachment: attachment.dataValues,
    //   accounts: [acc],
    // };

    ctx.body = {
      // tokenRecords,
    };
  };
}
