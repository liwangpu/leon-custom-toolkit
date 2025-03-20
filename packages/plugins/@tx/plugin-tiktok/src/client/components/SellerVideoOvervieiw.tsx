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

const SellerVideoOverviewName = 'SellerVideoOverview';
const SellerVideoOverviewNameLowercase = SellerVideoOverviewName.toLowerCase();

const DATE_FILTER_OPTIONS = [
  { value: '7', label: '7 天' },
  { value: '15', label: '15 天' },
  { value: '30', label: '30 天' },
  { value: '90', label: '90 天' },
];

enum panelScope {
  basicOverview = 'video.overview',
}

export const registerSellerVideoOverviewComponent = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.addComponents({ SellerVideoOverview });
  app.schemaSettingsManager.add(SellerVideoOverviewSettings);
  app.schemaInitializerManager.addItem(
    'popup:common:addBlock',
    `otherBlocks.${SellerVideoOverviewInitializerItem.name}`,
    SellerVideoOverviewInitializerItem,
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
  };
});

const SellerVideoOverview: React.FC<any> = withDynamicSchemaProps(
  (props) => {
    const { styles } = useStyles();
    const blockProps = useDataBlockProps();
    const { filterByTk } = blockProps;
    // console.log(`---------[ SellerVideoOverview ]---------`);
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
          url: 'analysis:sellerVideoTrend',
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
  { displayName: SellerVideoOverviewName },
);

const SellerVideoOverviewSettings = new SchemaSettings({
  name: `blockSettings:${SellerVideoOverviewNameLowercase}`,
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

const SellerVideoOverviewSchema: ISchema = {
  type: 'void',
  'x-decorator': 'BlockItem',
  'x-component': SellerVideoOverviewName,
  'x-settings': SellerVideoOverviewSettings.name,
  properties: {
    [SellerVideoOverviewNameLowercase]: {
      'x-component': SellerVideoOverviewName,
    },
  },
};

const SellerVideoOverviewInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: SellerVideoOverviewNameLowercase,
  icon: 'GoldOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      title: '小店详情视频分析',
      onClick: () => {
        insert(SellerVideoOverviewSchema);
      },
    };
  },
};
