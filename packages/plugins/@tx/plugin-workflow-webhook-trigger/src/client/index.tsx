import { Plugin } from '@nocobase/client';
import WorkflowPlugin from '@nocobase/plugin-workflow/client';

import { WebhookTrigger } from './trigger';
import { WEBHOOK_TRIGGER_NAMESPACE } from '../enums';

export class PluginWorkflowWebhookTriggerClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    const workflow = this.app.pm.get(WorkflowPlugin) as WorkflowPlugin;
    workflow.registerTrigger(WEBHOOK_TRIGGER_NAMESPACE, WebhookTrigger);
  }
}

export default PluginWorkflowWebhookTriggerClient;