import { MessageCenter } from '@nocobase/client';
import { MessageTopic } from '../enums';
import { message } from 'antd';
import { isNil } from 'lodash';
import { filter } from 'rxjs';

const isElectionEnv = typeof window['electron'] !== 'undefined';

export const subscribeGrowPlanStart = (() => {
  const topic = '@tx/plugin-tiktok:grow-plan-start';
  return {
    subscribe() {
      MessageCenter.subscribe({
        key: 'grow-plan-start',
        topic,
        async fn(props) {
          const { data: messageData, apiClient } = props;
          const { id } = messageData;
          if (!isElectionEnv) {
            message.info(`该功能需要在客户端环境下才生效!`);
            return;
          }
          // console.log(`plan start:`, props);
          const {
            data: { data: plan },
          } = await apiClient.request({
            url: 'tk_grow_fans_plan:get',
            method: 'GET',
            params: {
              filterByTk: id,
              // appends: ['account'],
            },
          });
          const { accountId } = plan;
          const {
            data: { data: searchTerms },
          } = await apiClient.request({
            url: `tk_grow_fans_plan/${id}/searchTermDetail:list`,
            method: 'GET',
            params: {
              filterByTk: id,
              appends: ['searchTerm'],
            },
          });

          if (!searchTerms || !(searchTerms as Array<any>).length) {
            message.info(`当前计划没有设置任何热搜词配置,请先设置再进行启动!`);
            return;
          }

          MessageCenter.publish({
            topic: MessageTopic.startGrowFansPlan,
            data: {
              account: { id: accountId },
              searchTerms,
              plan,
            },
            channel: 'main',
            source: 'renderer',
          });
        },
      });
    },
    unSubscribe() {
      MessageCenter.unSubscribe(topic);
    },
  };
})();

export const subscribeGrowPlanStop = (() => {
  const topic = '@tx/plugin-tiktok:grow-plan-stop';
  return {
    subscribe() {
      MessageCenter.subscribe({
        key: 'grow-plan-stop',
        topic,
        async fn(props) {
          const { data: messageData, apiClient } = props;
          const { id } = messageData;
          if (!isElectionEnv) {
            message.info(`该功能需要在客户端环境下才生效!`);
            return;
          }
          const {
            data: { data: plan },
          } = await apiClient.request({
            url: 'tk_grow_fans_plan:get',
            method: 'GET',
            params: {
              filterByTk: id,
              // appends: ['account'],
            },
          });
          const { accountId } = plan;

          MessageCenter.publish({
            topic: MessageTopic.stopGrowFansPlan,
            data: {
              account: { id: accountId },
              plan,
            },
            channel: 'main',
            source: 'renderer',
          });
        },
      });
    },
    unSubscribe() {
      MessageCenter.unSubscribe(topic);
    },
  };
})();

export const subscribeOpenWindow = (() => {
  const topic = '@tx/plugin-tiktok:open-window';
  return {
    subscribe() {
      MessageCenter.subscribe({
        key: 'open-window',
        topic,
        async fn(props) {
          const { data: account } = props;
          if (!isElectionEnv) {
            message.info(`该功能需要在客户端环境下才生效!`);
            return;
          }
          MessageCenter.publish({
            topic: MessageTopic.openTKWindow,
            data: {
              account,
            },
            channel: 'main',
            source: 'renderer',
          });
        },
      });
    },
    unSubscribe() {
      MessageCenter.unSubscribe(topic);
    },
  };
})();

export const subscribeGrowFansPlanStatusChange = (() => {
  return {
    subscribe() {
      MessageCenter.message$
        .pipe(
          filter(
            (ms) => ms.topic === MessageTopic.afterStartGrowFansPlan || ms.topic === MessageTopic.afterStopGrowFansPlan,
          ),
        )
        .subscribe((ms) => {
          const {
            data: { plan },
          } = ms;
          // console.log(`---------[ plan state change ]---------`);
          // console.log(`ms:`, ms);
          const planId = plan?.id;
          if (isNil(planId)) return;
          const topic = `resource:refresh@tk_grow_fans_plan@${planId}`;
          MessageCenter.publish({
            topic,
            channel: 'renderer',
            source: 'renderer',
            data: {
              resource: 'tk_grow_fans_plan',
              id: planId,
            },
          });
        });
      // MessageCenter.subscribe({
      //   key: 'after-start-grow-fans-plan',
      //   topic: MessageTopic.afterStartGrowFansPlan,
      //   channel: 'renderer',
      //   async fn(props) {
      //     const {
      //       data: { plan },
      //     } = props;
      //     console.log(`---------[ plan state change ]---------`);
      //     console.log(`props:`, props);
      //     const planId = plan?.id;
      //     if (isNil(planId)) return;
      //     const topic = `resource:refresh@tk_grow_fans_plan@${planId}`;
      //     MessageCenter.publish({
      //       topic,
      //       channel: 'renderer',
      //       source: 'renderer',
      //       data: {
      //         resource: 'tk_grow_fans_plan',
      //         id: planId,
      //       },
      //     });
      //   },
      // });
      // MessageCenter.me
    },
    unSubscribe() {
      //
    },
  };
})();
