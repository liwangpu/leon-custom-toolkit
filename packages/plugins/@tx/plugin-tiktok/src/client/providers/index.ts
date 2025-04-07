import { Plugin } from '@nocobase/client';
import { registerOrganPackageInfoProvider } from './organPackageInfo';
import { registerCustomWSEventHandlerProvider } from './customWSEventHandler';

export const registerProviders = (props: { plugin: Plugin }) => {
  registerOrganPackageInfoProvider(props);
  registerCustomWSEventHandlerProvider(props);
};
