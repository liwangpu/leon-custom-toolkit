/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { FC, useCallback } from 'react';
import { createStyles, useAPIClient, useCollectionRecordData, withDynamicSchemaProps } from '@nocobase/client';
import { Button, Flex, Dropdown, Space } from 'antd';
import { ApiOutlined, DownOutlined, SmileOutlined, TabletOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useMessageCenter } from '../hooks';
import { useT } from '../locale';
import { ITKAccount } from '../interfaces/account';

const useStyles = createStyles(({ token, css, cx }) => {
  return {
    container: css`
      // display: flex;
      // align-items: center;
      // width: auto;
      // height: 56px;
    `,
  };
});

export const TKManageButton: FC<any> = withDynamicSchemaProps(
  (props) => {
    const { styles } = useStyles();
    const t = useT();
    const apiClient = useAPIClient();
    const account: ITKAccount = useCollectionRecordData();
    const messageCenter = useMessageCenter();

    const getFullAccount = useCallback(async (id: number) => {
      const {
        data: { data: record },
      } = await apiClient.request({
        url: 'tk_account:get',
        method: 'GET',
        params: {
          filterByTk: id,
          appends: ['country', 'language', 'proxy', 'search_term'],
        },
      });
      return record;
    }, []);

    const items: MenuProps['items'] = [
      {
        key: 'auto_switch_video',
        label: '授权',
        icon: <ApiOutlined />,
        onClick: async ({ domEvent }) => {
          domEvent.stopPropagation();
          // console.log(`account:`, account);
          // const record = await getFullAccount(account.id);
          // messageCenter.autoWatchVideo({ account: record });
        },
      },
      {
        key: 'open',
        label: '打开',
        icon: <TabletOutlined />,
        onClick: async ({ domEvent }) => {
          domEvent.stopPropagation();
          const record = await getFullAccount(account.id);
          messageCenter.startupTiktokWindow({ account: record });
        },
      },
      // {
      //   key: 'auto_switch_video',
      //   label: '刷视频',
      //   // icon: <SmileOutlined />,
      //   onClick: ({ domEvent }) => {
      //     domEvent.stopPropagation();
      //     messageCenter.autoWatchVideo({ account });
      //   },
      // },
      // {
      //   key: 'login',
      //   label: '登录',
      //   // icon: <SmileOutlined />,
      //   onClick: ({ domEvent }) => {
      //     domEvent.stopPropagation();
      //     // console.log(`account:`, account);
      //     messageCenter.gotoLogin({ account });
      //   },
      // },
      // {
      //   key: 'register',
      //   label: '注册',
      //   // icon: <SmileOutlined />,
      //   onClick: ({ domEvent }) => {
      //     domEvent.stopPropagation();
      //     // console.log(`account:`, account);
      //     messageCenter.gotoRegister({ account });
      //   },
      // },
      // {
      //   key: 'close',
      //   label: '关闭',
      //   onClick: ({ domEvent }) => {
      //     domEvent.stopPropagation();
      //     messageCenter.shutDownTiktokWindow({ account });
      //   },
      // },
      // {
      //   key: 'reset',
      //   label: '重置',
      //   onClick: ({ domEvent }) => {
      //     domEvent.stopPropagation();
      //     // messageCenter.resetTiktokWindow({ account });
      //   },
      // },
    ];

    return (
      <Dropdown menu={{ items }}>
        <Button type="link" onClick={(e) => e.preventDefault()}>
          <span>{t('TKManageButton')}</span>
        </Button>
      </Dropdown>
    );
  },
  { displayName: 'TKManageButton' },
);
