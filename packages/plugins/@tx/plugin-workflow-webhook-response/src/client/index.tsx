import { Plugin } from '@nocobase/client';
import WorkflowPlugin from '@nocobase/plugin-workflow/client';

import { WEBHOOK_RESPONSE_NAMESPACE } from '../enums';
import WebhookResponseInstruction from './instruction';

export class PluginWorkflowWebhookResponseClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    const workflow = this.app.pm.get(WorkflowPlugin) as WorkflowPlugin;
    workflow.registerInstruction(WEBHOOK_RESPONSE_NAMESPACE, WebhookResponseInstruction);
  }
}

export default PluginWorkflowWebhookResponseClient;
