import { Plugin } from '@nocobase/client';
import { registerSmsSetting } from './SmsSetting';

export const registerComponents = (props: { plugin: Plugin }) => {
  registerSmsSetting(props);
};
