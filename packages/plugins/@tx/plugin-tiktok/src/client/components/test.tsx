import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { createStyles, useAPIClient } from '@nocobase/client';
import { Plugin } from '@nocobase/client';
import { ILabelPanelProps, IndicatorCard, LabelPanel } from './LabelPanel';
import { Radio } from 'antd';
import { useEvent } from '../hooks';
import TKVideoCard, { ITKVideoCardProps } from './TKVideoCard';

export const registerTestComponent = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  // app.addComponents({ LabelPanel });

  app.router.add('label-demo', {
    path: 'label-demo',
    Component: LabelPanelDemo,
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
    videoOverviewContainer: css`
      display: flex;
      flex-flow: row;
      gap: 20px;
    `,
    videoCard: css``,
    videoCardTitle: css`
      font-size: 12px;
      color: rgb(136, 139, 166);
    `,
  };
});

const DATE_FILTER_OPTIONS = [
  { value: '7', label: '7 天' },
  { value: '15', label: '15 天' },
  { value: '30', label: '30 天' },
  { value: '90', label: '90 天' },
];

enum panelScope {
  basicOverview = 'basic.overview',
  basicSaleOverview = 'basic.sale.overview',
  basicVideoOverview = 'basic.video.overview',
  basicLiveOverview = 'basic.live.overview',
}

