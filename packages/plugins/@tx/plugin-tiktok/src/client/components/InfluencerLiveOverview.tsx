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
import { DATE_FILTER_OPTIONS } from '../consts';

const InfluencerLiveOverviewName = 'InfluencerLiveOverview';
const InfluencerLiveOverviewNameLowercase = InfluencerLiveOverviewName.toLowerCase();

enum panelScope {
  liveOverview = 'live.overview',
}

export const registerInfluencerLiveOverviewComponent = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.addComponents({ InfluencerLiveOverview });
  // app.addScopes({ useInfoProps });
  app.schemaSettingsManager.add(InfluencerLiveOverviewSettings);
  app.schemaInitializerManager.addItem(
    'popup:common:addBlock',
    `otherBlocks.${InfluencerLiveOverviewInitializerItem.name}`,
    InfluencerLiveOverviewInitializerItem,
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

const InfluencerLiveOverview: React.FC<any> = withDynamicSchemaProps(
  (props) => {
    const { styles } = useStyles();
    const blockProps = useDataBlockProps();
    const { filterByTk } = blockProps;
    // console.log(`---------[ InfluencerLiveOverview ]---------`);
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
          key: panelScope.liveOverview,
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
          url: 'analysis:influencerLiveTrend',
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
  { displayName: InfluencerLiveOverviewName },
);

const InfluencerLiveOverviewSettings = new SchemaSettings({
  name: `blockSettings:${InfluencerLiveOverviewNameLowercase}`,
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

const InfluencerLiveOverviewSchema: ISchema = {
  type: 'void',
  'x-decorator': 'BlockItem',
  'x-component': InfluencerLiveOverviewName,
  'x-settings': InfluencerLiveOverviewSettings.name,
  // 'x-component-props': {
  //   style: {
  //     // width: '100%',
  //     // height: '100%',
  //   },
  // },
  properties: {
    [InfluencerLiveOverviewNameLowercase]: {
      'x-component': InfluencerLiveOverviewName,
      // 'x-use-component-props': 'useInfoProps',
    },
  },
};

const InfluencerLiveOverviewInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: InfluencerLiveOverviewNameLowercase,
  icon: 'GoldOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      // title: t('InfluencerLiveOverview'),
      title: '达人详情直播分析',
      onClick: () => {
        insert(InfluencerLiveOverviewSchema);
      },
    };
  },
};
