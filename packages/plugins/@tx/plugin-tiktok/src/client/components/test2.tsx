import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { createStyles, useAPIClient } from '@nocobase/client';
import { Plugin } from '@nocobase/client';
import { ILabelPanelProps, IndicatorCard, LabelPanel } from './LabelPanel';
import { Radio } from 'antd';
import { useEvent } from '../hooks';
import TKVideoCard, { ITKVideoCardProps } from './TKVideoCard';
import TKLiveCard, { ITKLiveCardProps } from './TKLiveCard';

export const registerTest2Component = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  // app.addComponents({ LabelPanel });

  app.router.add('label-demo2', {
    path: 'label-demo2',
    Component: LabelPanelDemo2,
  });
};

const useStyles = createStyles(({ css }) => {
  return {
    page: css`
      display: flex;
      flex-flow: column;
      width: 100%;
      height: 100%;
      padding: 20px;
      background-color: rgb(242, 243, 245);
    `,
  };
});

const videoInfo: ITKVideoCardProps = {
  coverSize: {
    width: '140px',
    height: '200px',
  },
  video: {
    duration: '1m',
    viewCount: '2k',
    diggCount: '5k',
    shareCount: '1k',
    commentCount: '1k',
    coverUrl:
      'https://cdn.echotik.shop/089da10fe06adedc96d7881d3da77ee2/67d70da4/video-cover/192/7464633942449196331.jpg',
    videoUrl: 'https://tiktok.com/@dynamitefinds/video/7464633942449196331',
  },
};

const liveInfo: ITKLiveCardProps = {
  coverSize: {
    width: '140px',
    height: '200px',
  },
  live: {
    duration: '1m',
    viewCount: '2k',
    productCnt: '5k',
    saleCnt: '1k',
    gmvAmt: '1k',
    coverUrl:
      'https://cdn.echotik.shop/089da10fe06adedc96d7881d3da77ee2/67d70da4/video-cover/192/7464633942449196331.jpg',
  },
};

const LabelPanelDemo2: React.FC = observer((props) => {
  const { styles } = useStyles();
  const apiClient = useAPIClient();

  return (
    <div className={styles.page}>
      <TKVideoCard {...videoInfo} />
      <TKLiveCard {...liveInfo} />
    </div>
  );
});

LabelPanelDemo2.displayName = 'LabelPanelDemo2';
