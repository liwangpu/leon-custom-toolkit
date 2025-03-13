import { IPostingResource, IPostingResourceRelease } from '../../interfaces';
import Database from '@nocobase/database';
import { isArray, isNil, floor } from 'lodash';
// import { getVideoDurationInSeconds } from 'get-video-duration';
import path from 'path';
import { serverRequest } from '../middlewares';
import { getVideoDuration } from '../utils';

export function calculateVideoDuration(props: { db: Database }) {
  const { db } = props;
  return async (record: IPostingResource, options) => {
    const { values } = options;
    const { latestCalculateAttachmentId } = record;
    let { attachment } = values;
    if (isArray(attachment) && attachment.length) {
      attachment = attachment[0];
    }

    if (isNil(attachment) || isNil(attachment.id)) return;

    const attachmentId = attachment.id;
    if (latestCalculateAttachmentId === attachmentId) {
      // console.log(`---------[ 已经计算过,无需重复计算 ]---------`);
      return;
    }
    const attachmentRep = db.getRepository('attachments');
    const attachmentRecord = await attachmentRep.findById(attachmentId);
    const filePath = path.join(process.cwd(), attachmentRecord.url);
    const duration = await getVideoDuration(filePath);
    record.duration = duration;
    record.latestCalculateAttachmentId = attachmentId;
  };
}

export function afterCreatePostingResourceRelease(props: { db: Database }) {
  const { db } = props;
  return async (record: IPostingResourceRelease, options) => {
    const { transaction, name, dataIndex, context, values } = options;

    setTimeout(() => {
      serverRequest({
        url: `tiktok:releaseResource`,
        method: 'GET',
        params: {
          id: record.id,
        },
      });
    }, 1500);

    // if (isNil(record.sourceResourceId)) return;

    // const { accounts } = values as { accounts: Array<any> };

    // const resourceRep = db.getRepository('tk_posting_resource');
    // const releaseRep = db.getRepository('tk_posting_resource_release');

    // const resource = await resourceRep.findOne({
    //   filterByTk: record.sourceResourceId,
    //   appends: ['attachment'],
    // });

    // console.log(`---------[ afterCreatePostingResourceRelease ]---------`);

    // if (isArray(resource.attachment) && resource.attachment.length) {
    //   const attachment = resource.attachment[0];
    //   wait(1500, async () => {
    //     const firstAccount = accounts[0];
    //     await releaseRep.update({
    //       filterByTk: record.id,
    //       values: {
    //         attachment,
    //         accounts: [firstAccount],
    //       },
    //     });
    //     const restAccounts = accounts.slice(1);
    //     console.log(`restAccounts:`, restAccounts);
    //     for (const acc of restAccounts) {
    //       const data = {
    //         ...record,
    //         id: null,
    //         attachment,
    //         accounts: [acc],
    //       };
    //       console.log(`data:`, data);
    //       await releaseRep.create({
    //         values: data,
    //       });
    //     }
    //   });
    // }
  };
}
