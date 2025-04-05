import { Plugin } from '@nocobase/client';
import { registerForcedOfflinePage } from './ForcedOffline';

export const registerComponents = (props: { plugin: Plugin }) => {
  registerForcedOfflinePage(props);
};
