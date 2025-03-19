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

const LiveOverviewName = 'LiveOverview';
const LiveOverviewNameLowercase = LiveOverviewName.toLowerCase();

enum panelScope {
  defaultOverview = 'basic.overview',
}

export const registerLiveOverviewComponent = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.addComponents({ LiveOverview });
  app.schemaSettingsManager.add(LiveOverviewSettings);
  app.schemaInitializerManager.addItem(
    'popup:common:addBlock',
    `otherBlocks.${LiveOverviewInitializerItem.name}`,
    LiveOverviewInitializerItem,
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

const LiveOverview: React.FC<any> = withDynamicSchemaProps(
  (props) => {
    const { styles } = useStyles();
    const blockProps = useDataBlockProps();
    const { filterByTk } = blockProps;

    const apiClient = useAPIClient();
    const [loading, setLoading] = useState<boolean>();
    const [values, setValues] = useState<Record<string, any>>({});

    const settings: Partial<ILabelPanelProps> = {
      groups: [
        {
          key: panelScope.defaultOverview,
          title: `概览`,
        },
      ],
    };

    useEffect(() => {
      (async () => {
        setLoading(true);
        const {
          data: { data },
        } = await apiClient.request({
          url: 'analysis:liveTrend',
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
        <LabelPanel {...(settings as any)} loading={loading} values={values} />
      </div>
    );
  },
  { displayName: LiveOverviewName },
);

const LiveOverviewSettings = new SchemaSettings({
  name: `blockSettings:${LiveOverviewNameLowercase}`,
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

const LiveOverviewSchema: ISchema = {
  type: 'void',
  'x-decorator': 'BlockItem',
  'x-component': LiveOverviewName,
  'x-settings': LiveOverviewSettings.name,
  properties: {
    [LiveOverviewNameLowercase]: {
      'x-component': LiveOverviewName,
    },
  },
};

const LiveOverviewInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: LiveOverviewNameLowercase,
  icon: 'GoldOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      title: '直播详情概览分析',
      onClick: () => {
        insert(LiveOverviewSchema);
      },
    };
  },
};