const LabelPanelDemo: React.FC = observer((props) => {
  const { styles } = useStyles();
  const apiClient = useAPIClient();
  const [dateFilterValue, setDateFilterValue] = useState<string>('90');
  const [loading, setLoading] = useState<boolean>();
  const [values, setValues] = useState<Record<string, any>>({});

  const handleDateFilterChange = useEvent((e) => {
    const value = e.target.value;
    setDateFilterValue(value);
  });

  const renderDateFilter = () => {
    return (
      <Radio.Group
        size="middle"
        optionType="button"
        buttonStyle="solid"
        value={dateFilterValue}
        onChange={handleDateFilterChange}
        options={DATE_FILTER_OPTIONS}
      />
    );
  };

  const renderVideoOverview = () => {
    const {
      total_post_video_30d_cnt,
      total_post_video_cnt,
      per_video_duration,
      per_views_avg_cnt,
      per_digg_avg_cnt,
      per_comment_avg_cnt,
      per_sales_avg_cnt,
      total_product_30d_cnt,
      total_new_video_sale_30d_cnt,
      per_gmv_avg_amt,
      total_new_video_sale_gmv_30d_amt,
      most_views_30d_video = {},
      most_gmv_30d_video = {},
    } = values[panelScope.basicVideoOverview] || {};

    const coverSize: ITKVideoCardProps['coverSize'] = {
      width: '114px',
      height: '200px',
    };

    const mostViewVideo: ITKVideoCardProps['video'] = {
      coverUrl: most_views_30d_video.cover_url,
      videoUrl: most_views_30d_video.video_url,
      duration: most_views_30d_video.duration,
      viewCount: most_views_30d_video.views_count,
      diggCount: most_views_30d_video.likes_count,
      commentCount: most_views_30d_video.comments_count,
      shareCount: most_views_30d_video.shares_count,
    };
    const mostGmvVideo: ITKVideoCardProps['video'] = {
      coverUrl: most_gmv_30d_video.cover_url,
      videoUrl: most_gmv_30d_video.video_url,
      duration: most_gmv_30d_video.duration,
      viewCount: most_gmv_30d_video.views_count,
      diggCount: most_gmv_30d_video.likes_count,
      commentCount: most_gmv_30d_video.comments_count,
      shareCount: most_gmv_30d_video.shares_count,
    };
    return (
      <div className={styles.videoOverviewContainer}>
        <IndicatorCard
          subject="发布的视频"
          subjectValue={total_post_video_30d_cnt}
          indicators={[
            {
              label: '视频总数',
              value: total_post_video_cnt,
            },
          ]}
        />

        <IndicatorCard
          subject="平均持续时间"
          subjectValue={per_video_duration}
          indicators={[
            {
              label: '平均播放次数',
              value: per_views_avg_cnt,
            },
            {
              label: '平均点赞次数',
              value: per_digg_avg_cnt,
            },
            {
              label: '平均评论次数',
              value: per_comment_avg_cnt,
            },
          ]}
        />

        <IndicatorCard
          subject="每个视频的平均销量"
          subjectValue={per_sales_avg_cnt}
          indicators={[
            {
              label: '商品数量',
              value: total_product_30d_cnt,
            },
            {
              label: '总销量',
              value: total_new_video_sale_30d_cnt,
            },
          ]}
        />

        <IndicatorCard
          subject="每个视频的平均销售总额"
          subjectValue={per_gmv_avg_amt}
          indicators={[
            {
              label: '总销售额',
              value: total_new_video_sale_gmv_30d_amt,
            },
          ]}
        />

        <div className={styles.videoCard}>
          <div className={styles.videoCardTitle}>观看次数最多</div>
          <TKVideoCard video={mostViewVideo} coverSize={coverSize} />
        </div>
        <div className={styles.videoCard}>
          <div className={styles.videoCardTitle}>最佳销售</div>
          <TKVideoCard video={mostGmvVideo} coverSize={coverSize} />
        </div>
      </div>
    );
  };

  const renderLiveOverview = () => {
    const {
      total_live_30d_cnt,
      total_live_cnt,
      per_live_avg_hour,
      per_live_user_avg_cnt,
      per_digg_avg_cnt,
      per_comment_avg_cnt,
      per_new_live_sale_avg_30d_cnt,
      total_live_product_30d_cnt,
      total_new_live_sale_30d_cnt,
      per_new_live_sale_gmv_avg_30d_amt,
      total_new_live_sale_gmv_30d_amt,
    } = values[panelScope.basicLiveOverview] || {};
    return (
      <div className={styles.videoOverviewContainer}>
        <IndicatorCard
          subject={`${dateFilterValue}天内的直播`}
          subjectValue={total_live_30d_cnt}
          indicators={[
            {
              label: '总直播数',
              value: total_live_cnt,
            },
          ]}
        />
        <IndicatorCard
          subject="平均持续时间"
          subjectValue={per_live_avg_hour}
          indicators={[
            {
              label: '平均观看次数',
              value: per_live_user_avg_cnt,
            },
            {
              label: '平均点赞数',
              value: per_digg_avg_cnt,
            },
            {
              label: '平均评论数',
              value: per_comment_avg_cnt,
            },
          ]}
        />

        <IndicatorCard
          subject="每场直播的平均销量"
          subjectValue={per_new_live_sale_avg_30d_cnt}
          indicators={[
            {
              label: '商品数量',
              value: total_live_product_30d_cnt,
            },
            {
              label: '总销量',
              value: total_new_live_sale_30d_cnt,
            },
          ]}
        />

        <IndicatorCard
          subject="每场直播的平均销售总额"
          subjectValue={per_new_live_sale_gmv_avg_30d_amt}
          indicators={[
            {
              label: '总销售额',
              value: total_new_live_sale_gmv_30d_amt,
            },
          ]}
        />
      </div>
    );
  };

  const settings: Partial<ILabelPanelProps> = {
    groups: [
      {
        key: panelScope.basicOverview,
        title: `过去${dateFilterValue}天情况`,
        rightFilter: renderDateFilter(),
      },
      {
        key: panelScope.basicSaleOverview,
        title: `过去${dateFilterValue}天视频情况`,
      },
      {
        key: 'k1',
        title: `过去${dateFilterValue}天内容趋势`,
        customRender: renderVideoOverview,
      },
      {
        key: 'k2',
        customRender: renderLiveOverview,
      },
    ],
    // values: {
    //   fansGrow: '200K',
    //   sales: '500K',r
    // },
  };

  useEffect(() => {
    console.log(`---------[ do request ]---------`);
    // console.log(`dateFilterValue:`, dateFilterValue);
    (async () => {
      setLoading(true);
      const {
        data: { data },
      } = await apiClient.request({
        url: 'analysis:influencerTrend',
        method: 'GET',
        params: {
          influencerId: '6754795327834735621',
          dateRange: dateFilterValue,
        },
      });
      setValues(data);
      setLoading(false);
      console.log(`data:`, data);
    })();
  }, [dateFilterValue, apiClient]);

  return (
    <div className={styles.page}>
      <LabelPanel {...(settings as any)} loading={loading} values={values} />
    </div>
  );
});

LabelPanelDemo.displayName = 'LabelPanelDemo';
