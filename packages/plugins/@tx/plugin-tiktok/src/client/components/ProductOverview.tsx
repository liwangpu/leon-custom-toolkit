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
import { chartData1 } from './data';
// const { DualAxes: G2DualAxes } = lazy(() => import('@ant-design/plots'), 'DualAxes');
// const { Line: G2Line } = lazy(() => import('@ant-design/plots'), 'Line');

const ProductOverviewName = 'ProductOverview';
const ProductOverviewNameLowercase = ProductOverviewName.toLowerCase();

const DATE_FILTER_OPTIONS = [
  { value: '7', label: '7 天' },
  { value: '15', label: '15 天' },
  { value: '30', label: '30 天' },
  { value: '90', label: '90 天' },
];

enum panelScope {
  basicOverview = 'basic.overview',
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

    // const renderSampleChar = () => {
    //   const data = [
    //     { year: '1991', value: 3 },
    //     { year: '1992', value: 4 },
    //     { year: '1993', value: 3.5 },
    //     { year: '1994', value: 5 },
    //     { year: '1995', value: 4.9 },
    //     { year: '1996', value: 6 },
    //     { year: '1997', value: 7 },
    //     { year: '1998', value: 9 },
    //     { year: '1999', value: 13 },
    //   ];

    //   const config = {
    //     data,
    //     height: 400,
    //     axis: {
    //       x: {
    //         title: 'xxxxxx',
    //       },
    //       y: {
    //         title: '舍',
    //       },
    //     },
    //     xField: 'year',
    //     yField: 'value',
    //   };
    //   return <G2Line {...config} />;
    // };

    // const renderSample2Char = () => {
    //   const config = {
    //     xField: 'time',
    //     data: [
    //       { time: '10:10', call: 4, waiting: 2, people: 2 },
    //       { time: '10:15', call: 2, waiting: 6, people: 3 },
    //       { time: '10:20', call: 13, waiting: 2, people: 5 },
    //       { time: '10:25', call: 9, waiting: 9, people: 1 },
    //       { time: '10:30', call: 5, waiting: 2, people: 3 },
    //       { time: '10:35', call: 8, waiting: 2, people: 1 },
    //       { time: '10:40', call: 13, waiting: 1, people: 2 },
    //     ],

    //     legend: {
    //       color: {
    //         itemMarker: (v) => {
    //           if (v === 'waiting') return 'rect';
    //           return 'smooth';
    //         },
    //       },
    //     },
    //     children: [
    //       {
    //         type: 'interval',
    //         yField: 'waiting',
    //         axis: {
    //           x: {
    //             title: 'xxxxxx',
    //           },
    //           y: {
    //             title: '舍',
    //           },
    //         },
    //       },
    //       {
    //         type: 'line',
    //         yField: 'people',
    //         shapeField: 'smooth',
    //         scale: { color: { relations: [['people', '#fdae6b']] } },
    //         axis: { y: { position: 'right' } },
    //         style: { lineWidth: 2 },
    //       },
    //     ],
    //   };
    //   return <G2DualAxes {...config} />;
    // };

    // const renderSalesVolumeChar = () => {
    //   const config = {
    //     xField: 'axis_x',
    //     data: chartData1,
    //     // data:[
    //     //   {
    //     //     legend: '总销量',
    //     //     axis_x: '2025-03-14',
    //     //     axis_y: 917515,
    //     //     axis_y_f: '917.52K',
    //     //   },
    //     // ],
    //     // legend: {
    //     //   color: {
    //     //     itemMarker: (v) => {
    //     //       if (v === 'waiting') return 'rect';
    //     //       return 'smooth';
    //     //     },
    //     //   },
    //     // },
    //     // axis: {
    //     //   x: {
    //     //     title: '日期',
    //     //   },
    //     // },
    //     children: [
    //       {
    //         type: 'interval',
    //         yField: 'axis_y',
    //         axis: {
    //           y: {
    //             title: '日销量',
    //           },
    //         },
    //       },
    //       {
    //         type: 'line',
    //         yField: 'axis_y_f',
    //         shapeField: 'smooth',
    //         scale: { color: { relations: [['axis_y_f', '#fdae6b']] } },
    //         axis: { y: { title: '总销量', position: 'right' } },
    //         style: { lineWidth: 1 },
    //       },
    //     ],
    //   };
    //   return <G2DualAxes {...config} />;
    // };

    const renderFooter = () => {
      // return <div className={styles.chartContainer}>{renderSalesVolumeChar()}</div>;
      return <></>;
    };

    const settings: Partial<ILabelPanelProps> = {
      groups: [
        {
          key: panelScope.basicOverview,
          title: `概览`,
          rightFilter: renderDateFilter(),
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
        <LabelPanel {...(settings as any)} loading={loading} values={values} footer={renderFooter()} />
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
