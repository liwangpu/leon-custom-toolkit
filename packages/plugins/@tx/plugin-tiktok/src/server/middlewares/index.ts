import type { Plugin } from '@nocobase/server';
import { implementInfluencerMiddleware } from './influencer';

export * from './organization';
export * from './postingResource';
export * from './common';
export * from './echoTikAPI';
export * from './searchTermDetail';
export * from './influencer';

export const implementMiddlewares = (plugin: Plugin) => {
  implementInfluencerMiddleware(plugin);
};
