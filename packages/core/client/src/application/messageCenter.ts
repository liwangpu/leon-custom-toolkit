import { Observable, Subject, Subscription, filter } from 'rxjs';

export interface IMessage {
  topic: string;
  data?: { [key: string]: any };
  source?: string;
  channel?: string;
  [key: string]: any;
}

// @泰香自定义消息订阅
export interface IMessageCenter {
  message$: Observable<IMessage>;
  subscribe(props: { channel?: string; topic: string; key: string; fn: (params: IMessage) => void }): Subscription;
  unSubscribe(key: string): void;
  publish(props: IMessage): void;
  integrateElectron(): void;
}

const _subject = new Subject<IMessage>();

export const MessageCenter: IMessageCenter = (() => {
  const subscriptions = new Map<string, Subscription>();
  let integrated = false;
  return {
    message$: _subject.asObservable(),
    subscribe(props) {
      const { key, topic, fn } = props;
      // 如果有重复的key,那么取消之前的订阅
      if (subscriptions.has(key)) {
        const _sub = subscriptions.get(key);
        _sub.unsubscribe();
      }

      const sub = _subject.pipe(filter((ms) => ms.topic === topic)).subscribe((ms) => fn(ms));
      subscriptions.set(key, sub);
      return sub;
    },
    unSubscribe(key) {
      const sub = subscriptions.get(key);
      sub.unsubscribe();
      subscriptions.delete(key);
    },
    publish(props) {
      _subject.next(props);
    },
    integrateElectron() {
      if (integrated) return;
      if (typeof window['electron'] === 'undefined') {
        console.log(`当前环境不在electron应用中,electron集成将不会生效`);
        return;
      }

      const electron = window['electron'];
      integrated = true;
      electron.ipcRenderer.on('from-electron-main', (props: IMessage) => {
        const { source } = props;
        if (source === 'renderer') return;
        // console.log(`---------[ recieve message ]---------`);
        // console.log(`props:`, props);
        MessageCenter.publish(props);
      });

      _subject.pipe(filter((ms) => ms.channel === 'main')).subscribe((ms) => {
        electron.ipcRenderer.sendMessage(
          'to-electron-main',
          // 多提供一个channelId,用来在不同线路中标记来源,省得事件从来源线路又发回来
          { ...ms, source: 'renderer' },
        );
      });
    },
  };
})();
