import { MessageCenter } from '@nocobase/client';
import { MessageTopic } from '../enums';
import { message } from 'antd';
import { isArray, isNil } from 'lodash';
import { filter } from 'rxjs';
import copy from 'copy-to-clipboard';

const isElectionEnv = typeof window['electron'] !== 'undefined';

export const subscribeEvents = () => {
  subscribeGrowPlanStart.subscribe();
  subscribeGrowPlanStop.subscribe();
  subscribeOpenWindow.subscribe();
  subscribeTKAuthorize.subscribe();
  subscribeTKAuthorizeSandbox.subscribe();
  subscribeGrowFansPlanStatusChange.subscribe();
  subscribeCopyAttachmentResourceUrl.subscribe();
  subscribeWatchTKVideo.subscribe();
  subscribeWatchUserVideo.subscribe();
  subscribeViewInfluencer.subscribe();
  subscribePublishResource.subscribe();
  subscribePublishResourceToCurrentUser.subscribe();
  subscribeWatchInfluencerVideo.subscribe();
};

const subscribeGrowPlanStart = (() => {
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
          message.info(`环境监测中,即将启动,请稍等!`);
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

const subscribeGrowPlanStop = (() => {
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
          message.info(`即将停止,请稍等!`);
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

const subscribeOpenWindow = (() => {
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
          message.info(`环境监测中,即将打开,请稍等!`);
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

const subscribeWatchTKVideo = (() => {
  const topic = '@tx/plugin-tiktok:watch-tk-video';
  return {
    subscribe() {
      MessageCenter.subscribe({
        key: 'open-watch-tk-video-window',
        topic,
        async fn(props) {
          const { data } = props;
          const { row } = data;
          if (!isElectionEnv) {
            message.info(`该功能需要在客户端环境下才生效!`);
            return;
          }
          message.info(`即将打开,请稍等!`);
          MessageCenter.publish({
            topic: MessageTopic.watchTKVideo,
            data: {
              video: row,
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

const subscribeWatchUserVideo = (() => {
  const topic = '@tx/plugin-tiktok:view-user-video';
  return {
    subscribe() {
      MessageCenter.subscribe({
        key: 'view-tk-user-video-handler',
        topic,
        async fn(props) {
          const { data } = props;
          const { row } = data;
          if (!isElectionEnv) {
            message.info(`该功能需要在客户端环境下才生效!`);
            return;
          }
          message.info(`即将打开,请稍等!`);
          MessageCenter.publish({
            topic: MessageTopic.watchTKVideo,
            data: {
              video: {
                video_id: row.id,
              },
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

const subscribeViewInfluencer = (() => {
  const topic = '@tx/plugin-tiktok:view-tk-influencer';
  return {
    subscribe() {
      MessageCenter.subscribe({
        key: 'view-tk-influencer-handler',
        topic,
        async fn(props) {
          const { data } = props;
          const { row } = data;
          if (!isElectionEnv) {
            message.info(`该功能需要在客户端环境下才生效!`);
            return;
          }
          message.info(`即将打开,请稍等!`);
          MessageCenter.publish({
            topic: MessageTopic.viewInfluencer,
            data: {
              influencer: {
                unique_id: row.unique_id,
                influencer_id: row.influencer_id,
                avatar_url: row.avatar_url,
              },
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

const subscribePublishResource = (() => {
  const topic = '@tx/plugin-tiktok:publish-video-resource';
  return {
    subscribe() {
      MessageCenter.subscribe({
        key: 'publish-video-resource-handler',
        topic,
        async fn(props) {
          const { data, apiClient } = props;
          const { id } = data;
          console.log(`props:`, props);
          const {
            data: { data: res },
          } = await apiClient.request({
            url: 'tiktok:releaseResource',
            method: 'GET',
            params: {
              id,
            },
          });
        },
      });
    },
    unSubscribe() {
      MessageCenter.unSubscribe(topic);
    },
  };
})();

/**
 * tk授权
 */
const subscribeTKAuthorize = (() => {
  const topic = '@tx/plugin-tiktok:tk-authorize';
  return {
    subscribe() {
      MessageCenter.subscribe({
        key: 'tk-authorize',
        topic,
        async fn(props) {
          const { data: account } = props;
          if (!isElectionEnv) {
            message.info(`该功能需要在客户端环境下才生效!`);
            return;
          }

          message.info(`环境监测中,即将打开,请稍等!`);
          MessageCenter.publish({
            topic: MessageTopic.authorize,
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

const subscribeTKAuthorizeSandbox = (() => {
  const topic = '@tx/plugin-tiktok:tk-authorize-sandbox';
  return {
    subscribe() {
      MessageCenter.subscribe({
        key: 'tk-authorize-temp',
        topic,
        async fn(props) {
          const { data: account } = props;
          if (!isElectionEnv) {
            message.info(`该功能需要在客户端环境下才生效!`);
            return;
          }

          message.info(`环境监测中,即将打开,请稍等!`);
          MessageCenter.publish({
            topic: MessageTopic.authorizeSandbox,
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

const subscribeCopyAttachmentResourceUrl = (() => {
  const topic = 'attachment_resource_url_copy';
  return {
    subscribe() {
      MessageCenter.subscribe({
        key: 'attachment_resource_url_copy_handler',
        topic,
        async fn(props) {
          const { data, apiClient } = props;
          const { id } = data;

          const {
            data: { data: resource },
          } = await apiClient.request({
            url: `attachment_resource:get`,
            method: 'GET',
            params: {
              filterByTk: id,
              appends: ['attachment'],
            },
          });

          const attachments: Array<any> = resource.attachment;
          if (isNil(attachments) || !isArray(attachments) || !attachments.length) {
            message.info(`没有上传附件信息!`);
            return;
          }
          const origin = window.location.origin;
          const { url } = attachments[0];

          const fullUrl = `${origin}${url}`;
          copy(fullUrl);
        },
      });
    },
    unSubscribe() {
      MessageCenter.unSubscribe(topic);
    },
  };
})();

const subscribeGrowFansPlanStatusChange = (() => {
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

/**
 *  把视频发布到当前用户对应的tk账号
 */
const subscribePublishResourceToCurrentUser = (() => {
  const topic = '@tx/plugin-tiktok:publish-video-to-current-user';
  return {
    subscribe() {
      MessageCenter.subscribe({
        key: 'publish-video-to-current-user-handler',
        topic,
        async fn(props) {
          const { data, apiClient } = props;
          const { id, row } = data;
          console.log(`---------[ subscribePublishResourceToCurrentUser ]---------`);
          console.log(`props:`, props);
          console.log(`data:`, data);
          console.log(`row:`, row);
          // if (!isElectionEnv) {
          //   message.info(`该功能需要在客户端环境下才生效!`);
          //   return;
          // }
          // message.info(`即将打开,请稍等!`);
          // MessageCenter.publish({
          //   topic: MessageTopic.viewInfluencer,
          //   data: {
          //     influencer: {
          //       unique_id: row.unique_id,
          //       influencer_id: row.influencer_id,
          //       avatar_url: row.avatar_url,
          //     },
          //   },
          //   channel: 'main',
          //   source: 'renderer',
          // });
          const {
            data: { data: plan },
          } = await apiClient.request({
            url: 'tiktok:mockPublishVideoToCurrentUserToAccount',
            method: 'GET',
            params: {
              id,
            },
          });
        },
      });
    },
    unSubscribe() {
      MessageCenter.unSubscribe(topic);
    },
  };
})();

const subscribeWatchInfluencerVideo = (() => {
  const topic = '@tx/plugin-tiktok:watch-influencer-video';
  return {
    subscribe() {
      MessageCenter.subscribe({
        key: 'watch-influencer-video-window',
        topic,
        async fn(props) {
          const { data } = props;
          const { row } = data;
          if (!isElectionEnv) {
            message.info(`该功能需要在客户端环境下才生效!`);
            return;
          }
          message.info(`即将打开,请稍等!`);
          MessageCenter.publish({
            topic: MessageTopic.watchTKVideo,
            data: {
              video: row,
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
