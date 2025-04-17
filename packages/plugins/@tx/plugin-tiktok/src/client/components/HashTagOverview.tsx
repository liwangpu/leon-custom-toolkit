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
const { Line: G2Line } = lazy(() => import('@ant-design/plots'), 'Line');

const HashTagOverviewwName = 'HashTagOverview';
const HashTagOverviewwNameLowercase = HashTagOverviewwName.toLowerCase();

enum panelScope {
  basicTagsTrending = 'basic.tags.trending',
}

export const registerHashTagOverviewComponent = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.addComponents({ HashTagOverview });
  app.schemaSettingsManager.add(HashTagOverviewwSettings);
  app.schemaInitializerManager.addItem(
    'popup:common:addBlock',
    `otherBlocks.${HashTagOverviewwInitializerItem.name}`,
    HashTagOverviewwInitializerItem,
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

const HashTagOverview: React.FC<any> = withDynamicSchemaProps(
  (props) => {
    const { styles } = useStyles();
    const blockProps = useDataBlockProps();
    const { filterByTk } = blockProps;
    const apiClient = useAPIClient();
    const [loading, setLoading] = useState<boolean>();
    const [values, setValues] = useState<Record<string, any>>({});

    const renderFooterChars = () => {
      const data = values ? values[panelScope.basicTagsTrending] : [];

      const config = {
        xField: '日期',
        yField: '数量',
        colorField: '类别',
        data,
        title: `话题趋势（ 最近30天 ）`,
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

      return <G2Line {...config} />;
    };

    const settings: Partial<ILabelPanelProps> = {
      groups: [
        {
          key: panelScope.basicTagsTrending,
          // title: `概览`,
          // rightFilter: renderDateFilter(),
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
          url: 'hashtags:latestTrending',
          method: 'GET',
          params: {
            id: filterByTk,
          },
        });
        setValues(data);
        setLoading(false);
      })();
    }, [filterByTk, apiClient]);

    return (
      <div className={styles.container}>
        <LabelPanel {...(settings as any)} loading={loading} />
      </div>
    );
  },
  { displayName: HashTagOverviewwName },
);

const HashTagOverviewwSettings = new SchemaSettings({
  name: `blockSettings:${HashTagOverviewwNameLowercase}`,
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

const HashTagOverviewwSchema: ISchema = {
  type: 'void',
  'x-decorator': 'BlockItem',
  'x-component': HashTagOverviewwName,
  'x-settings': HashTagOverviewwSettings.name,
  properties: {
    [HashTagOverviewwNameLowercase]: {
      'x-component': HashTagOverviewwName,
    },
  },
};

const HashTagOverviewwInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: HashTagOverviewwNameLowercase,
  icon: 'GoldOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      title: '话题详情概览',
      onClick: () => {
        insert(HashTagOverviewwSchema);
      },
    };
  },
};
