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
import { isNil, max } from 'lodash';
import { DATE_FILTER_OPTIONS } from '../consts';
const { DualAxes: G2DualAxes } = lazy(() => import('@ant-design/plots'), 'DualAxes');
const { Column: G2Column } = lazy(() => import('@ant-design/plots'), 'Column');

const ProductOverviewName = 'ProductOverview';
const ProductOverviewNameLowercase = ProductOverviewName.toLowerCase();

enum panelScope {
  basicOverview = 'basic.overview',
  basicSalesTrending = 'basic.sales.trending',
  basicInfluencerTrending = 'basic.influencer.trending',
  basicInsightsTrending = 'basic.insights.trending',
}

export const registerProductOverviewComponent = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.addComponents({ ProductOverview });
  app.schemaSettingsManager.add(ProductOverviewSettings);
  app.schemaInitializerManager.addItem(
    'popup:common:addBlock',
    `otherBlocks.${ProductOverviewInitializerItem.name}`,
    ProductOverviewInitializerItem,
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
    chartContainer: css`
      display: flex;
      flex-flow: column;
      justify-content: center;
      width: 100%;
    `,
  };
});

const ProductOverview: React.FC<any> = withDynamicSchemaProps(
  (props) => {
    const { styles } = useStyles();
    const blockProps = useDataBlockProps();
    const { filterByTk } = blockProps;
    // console.log(`---------[ ProductOverview ]---------`);
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

    const renderSalesVolumeChar = () => {
      const data = pickProperty(values, panelScope.basicSalesTrending, []);
      // 双轴图中，因为需要让两轴有一定上下间隔，否则显示会很难看，那么可以让柱形图（也就是右边y轴）让它的刻度线的最大值，是当前y轴数据值的两倍
      const maxYValue = max(data.map((d) => d['日销量']));
      const maxYValueInteger = getWofoldMaxNumber(maxYValue);
      const config = {
        xField: '日期',
        data,
        title: `销量和销售额（${dateFilterValue}）天`,
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
              if (v === '日销量') return 'rect';
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
            yField: '日销量',
            axis: {
              y: {
                title: '日销量',
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
            yField: '总销量',
            shapeField: 'smooth',
            axis: {
              y: {
                title: '总销量',
                position: 'left',
                titleFill: '#4CCCCC',
              },
            },
            scale: {
              color: { relations: [['总销量', '#4CCCCC']] },
            },
            style: { lineWidth: 2 },
          },
        ],
      };
      return (
        <div>
          <G2DualAxes {...config} />
        </div>
      );
    };

    const renderFluencerCharts = () => {
      const leftPart = () => {
        const data = pickProperty(values, panelScope.basicInfluencerTrending, []);
        const maxYValue = max(data.map((d) => d['达人数增量']));
        const maxYValueInteger = getWofoldMaxNumber(maxYValue);
        const config = {
          xField: '日期',
          data,
          title: `关联达人趋势（${dateFilterValue}）天`,
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
                if (v === '达人数增量') return 'rect';
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
              yField: '达人数增量',
              axis: {
                y: {
                  title: '达人数增量',
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
              yField: '达人数',
              shapeField: 'smooth',
              axis: {
                y: {
                  title: '达人数',
                  position: 'left',
                  titleFill: '#4CCCCC',
                },
              },
              scale: {
                color: { relations: [['达人数', '#4CCCCC']] },
              },
              style: { lineWidth: 2 },
            },
          ],
        };

        return <G2DualAxes {...config} />;
      };

      const rightPart = () => {
        const data = values ? values[panelScope.basicInsightsTrending] : [];
        const config = {
          xField: '日期',
          yField: '数量',
          colorField: '类别',
          data,
          title: `每日视频直播趋势（${dateFilterValue}）天`,
          height: 300,
          group: true,
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

    const renderFooter = () => {
      return (
        <div className={styles.chartContainer}>
          {renderSalesVolumeChar()}
          {renderFluencerCharts()}
        </div>
      );
    };

    const settings: Partial<ILabelPanelProps> = {
      groups: [
        {
          key: panelScope.basicOverview,
          title: `概览`,
          rightFilter: renderDateFilter(),
          footer: renderFooter(),
        },
      ],
    };

    useEffect(() => {
      (async () => {
        setLoading(true);
        const {
          data: { data },
        } = await apiClient.request({
          url: 'analysis:productTrend',
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
  { displayName: ProductOverviewName },
);

const ProductOverviewSettings = new SchemaSettings({
  name: `blockSettings:${ProductOverviewNameLowercase}`,
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

const ProductOverviewSchema: ISchema = {
  type: 'void',
  'x-decorator': 'BlockItem',
  'x-component': ProductOverviewName,
  'x-settings': ProductOverviewSettings.name,
  properties: {
    [ProductOverviewNameLowercase]: {
      'x-component': ProductOverviewName,
    },
  },
};

const ProductOverviewInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: ProductOverviewNameLowercase,
  icon: 'GoldOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      title: '产品详情概览',
      onClick: () => {
        insert(ProductOverviewSchema);
      },
    };
  },
};
