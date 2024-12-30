export const WEBHOOK_DOMAIN_NAME = 'webhooks';
export const WEBHOOK_API_NAME = 'webhook'; // not end with 's'
export const WEBHOOK_TRIGGER_NAMESPACE = 'webhook-trigger';
export const WEBHOOK_TRIGGER_ACTION = 'trigger';
export const WEBHOOK_TRIGGER_RESPONSE_TIMEOUT = 60000;
export const WEBHOOK_TRIGGER_RESPONSE_INTERVAL = 100;
export const WEBHOOK_TRIGGER_HEADER_KEY = 'x-workflow-webhook';
export enum WEBHOOK_TRIGGER_HEADER_STATUS {
  ERROR = 'error',
  NOTFOUND = 'notfound',
  DUPLICATED = 'duplicated',
  UNKOWN = 'unkown',
}
