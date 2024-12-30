import { Context, Next } from '@nocobase/actions';

import {
  WEBHOOK_DOMAIN_NAME,
  WEBHOOK_TRIGGER_HEADER_KEY,
  WEBHOOK_TRIGGER_HEADER_STATUS,
  WEBHOOK_TRIGGER_RESPONSE_INTERVAL,
  WEBHOOK_TRIGGER_RESPONSE_TIMEOUT,
} from '../../enums';
import lodash from 'lodash';

const sleep = (value: number) => new Promise((resolve) => setTimeout(resolve, value));

const responseBody = function (statusCode, data) {
  return `{ status: ${statusCode}, data: '${data}' }`;
};

export async function response(ctx: Context, next: Next) {
  const middlewareResult = ctx.headers[WEBHOOK_TRIGGER_HEADER_KEY];

  ctx.status = 200;
  ctx.withoutDataWrapping = true;
  ctx.set({
    'Content-Type': 'application/json; charset=UTF-8',
  });

  if (middlewareResult === WEBHOOK_TRIGGER_HEADER_STATUS.ERROR) {
    ctx.body = responseBody(500, 'trigger midlleware error');
  } else if (middlewareResult === WEBHOOK_TRIGGER_HEADER_STATUS.NOTFOUND) {
    ctx.body = responseBody(404, 'trigger notfound');
  } else if (middlewareResult === WEBHOOK_TRIGGER_HEADER_STATUS.DUPLICATED) {
    ctx.body = responseBody(500, 'trigger duplicated');
  } else if (middlewareResult === WEBHOOK_TRIGGER_HEADER_STATUS.UNKOWN) {
    ctx.body = responseBody(500, 'trigger unkown error');
  } else {
    try {
      const workflowRepo = ctx.db.getRepository(WEBHOOK_DOMAIN_NAME);
      let workflowData = await workflowRepo.findOne({
        filter: {
          id: middlewareResult,
        },
      });

      if (workflowData) {
        let config: any = { timeout: WEBHOOK_TRIGGER_RESPONSE_TIMEOUT };
        try {
          config = JSON.parse(workflowData.config);
        } catch (e) {
          //
        }

        // wait response is updated
        const internal: number = WEBHOOK_TRIGGER_RESPONSE_INTERVAL;
        let response: string = null;
        // @ts-ignore
        for (let i = 0; i <= 1 + parseInt((config.timeout || WEBHOOK_TRIGGER_RESPONSE_TIMEOUT) / internal); i++) {
          await sleep(internal);

          workflowData = await workflowRepo.findOne({
            filter: {
              id: middlewareResult,
            },
          });

          if (!workflowData) {
            throw new Error(`trigger db ${middlewareResult} not found`);
          }

          response = workflowData.response;

          if (response) {
            break;
          }
        }

        // send timeout or set response
        if (!response) {
          ctx.app.log.error(`trigger ${middlewareResult} timeout`);
          ctx.body = responseBody(408, 'trigger timeout');
        } else {
          const { statusCode, contentType, responseHeaders, responseBody } = JSON.parse(response);

          ctx.status = lodash.isNumber(statusCode) ? statusCode : 200;
          responseHeaders &&
            responseHeaders.forEach((item: { name: string; value: any }) => {
              ctx.res.setHeader(item.name, item.value);
            });
          ctx.body = responseBody;

          ctx.set({
            'Content-Type': contentType + '; charset=UTF-8',
          });
        }
      } else {
        throw new Error(`trigger db ${middlewareResult} not found`);
      }
    } catch (error) {
      ctx.app.log.error('webhook-action-error', error);
      ctx.body = responseBody(500, 'trigger action error');
    }
  }

  await next();
}
