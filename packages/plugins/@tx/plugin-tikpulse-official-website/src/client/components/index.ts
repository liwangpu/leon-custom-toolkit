import { Plugin } from '@nocobase/client';
import { registerHomePage } from './HomePage';
import { registerWebsiteSetting } from './WebsiteSetting';
import { registerPackagePurchase } from './PackagePurchase';

export const registerComponents = (props: { plugin: Plugin }) => {
  registerHomePage(props);
  registerWebsiteSetting(props);
  registerPackagePurchase(props);
};
