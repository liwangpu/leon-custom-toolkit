import { Plugin } from '@nocobase/server';
import WorkflowPlugin from '@nocobase/plugin-workflow';

import { WebhookResponseInstruction } from './instruction';
import { WEBHOOK_DOMAIN_NAME, WEBHOOK_RESPONSE_NAMESPACE } from '../enums';

export class PluginWorkflowWebhookResponseServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    const workflowPlugin = this.app.pm.get(WorkflowPlugin) as WorkflowPlugin;
    // register instruction
    workflowPlugin.registerInstruction(WEBHOOK_RESPONSE_NAMESPACE, WebhookResponseInstruction);
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginWorkflowWebhookResponseServer;
