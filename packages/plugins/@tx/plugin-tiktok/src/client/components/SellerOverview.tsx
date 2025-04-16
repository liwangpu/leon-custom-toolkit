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
import { ILabelPanelProps, LabelPanel } from './LabelPanel';
import { Radio } from 'antd';
import { useEvent } from '../hooks';
import { lazy } from '@nocobase/client';
import { formatEnglishNumber, getWofoldMaxNumber, pickProperty } from '../utils';
import TwoChartContainer from './TwoChartContainer';
import { max } from 'lodash';
import { DATE_FILTER_OPTIONS } from '../consts';
const { DualAxes: G2DualAxes } = lazy(() => import('@ant-design/plots'), 'DualAxes');
const { Column: G2Column } = lazy(() => import('@ant-design/plots'), 'Column');

const SellerOverviewName = 'SellerOverview';
const SellerOverviewNameLowercase = SellerOverviewName.toLowerCase();

enum panelScope {
  basicOverview = 'basic.overview',
  basicSalesCNTTrending = 'basic.sales.cnt.trending',
  basicSalesGMVTrending = 'basic.sales.gmv.trending',
  basicInfluencerTrending = 'basic.influencer.trending',
  basicVideoTrending = 'basic.video.trending',
}

const GMVANDCNT_FILTER_OPTIONS = [
  { value: 'total_sale_cnt', label: '销量' },
  { value: 'total_sale_gmv_amt', label: 'GMV' },
];

export const registerSellerOverviewComponent = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.addComponents({ SellerOverview });
  app.schemaSettingsManager.add(SellerOverviewSettings);
  app.schemaInitializerManager.addItem(
    'popup:common:addBlock',
    `otherBlocks.${SellerOverviewInitializerItem.name}`,
    SellerOverviewInitializerItem,
  );
};

