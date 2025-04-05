import { Plugin } from '@nocobase/client';

export const registerForceOfflineProvider = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;
  console.log(`---------[ adddd ]---------`);
  app.eventBus.addEventListener('ws:message:force-offline', (e) => {
    localStorage.removeItem('NOCOBASE_TOKEN');
    // message.info(`您的账号已经在另一台设备登录,您已被迫下线,请重新登录或者使用其他账号!`, 0);
    window.location.href = '/signin';
  });
};
