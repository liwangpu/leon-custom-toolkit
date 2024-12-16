import { MessageTopic } from '../enums';
import { message } from 'antd';
import { IAccountSearchTerm, ITKAccount } from '../interfaces/account';
import { cloneDeep } from 'lodash';

export function useMessageCenter() {
  const sendMessage = (params: { topic: MessageTopic; data?: any }) => {
    const { topic, data } = params;
    // console.log(`params:`, params);
    if (!window['electron']) {
      console.log(`当前不在Electron App中,故该消息将不会发送:`, params);
      message.info(`当前不在Electron App中,故该消息将不会发送:${topic}`);
      return;
    }
    window['electron'].ipcRenderer.sendMessage(topic, data ? cloneDeep(data) : null);
  };

  return {
    startupTiktokWindow(params: { account: ITKAccount }) {
      sendMessage({ topic: MessageTopic.openTKWindow, data: params });
    },
    // shutDownTiktokWindow(params: { account: ITKAccount }) {
    //   sendMessage({ topic: MessageTopic.tkCloseWindow, data: params });
    // },
    // autoWatchVideo(params: { account: ITKAccount }) {
    //   sendMessage({ topic: MessageTopic.tkAutoWatchVideoByKeyword, data: params });
    // },
    // gotoLogin(params: { account: ITKAccount }) {
    //   sendMessage({ topic: MessageTopic.tkGotoLogin, data: params });
    // },
    // gotoRegister(params: { account: ITKAccount }) {
    //   sendMessage({ topic: MessageTopic.tkGotoRegister, data: params });
    // },
    // resetTiktokWindow(params: { account: ITKAccount }) {
    //   sendMessage({ topic: MessageTopic.tkResetWindow, data: params });
    // },
  };
}