const useStyles = createStyles(({ css }) => {
  return {
    container: css`
      display: flex;
      flex-flow: column;
      width: 100%;
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
    trendingOperators: css`
      display: flex;
      justify-content: flex-end;
    `,
  };
});

const cntAndGmvCols = {
  total_sale_cnt: ['总销量', '日销量'],
  total_sale_gmv_amt: ['总销售额', '日销售额'],
};

const SellerOverview: React.FC<any> = withDynamicSchemaProps(
  (props) => {
    const { styles } = useStyles();
    const blockProps = useDataBlockProps();
    const { filterByTk } = blockProps;
    // console.log(`---------[ SellerOverview ]---------`);
    // console.log(`blockProps:`, blockProps);
    const apiClient = useAPIClient();
    const [dateFilterValue, setDateFilterValue] = useState<string>('30');
    const [salesIndicatorFilterValue, setSalesIndicatorDateFilterValue] = useState<string>('total_sale_cnt');
    const [loading, setLoading] = useState<boolean>();
    const [values, setValues] = useState<Record<string, any>>({});

    const handleDateFilterChange = useEvent((e) => {
      const value = e.target.value;
      setDateFilterValue(value);
    });

    const handleCntFilterChange = useEvent((e) => {
      const value = e.target.value;
      setSalesIndicatorDateFilterValue(value);
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

    const renderSalesVolumeChar = () => {
      const data = pickProperty(
        values,
        salesIndicatorFilterValue === 'total_sale_cnt'
          ? panelScope.basicSalesCNTTrending
          : panelScope.basicSalesGMVTrending,
        [],
      );
      // 双轴图中，因为需要让两轴有一定上下间隔，否则显示会很难看，那么可以让柱形图（也就是右边y轴）让它的刻度线的最大值，是当前y轴数据值的两倍
      const [y1, y2] = cntAndGmvCols[salesIndicatorFilterValue];
      const maxYValue = max(data.map((d) => d[y2]));
      const maxYValueInteger = getWofoldMaxNumber(maxYValue);
      const config = {
        xField: '日期',
        data,
        title: `销售和GMV（${dateFilterValue}）天`,
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
              if (v === y2) return 'rect';
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
            yField: y2,
            axis: {
              y: {
                title: y2,
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
            yField: y1,
            shapeField: 'smooth',
            axis: {
              y: {
                title: y1,
                position: 'left',
                titleFill: '#4CCCCC',
              },
            },
            scale: {
              color: { relations: [[y1, '#4CCCCC']] },
            },
            style: { lineWidth: 2 },
          },
        ],
      };
      return (
        <div>
          <div className={styles.trendingOperators}>
            <Radio.Group
              size="middle"
              optionType="button"
              buttonStyle="solid"
              value={salesIndicatorFilterValue}
              onChange={handleCntFilterChange}
              options={GMVANDCNT_FILTER_OPTIONS}
            />
          </div>
          <G2DualAxes {...config} />
        </div>
      );
    };

    const renderVideoChar = () => {
      const leftPart = () => {
        const data = pickProperty(values, panelScope.basicInfluencerTrending, []);
        const config = {
          xField: '日期',
          data,
          title: `带货达人趋势（${dateFilterValue}）天`,
          height: 300,
          shapeField: 'smooth',
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
              type: 'line',
              yField: '直播推广人数',
              axis: {
                y: {
                  title: '直播推广人数',
                  position: 'right',
                  titleFill: '#338AFF',
                },
              },
              scale: {
                y: {},
              },
            },
            {
              type: 'line',
              yField: '视频推广人数',
              axis: {
                y: {
                  title: '视频推广人数',
                  position: 'left',
                  titleFill: '#4CCCCC',
                },
              },
              scale: {
                color: { relations: [['视频推广人数', '#4CCCCC']] },
              },
              style: { lineWidth: 2 },
            },
          ],
        };

        return <G2DualAxes {...config} />;
      };

      const rightPart = () => {
        const data = values ? values[panelScope.basicVideoTrending] : [];
        const config = {
          xField: '日期',
          yField: '数量',
          colorField: '类别',
          data,
          title: `每日视频直播趋势（${dateFilterValue}）天`,
          height: 300,
          group: true,
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
              layout: {
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              },
            },
          },
          style: {
            // 矩形四个方向的内边距
            inset: 5,
            // 矩形单个方向的内边距
            // insetLeft:5,
            // insetRight:20,
            // insetBottom:10
            // insetTop:10
          },
        };

        return <G2Column {...config} />;
      };

      return <TwoChartContainer left={leftPart()} right={rightPart()} />;
    };

    const renderFooterChars = () => {
      return (
        <>
          {renderSalesVolumeChar()}
          {renderVideoChar()}
        </>
      );
    };

    const settings: Partial<ILabelPanelProps> = {
      groups: [
        {
          key: panelScope.basicOverview,
          title: `概览`,
          rightFilter: renderDateFilter(),
          footer: renderFooterChars(),
        },
      ],
    };

    useEffect(() => {
      (async () => {
        setLoading(true);
        const {
          data: { data },
        } = await apiClient.request({
          url: 'analysis:sellerTrend',
          method: 'GET',
          params: {
            id: filterByTk,
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
  { displayName: SellerOverviewName },
);

const SellerOverviewSettings = new SchemaSettings({
  name: `blockSettings:${SellerOverviewNameLowercase}`,
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

const SellerOverviewSchema: ISchema = {
  type: 'void',
  'x-decorator': 'BlockItem',
  'x-component': SellerOverviewName,
  'x-settings': SellerOverviewSettings.name,
  properties: {
    [SellerOverviewNameLowercase]: {
      'x-component': SellerOverviewName,
    },
  },
};

const SellerOverviewInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: SellerOverviewNameLowercase,
  icon: 'GoldOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      title: '小店详情概览',
      onClick: () => {
        insert(SellerOverviewSchema);
      },
    };
  },
};
