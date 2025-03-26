import { Plugin } from '@nocobase/client';
import { registerHomePage } from './HomePage';
import { registerWebsiteSetting } from './WebsiteSetting';

export const registerComponents = (props: { plugin: Plugin }) => {
  registerHomePage(props);
  registerWebsiteSetting(props);
};
