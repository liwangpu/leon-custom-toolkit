import React, { useEffect, useState } from 'react';
import {
  createStyles,
  ISchema,
  SchemaInitializerItemType,
  SchemaSettings,
  useAPIClient,
  useDataBlockProps,
  useSchemaInitializer,
  withDynamicSchemaProps,
} from '@nocobase/client';
import { Plugin } from '@nocobase/client';
import { useT } from '../locale';
import { ILabelPanelProps, IndicatorCard, LabelPanel } from './LabelPanel';
import TKVideoCard, { ITKVideoCardProps } from './TKVideoCard';
import { Radio } from 'antd';
import { useEvent } from '../hooks';
import { lazy } from '@nocobase/client';
import { formatEnglishNumber, getWofoldMaxNumber, pickProperty } from '../utils';
import TwoChartContainer from './TwoChartContainer';
import { isNil, max } from 'lodash';
import { DATE_FILTER_OPTIONS } from '../consts';
const { DualAxes: G2DualAxes } = lazy(() => import('@ant-design/plots'), 'DualAxes');

const InfluencerOverviewName = 'InfluencerOverview';
const InfluencerOverviewNameLowercase = InfluencerOverviewName.toLowerCase();

enum panelScope {
  basicOverview = 'basic.overview',
  basicSaleOverview = 'basic.sale.overview',
  basicVideoOverview = 'basic.video.overview',
  basicLiveOverview = 'basic.live.overview',
  basicFollowerOverview = 'basic.follower.trending',
  basicDiggOverview = 'basic.digg.trending',
}

export const registerInfluencerOverviewComponent = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.addComponents({ InfluencerOverview });
  // app.addScopes({ useInfoProps });
  app.schemaSettingsManager.add(InfluencerOverviewSettings);
  app.schemaInitializerManager.addItem(
    'popup:common:addBlock',
    `otherBlocks.${InfluencerOverviewInitializerItem.name}`,
    InfluencerOverviewInitializerItem,
  );
};

