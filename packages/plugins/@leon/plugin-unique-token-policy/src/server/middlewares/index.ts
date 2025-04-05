import type { Plugin } from '@nocobase/server';
import { implementTokenCheckMiddleware } from './tokenCheck';

export const implementMiddlewares = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app, db } = plugin;
  app.on('afterStart', () => {
    implementTokenCheckMiddleware(plugin);
  });

  // app.emit('xxxxxx', {});
};
