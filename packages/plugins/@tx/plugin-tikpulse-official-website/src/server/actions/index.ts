import { Plugin } from '@nocobase/server';
import { registerApplyUserActions } from './applyUser';
import { registerAssetsActions } from './assets';
import { registerWebsiteSettingActions } from './websiteSetting';

export const registerActions = (props: { plugin: Plugin }) => {
  registerApplyUserActions(props);
  registerAssetsActions(props);
  registerWebsiteSettingActions(props);
};
