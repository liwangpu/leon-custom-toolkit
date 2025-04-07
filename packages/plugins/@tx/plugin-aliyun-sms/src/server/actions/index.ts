import { Plugin } from '@nocobase/server';
import { registerAliyunSmsActions } from './sms';

export const registerActions = (props: { plugin: Plugin }) => {
  registerAliyunSmsActions(props);
};
