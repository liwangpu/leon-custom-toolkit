import React, { FC } from 'react';
import { Input } from '@nocobase/client';
import { QRCode as AntdQRCode, Space, QRCodeProps as AntdQRCodeProps } from 'antd';
import { connect, ISchema, mapReadPretty } from '@formily/react';
import {
  createModalSettingsItem,
  createSelectSchemaSettingsItem,
  createSwitchSettingsItem,
  SchemaSettings,
  Plugin,
  SchemaSettingsModalItem,
  useFormBlockContext,
  useRecord,
  useSchemaSettings,
  useVariableOptions,
} from '@nocobase/client';
// import { useT } from './locale';
import { useField, useFieldSchema } from '@formily/react';

export const registerQRCode = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;
  app.addComponents({ QRCode });
  plugin.schemaSettingsManager.add(qrCodeComponentFieldSettings);
  app.addFieldInterfaceComponentOption('url', {
    label: 'QRCode',
    value: 'QRCode',
  });
};

interface QRCodeProps extends AntdQRCodeProps {
  onChange: (value: string) => void;
  disabled?: boolean;
}

const QRCodeEditable: FC<QRCodeProps> = ({ value, disabled, onChange, ...otherProps }) => {
  console.log(`---------[ title ]---------`);
  console.log(`otherProps:`, otherProps);
  return (
    <Space direction="vertical" align="center">
      <AntdQRCode value={value || '-'} {...otherProps} />
      <Input.URL maxLength={60} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
    </Space>
  );
};

const QRCodeReadPretty: FC<QRCodeProps> = ({ value, ...otherProps }) => {
  if (!value) return null;
  return <AntdQRCode value={value} {...otherProps} />;
};

const QRCode: FC<QRCodeProps> = connect(QRCodeEditable, mapReadPretty(QRCodeReadPretty));

QRCode.displayName = 'QRCode';

const SchemaSetLocationItem: any = () => {
  // 设计器的 Designable 实例
  const { dn } = useSchemaSettings();
  const field = useField();
  const fieldSchema = useFieldSchema();
  const { form } = useFormBlockContext();
  const record = useRecord();
  const scope = useVariableOptions({
    collectionField: { uiSchema: fieldSchema },
    form,
    record,
    uiSchema: fieldSchema,
    noDisabled: true,
  });

  // const t = useT();
  const title = '设置数据范围';
  return (
    <SchemaSettingsModalItem
      title={title}
      schema={
        {
          type: 'object',
          title,
          properties: {
            signLocation: {
              title,
              type: 'object',
              'x-decorator': 'FormItem',
              'x-component': 'Variable.Input',
              default: dn.getSchemaAttribute('x-decorator-props.signLocation'),
              'x-component-props': {
                scope,
                fieldNames: {
                  value: 'value',
                  label: 'label',
                },
                // useTypedConstant: true,
              },
            },
          },
        } as ISchema
      }
      onSubmit={({ signLocation }) => {
        dn.deepMerge({
          'x-decorator-props': {
            signLocation,
          },
          // 一定要带x-ui，不带不会触发保存
          ['x-uid']: fieldSchema['x-uid'],
        });
      }}
    />
  );
};

const qrCodeComponentFieldSettings = new SchemaSettings({
  name: 'fieldSettings:component:QRCode',
  items: [
    // {
    //   name: 'signLocation',
    //   Component: SchemaSetLocationItem,
    // },
    createSelectSchemaSettingsItem({
      name: 'size',
      title: '大小',
      schemaKey: 'x-component-props.size',
      defaultValue: 160,
      useOptions() {
        return [
          {
            label: 'Small',
            value: 100,
          },
          {
            label: 'Middle',
            value: 160,
          },
          {
            label: 'Large',
            value: 200,
          },
        ];
      },
    }),
    createSwitchSettingsItem({
      name: 'bordered',
      schemaKey: 'x-component-props.bordered',
      title: 'Bordered',
      defaultValue: true,
    }),
    createModalSettingsItem({
      name: 'color',
      title: 'Color',
      parentSchemaKey: 'x-component-props',
      schema({ color }) {
        return {
          type: 'object',
          title: 'Color',
          properties: {
            color: {
              type: 'string',
              title: 'Color',
              default: color,
              'x-component': 'ColorPicker',
            },
          },
        };
      },
    }),
  ],
});