const useStyles = createStyles(({ css }) => {
  return {
    container: css`
      display: flex;
      flex-flow: column;
      width: 100%;
      /* height: 100%; */
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

const InfluencerOverview: React.FC<any> = withDynamicSchemaProps(
  (props) => {
    const { styles } = useStyles();
    const blockProps = useDataBlockProps();
    const { filterByTk } = blockProps;
    // console.log(`---------[ InfluencerOverview ]---------`);
    // console.log(`blockProps:`, blockProps);
    const apiClient = useAPIClient();
    const [dateFilterValue, setDateFilterValue] = useState<string>('30');
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
        width: '130px',
        height: '200px',
      };

      const mostViewVideo: ITKVideoCardProps['video'] = {
        id: most_views_30d_video.video_id,
        coverUrl: most_views_30d_video.cover_url,
        videoUrl: most_views_30d_video.video_url,
        duration: most_views_30d_video.duration,
        viewCount: most_views_30d_video.views_count,
        diggCount: most_views_30d_video.likes_count,
        commentCount: most_views_30d_video.comments_count,
        shareCount: most_views_30d_video.shares_count,
      };
      const mostGmvVideo: ITKVideoCardProps['video'] = {
        id: most_gmv_30d_video.video_id,
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

          {mostViewVideo && mostViewVideo.videoUrl ? (
            <div className={styles.videoCard}>
              <div className={styles.videoCardTitle}>观看次数最多</div>
              <TKVideoCard video={mostViewVideo} coverSize={coverSize} />
            </div>
          ) : null}
          {mostGmvVideo && mostGmvVideo.videoUrl ? (
            <div className={styles.videoCard}>
              <div className={styles.videoCardTitle}>最佳销售</div>
              <TKVideoCard video={mostGmvVideo} coverSize={coverSize} />
            </div>
          ) : null}
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

          {/* {mostViewVideo && mostViewVideo.videoUrl ? (
            <div className={styles.videoCard}>
              <div className={styles.videoCardTitle}>观看次数最多</div>
              <TKVideoCard video={mostViewVideo} coverSize={coverSize} />
            </div>
          ) : null} */}
        </div>
      );
    };

    const renderTrendingCharts = () => {
      const leftPart = () => {
        const data = pickProperty(values, panelScope.basicFollowerOverview, []);
        const maxYValue = max(data.map((d) => d['粉丝增长']));
        const maxYValueInteger = getWofoldMaxNumber(maxYValue);
        const config = {
          xField: '日期',
          data,
          title: `粉丝的变化趋势（${dateFilterValue}）天`,
          height: 300,
          axis: {
            x: {
              labelFormatter: (text, index) => {
                if (index % 5 === 0) {
                  return text;
                } else {
                  return '';
                }
              },
            },
            y: {
              labelFormatter: (text, index) => {
                return formatEnglishNumber(text);
              },
            },
          },
          legend: {
            color: {
              itemMarker: (v) => {
                if (v === '粉丝增长') return 'rect';
                return 'smooth';
              },
              layout: {
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              },
            },
          },
          children: [
            {
              type: 'interval',
              yField: '粉丝增长',
              axis: {
                y: {
                  title: '粉丝增长',
                  position: 'right',
                  titleFill: '#338AFF',
                },
              },
              scale: {
                y: {
                  domainMax: maxYValueInteger,
                },
              },
            },
            {
              type: 'line',
              yField: '粉丝数',
              shapeField: 'smooth',
              axis: {
                y: {
                  title: '粉丝数',
                  position: 'left',
                  titleFill: '#4CCCCC',
                },
              },
              scale: {
                color: { relations: [['粉丝数', '#4CCCCC']] },
              },
              style: { lineWidth: 2 },
            },
          ],
        };

        return <G2DualAxes {...config} />;
      };

      const rightPart = () => {
        const data = pickProperty(values, panelScope.basicDiggOverview, []);
        const maxYValue = max(data.map((d) => d['点赞数增长']));
        const maxYValueInteger = getWofoldMaxNumber(maxYValue);
        const config = {
          xField: '日期',
          data,
          title: `点赞的趋势（${dateFilterValue}）天`,
          height: 300,
          axis: {
            x: {
              labelFormatter: (text, index) => {
                if (index % 5 === 0) {
                  return text;
                } else {
                  return '';
                }
              },
            },
            y: {
              labelFormatter: (text, index) => {
                return formatEnglishNumber(text);
              },
            },
          },
          legend: {
            color: {
              itemMarker: (v) => {
                if (v === '点赞数增长') return 'rect';
                return 'smooth';
              },
              layout: {
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              },
            },
          },
          children: [
            {
              type: 'interval',
              yField: '点赞数增长',
              axis: {
                y: {
                  title: '点赞数增长',
                  position: 'right',
                  titleFill: '#338AFF',
                },
              },
              scale: {
                y: {
                  domainMax: maxYValueInteger,
                },
              },
            },
            {
              type: 'line',
              yField: '点赞数',
              shapeField: 'smooth',
              axis: {
                y: {
                  title: '点赞数',
                  position: 'left',
                  titleFill: '#4CCCCC',
                },
              },
              scale: {
                color: { relations: [['点赞数', '#4CCCCC']] },
              },
              style: { lineWidth: 2 },
            },
          ],
        };

        return <G2DualAxes {...config} />;
      };

      return <TwoChartContainer left={leftPart()} right={rightPart()} />;
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
          footer: renderTrendingCharts(),
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
    };

    useEffect(() => {
      (async () => {
        setLoading(true);
        const {
          data: { data },
        } = await apiClient.request({
          url: 'analysis:influencerTrend',
          method: 'GET',
          params: {
            influencerId: filterByTk,
            dateRange: dateFilterValue,
          },
        });
        setValues(data);
        setLoading(false);
      })();
    }, [dateFilterValue, filterByTk, apiClient]);

    return (
      <div className={styles.container}>
        <LabelPanel {...(settings as any)} loading={loading} values={values} />
      </div>
    );
  },
  { displayName: InfluencerOverviewName },
);

const InfluencerOverviewSettings = new SchemaSettings({
  name: `blockSettings:${InfluencerOverviewNameLowercase}`,
  items: [
    {
      type: 'remove',
      name: 'remove',
      componentProps: {
        removeParentsIfNoChildren: true,
        breakRemoveOn: {
          'x-component': 'Grid',
        },
      },
    },
  ],
});

const InfluencerOverviewSchema: ISchema = {
  type: 'void',
  'x-decorator': 'BlockItem',
  'x-component': InfluencerOverviewName,
  'x-settings': InfluencerOverviewSettings.name,
  // 'x-component-props': {
  //   style: {
  //     // width: '100%',
  //     // height: '100%',
  //   },
  // },
  properties: {
    [InfluencerOverviewNameLowercase]: {
      'x-component': InfluencerOverviewName,
      // 'x-use-component-props': 'useInfoProps',
    },
  },
};

const InfluencerOverviewInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: InfluencerOverviewNameLowercase,
  icon: 'GoldOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      // title: t('InfluencerOverview'),
      title: '达人详情概览',
      onClick: () => {
        insert(InfluencerOverviewSchema);
      },
    };
  },
};
