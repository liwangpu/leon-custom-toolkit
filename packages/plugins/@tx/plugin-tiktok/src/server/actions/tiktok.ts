import { Context } from '@nocobase/actions';
import dayjs from 'dayjs';
import { floor } from 'lodash';
import { changeCurrentUserContext } from '../utils';

interface ITKDailyTaskReportData {
  accountId: any;
  searchTermId: any;
  videoTime: number;
  followUser?: boolean;
  likeVideo?: boolean;
}
export function tkDailyTaskReport() {
  return async (ctx: Context, next: () => any) => {
    const data = ctx.request.body as any;
    const { accountId, searchTermId, videoTime, followUser, likeVideo } = data as ITKDailyTaskReportData;
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
        },
      });
    }

    await next();
  };
}
