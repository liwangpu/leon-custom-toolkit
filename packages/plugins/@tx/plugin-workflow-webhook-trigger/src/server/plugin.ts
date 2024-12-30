import { Plugin } from '@nocobase/server';
import WorkflowPlugin from '@nocobase/plugin-workflow';

import { trigger } from './actions';
import { WebhookTrigger } from './trigger';
import { WEBHOOK_DOMAIN_NAME, WEBHOOK_API_NAME, WEBHOOK_TRIGGER_ACTION, WEBHOOK_TRIGGER_NAMESPACE } from '../enums';

export class PluginWorkflowWebhookTriggerServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    const workflowRepo = this.app.db.getRepository(WEBHOOK_DOMAIN_NAME);
    if (!workflowRepo) {
      console.warn('---- webhook trigger respository webhooks may not defined yet ----');
    } else {
      // console.warn('---- webhook trigger respository webhooks found ----');
    }

    // only logged request
    this.app.acl.allow(WEBHOOK_DOMAIN_NAME, ['get', 'list', 'submit'], 'loggedIn');

    // handle http request
    this.app.resourceManager.define({
      name: WEBHOOK_API_NAME,
      actions: {
        trigger,
      },
    });
    this.app.acl.allow(WEBHOOK_API_NAME, WEBHOOK_TRIGGER_ACTION, 'public');

    // get workflow plugin instance
    const workflowPlugin = this.app.pm.get(WorkflowPlugin) as WorkflowPlugin;
    // register trigger
    workflowPlugin.registerTrigger(WEBHOOK_TRIGGER_NAMESPACE, WebhookTrigger);
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginWorkflowWebhookTriggerServer;
