import { Context } from '@nocobase/actions';
import WorkflowPlugin, { WorkflowModel } from '@nocobase/plugin-workflow';
import qs from 'qs';
import {
  WEBHOOK_API_NAME,
  WEBHOOK_TRIGGER_HEADER_KEY,
  WEBHOOK_TRIGGER_HEADER_STATUS,
  WEBHOOK_TRIGGER_ACTION,
  WEBHOOK_TRIGGER_NAMESPACE,
  WEBHOOK_DOMAIN_NAME,
} from '../../enums';

export async function start(ctx: Context) {
  if (ctx.path.indexOf(`${WEBHOOK_API_NAME}:${WEBHOOK_TRIGGER_ACTION}`) < 0) {
    return;
  }

  const reqdata = {
    headers: ctx.headers,
    path: ctx.path,
    query: ctx.querystring ? qs.parse(ctx.querystring) : {},
    body: ctx.request.body || {},
  };

  const workflowRepo = ctx.db.getRepository('workflows');
  if (!workflowRepo) {
    ctx.app.log.error('webhook-repository-notfound', reqdata);
    ctx.headers[WEBHOOK_TRIGGER_HEADER_KEY] = WEBHOOK_TRIGGER_HEADER_STATUS.ERROR;
  } else {
    const workflowData = await workflowRepo.find({
      filter: {
        type: WEBHOOK_TRIGGER_NAMESPACE,
        enabled: true,
      },
    });

    const matchWorkflows = workflowData.filter((workflow: WorkflowModel) => {
      return (
        workflow.config.from &&
        reqdata.query &&
        typeof reqdata.query['from'] === 'string' &&
        workflow.config.from.toLowerCase() === reqdata.query.from.toLowerCase()
      );
    });

    if (matchWorkflows.length === 1 && ctx.request.method === 'POST') {
      const matchWorkflow = matchWorkflows[0];

      try {
        // console.log(`webhooks:`, ctx.db.getRepository('webhooks'));

        // ctx.body = ctx.db.repositories.values();
        const dbWebhook = await ctx.db.getRepository(WEBHOOK_DOMAIN_NAME).create({
          values: {
            request: JSON.stringify(reqdata),
            config: JSON.stringify(matchWorkflow.config),
          },
        });

        // get workflow plugin instance
        const workflowPlugin = ctx.app.pm.get(WorkflowPlugin) as WorkflowPlugin;

        await workflowPlugin.trigger(matchWorkflow, { webhookId: dbWebhook.id, webhookRequest: reqdata });

        ctx.headers[WEBHOOK_TRIGGER_HEADER_KEY] = `${dbWebhook.id}`;
      } catch (error) {
        ctx.app.log.error('webhook-middleware-data', reqdata);
        ctx.app.log.error('webhook-middleware-reason', error);
        ctx.headers[WEBHOOK_TRIGGER_HEADER_KEY] = WEBHOOK_TRIGGER_HEADER_STATUS.ERROR;
      }
    } else if (matchWorkflows.length === 0) {
      ctx.app.log.error('webhook-middleware-notfound', reqdata);
      ctx.headers[WEBHOOK_TRIGGER_HEADER_KEY] = WEBHOOK_TRIGGER_HEADER_STATUS.NOTFOUND;
    } else if (matchWorkflows.length > 1) {
      ctx.app.log.error('webhook-middleware-duplicated', reqdata);
      ctx.headers[WEBHOOK_TRIGGER_HEADER_KEY] = WEBHOOK_TRIGGER_HEADER_STATUS.DUPLICATED;
    } else {
      ctx.app.log.error('webhook-middleware-unkown', reqdata);
      ctx.headers[WEBHOOK_TRIGGER_HEADER_KEY] = WEBHOOK_TRIGGER_HEADER_STATUS.UNKOWN;
    }
  }
}
