import { Trigger, WorkflowModel } from '@nocobase/plugin-workflow';

export class WebhookTrigger extends Trigger {
  on(workflow: WorkflowModel) {}

  off(workflow) {}
}
