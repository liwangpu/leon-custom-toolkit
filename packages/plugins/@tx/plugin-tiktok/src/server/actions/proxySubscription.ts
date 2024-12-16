/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Context } from '@nocobase/actions';

export function getSubcription() {
  return async (ctx: Context, next) => {
    const { noid } = ctx.request.query as any;

    const proxySubcriptionRepo = ctx.db.getRepository('proxySubscription');

    const subscription = await proxySubcriptionRepo.findOne({
      filter: {
        noid,
        enabled: true,
      },
    });

    const readable = require('stream').Readable;
    const s = new readable();

    if (!subscription) {
      s.push(null); // indicates end of the stream
      ctx.body = s;
      return await next();
    }

    const subscriptionNodeRepo = ctx.db.getRepository('subscriptionNode');
    const nodes: any[] = await subscriptionNodeRepo.find({
      filter: {
        subcription_id: subscription.id,
        enabled: true,
        path: {
          $ne: null,
        },
      },
    });

    const paths = nodes.map((n) => n.path).join(`\n`);

    s.push(paths);
    s.push(null); // indicates end of the stream
    ctx.body = s;
    await next();
  };
}
