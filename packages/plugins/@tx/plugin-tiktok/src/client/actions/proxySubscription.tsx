import {
  ISchema,
  SchemaInitializerItemType,
  SchemaSettings,
  useCollectionRecordData,
  useSchemaInitializer,
} from '@nocobase/client';
import { useT } from '../locale';
import { message } from 'antd';
import copy from 'copy-to-clipboard';
import { Plugin } from '@nocobase/client';

const CopyProxySubscribeActionName = 'CopyProxySubscribeAction';
const CopyProxySubscribeActionNameLowercase = CopyProxySubscribeActionName.toLowerCase();

export const registerProxySubscriptionAction = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.addScopes({ useCopyProxySubscribeActionProps });
  // 注册组件相关
  app.schemaInitializerManager.addItem(
    'table:configureItemActions',
    CopyProxySubscribeActionName,
    createCopySubscribeActionInitializerItem(),
  );
  app.schemaSettingsManager.add(copySubscribeActionSettings);
};

function useCopyProxySubscribeActionProps() {
  const record = useCollectionRecordData();
  const t = useT();
  return {
    title: t(CopyProxySubscribeActionName),
    type: 'primary',
    onClick() {
      const url = `${window.location.origin}/api/proxySubscription:subscribe?noid=${record.noid}`;
      copy(url);
      message.info('复制成功!');
    },
  };
}

const createCopySubscribeActionSchema = (): ISchema => {
  return {
    type: 'void',
    'x-component': 'Action.Link',
    'x-use-component-props': 'useCopyProxySubscribeActionProps',
    'x-settings': copySubscribeActionSettings.name,
  };
};

const createCopySubscribeActionInitializerItem = (): SchemaInitializerItemType => ({
  type: 'item',
  name: CopyProxySubscribeActionNameLowercase,
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      title: t(CopyProxySubscribeActionName),
      onClick: () => {
        insert(createCopySubscribeActionSchema());
      },
    };
  },
});

const copySubscribeActionSettings = new SchemaSettings({
  name: `actionSettings:${CopyProxySubscribeActionNameLowercase}`,
  items: [
    {
      name: 'remove',
      type: 'remove',
    },
  ],
});
