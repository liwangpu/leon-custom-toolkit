import React, { useLayoutEffect } from 'react';
import { Plugin, useAPIClient } from '@nocobase/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { isArray, isNil } from 'lodash';
import dayjs from 'dayjs';

export const registerCustomEventHandlerProvider = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.addProvider(CustomEventHandlerProvider);
};

const CustomEventHandlerProvider = (props) => {
  const { children } = props;
  const apiClient = useAPIClient();
  const navigate = useNavigate();

  useLayoutEffect(() => {
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

    // 监听强制下线事件
    apiClient.app.eventBus.addEventListener(forceOfflineEvent, forceOfflineFn);
    // 监听自定义通知消息
    apiClient.app.eventBus.addEventListener(notificationEvent, customNotificationFn);

    const notifyPurchasePackages = (organId: any) => {
      notification.open({
        message: '温馨提示',
        type: 'success',
        duration: 0,
        placement: 'top',
        description: (() => {
          return (
            <div>
              <span>立即购买,解锁TikTok 运营新境界 &nbsp;&nbsp;</span>
              <a href={`/package-purchase/${organId}`} target="_blank" rel="noreferrer">
                点击购买
              </a>
            </div>
          );
        })(),
      });
    };
    // 监听用户登录事件,提示用户购买/续费套餐
    const signInInterceptor = apiClient.axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.status === 400 && error.config?.url === 'auth:signIn') {
          const errs: Array<{ message: string }> = apiClient.toErrMessages(error);
          const needPurchase = errs.some((e) => {
            const message = e.message;
            return message.includes('请先购买套餐后') || message.includes('请先续费后');
          });
          const organizationId = error.response.headers['x-organization-id'];
          if (needPurchase && !isNil(organizationId)) {
            setTimeout(() => {
              notifyPurchasePackages(organizationId);
            }, 1500);
          }
        }

        throw error;
      },
    );

    return () => {
      apiClient.app.eventBus.removeEventListener(forceOfflineEvent, forceOfflineFn);
      apiClient.app.eventBus.removeEventListener(notificationEvent, customNotificationFn);
      apiClient.axios.interceptors.response.eject(signInInterceptor);
    };
  }, []);

  return <>{children}</>;
};
