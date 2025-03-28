import { Plugin } from '@nocobase/server';
import { AlipayCenter } from './alipay';
import { EchoTikAPI } from './echoTik';
import { TiktokDataCenter } from './tiktok';

export * from './tiktok';
export * from './echoTik';
export * from './alipay';

export const implementDataCenter = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;
  app.on('afterStart', () => {
    AlipayCenter.startup(props);
    EchoTikAPI.startup(props);
    TiktokDataCenter.startup(props);
  });
};
