import React from 'react';
import { Plugin, useAPIClient } from '@nocobase/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { isArray, isNil } from 'lodash';
import dayjs from 'dayjs';

export const registerCustomWSEventHandlerProvider = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.addProvider(CustomWSEventHandlerProvider);
};

const CustomWSEventHandlerProvider = (props) => {
  const { children } = props;
  const apiClient = useAPIClient();
  const navigate = useNavigate();
  useEffect(() => {
    const forceOfflineEvent = 'ws:message:force-offline';
    const notificationEvent = 'ws:message:custom-notification';
    const forceOfflineFn = (e) => {
      localStorage.removeItem('NOCOBASE_TOKEN');
      notification.open({
        message: '温馨提示',
        duration: 0,
        description: `您的账号已经在另一台设备登录,您已被迫下线,请重新登录或者使用其他账号登录!`,
      });
      navigate('/signin');
    };

    const customNotificationFn = (e) => {
      const { detail } = e as any;
      const { message, messageKey } = detail as Record<string, any>;
      const storageKey = `${messageKey}`;
      const today = dayjs().format('YYYY-MM-DD');
      // 如果今天通知过了,用户点击关闭,那么今天不再通知
      if (localStorage.getItem(storageKey) === today) return;
      let messageArr = [];

      if (!isNil(message)) {
        if (isArray(message)) {
          messageArr = message;
        } else {
          messageArr.push(message);
        }
      }
      notification.open({
        message: '温馨提示',
        duration: 0,
        description: (() => {
          return (
            <div>
              {messageArr.map((ms, idx) => (
                <div key={idx}>{ms}</div>
              ))}
            </div>
          );
        })(),
        onClose() {
          localStorage.setItem(storageKey, today);
        },
      });
    };

    apiClient.app.eventBus.addEventListener(forceOfflineEvent, forceOfflineFn);
    apiClient.app.eventBus.addEventListener(notificationEvent, customNotificationFn);

    return () => {
      apiClient.app.eventBus.removeEventListener(forceOfflineEvent, forceOfflineFn);
      apiClient.app.eventBus.removeEventListener(notificationEvent, customNotificationFn);
    };
  }, []);

  return <>{children}</>;
};
