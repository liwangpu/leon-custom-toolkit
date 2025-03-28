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
import { Button, Card, message, Tree } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import { isArray } from 'lodash';
import { useEvent } from '../hooks';

const PaidServicePermissionSettingName = 'PaidServicePermissionSetting';
const PaidServicePermissionSettingNameLowercase = PaidServicePermissionSettingName.toLowerCase();

export const registerPaidServicePermissionSettingComponent = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.addComponents({ PaidServicePermissionSetting });
  app.schemaSettingsManager.add(PaidServicePermissionSettingSettings);
  app.schemaInitializerManager.addItem(
    'popup:common:addBlock',
    `otherBlocks.${PaidServicePermissionSettingInitializerItem.name}`,
    PaidServicePermissionSettingInitializerItem,
  );
};

const useStyles = createStyles(({ css }) => {
  return {
    container: css`
      display: flex;
      flex-flow: column;
      width: 100%;
      background-color: #fff;
      padding: 18px;
    `,
    treeContainer: css`
      max-height: 500px;
      overflow-x: hidden;
      overflow-y: auto;
    `,
    operators: css`
      padding: 10px 0 0;
    `,
  };
});

const PaidServicePermissionSetting: React.FC<any> = withDynamicSchemaProps(
  (props) => {
    const { styles } = useStyles();
    const blockProps = useDataBlockProps();
    const { filterByTk } = blockProps;
    const [menus, setMenus] = useState<Array<TreeDataNode>>();

    const apiClient = useAPIClient();
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);

    const onCheck: TreeProps['onCheck'] = (checkedKeysValue) => {
      setCheckedKeys(checkedKeysValue as React.Key[]);
    };

    const handleSubmit = useEvent(async () => {
      //
      await apiClient.request({
        url: 'servicePermissions:submit',
        method: 'POST',
        data: {
          serviceId: filterByTk,
          permissions: checkedKeys,
        },
      });
      message.success('保存成功!');
    });

    useEffect(() => {
      (async () => {
        const requestTreeNodes = async () => {
          const {
            data: { data },
          } = await apiClient.request({
            url: 'uiSchemas:getJsonSchema/nocobase-admin-menu',
            method: 'GET',
          });

          const schemas: Array<any> = Object.keys(data.properties).map((k) => data.properties[k]);
          const treeNodes = [];
          const traceNode = (props: { schema: Record<string, any>; node: Record<string, any> }) => {
            const { schema, node } = props;
            node.key = schema['x-uid'];
            node.title = schema.title;
            const children = [];
            if (schema.properties) {
              const _schemas: Array<any> = Object.keys(schema.properties).map((k) => schema.properties[k]);
              if (_schemas.length) {
                for (const subSc of _schemas) {
                  const subNode = {};
                  traceNode({ schema: subSc, node: subNode });
                  children.push(subNode);
                }
              }
            }
            node.children = children;
          };
          for (const schema of schemas) {
            const node = {};
            traceNode({ schema, node });
            treeNodes.push(node);
          }
          // console.log(`treeNodes:`, treeNodes);
          setMenus(treeNodes);
        };
        const requestPermissions = async () => {
          const {
            data: { data },
          } = await apiClient.request({
            url: 'paidServicePermissions:get',
            method: 'GET',
            params: {
              filterByTk,
            },
          });
          if (data) {
            setCheckedKeys(data.permissions || []);
          }
        };

        await Promise.all([requestPermissions(), requestTreeNodes()]);
      })();
    }, [filterByTk, apiClient]);

    const renderTree = () => {
      if (!menus || !isArray(menus)) return;
      return (
        <div className={styles.treeContainer}>
          <Tree
            checkable
            defaultExpandAll={true}
            showLine={true}
            onCheck={onCheck}
            checkedKeys={checkedKeys}
            treeData={menus}
          />
        </div>
      );
    };

    const renderOperators = () => {
      return (
        <div className={styles.operators}>
          <Button type="primary" onClick={handleSubmit}>
            提交
          </Button>
        </div>
      );
    };

    return (
      <Card title="菜单权限">
        {renderTree()}
        {renderOperators()}
      </Card>
    );
  },
  { displayName: PaidServicePermissionSettingName },
);

const PaidServicePermissionSettingSettings = new SchemaSettings({
  name: `blockSettings:${PaidServicePermissionSettingNameLowercase}`,
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

const PaidServicePermissionSettingSchema: ISchema = {
  type: 'void',
  'x-decorator': 'BlockItem',
  'x-component': PaidServicePermissionSettingName,
  'x-settings': PaidServicePermissionSettingSettings.name,
  properties: {
    [PaidServicePermissionSettingNameLowercase]: {
      'x-component': PaidServicePermissionSettingName,
    },
  },
};

const PaidServicePermissionSettingInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: PaidServicePermissionSettingNameLowercase,
  icon: 'GoldOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      title: '付费服务权限分配',
      onClick: () => {
        insert(PaidServicePermissionSettingSchema);
      },
    };
  },
};
