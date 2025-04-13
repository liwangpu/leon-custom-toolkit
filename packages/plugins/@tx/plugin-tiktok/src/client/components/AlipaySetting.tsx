import React, { memo, useCallback, useEffect } from 'react';
import { Plugin, useAPIClient } from '@nocobase/client';
import { App as AntdApp, Button, Form, Input, Card } from 'antd';
import { createStyles } from '@nocobase/client';
import { isNil } from 'lodash';
import { IAlipaySetting } from '../../interfaces';

export const registerAlipaySettingComponent = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;
  const { pluginSettingsManager } = app;

  // 这个口子,需要的时候再显示就行
  // pluginSettingsManager.add('alipay_setting', {
  //   title: '支付宝密钥',
  //   icon: 'AlipayOutlined',
  //   Component: AlipaySetting,
  //   aclSnippet: 'pm.alipay_setting',
  // });
};

const useStyles = createStyles(({ css }) => {
  return {};
});

const AlipaySetting: React.FC = memo((props) => {
  const { styles } = useStyles();
  const apiClient = useAPIClient();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm();

  const handleSubmit = useCallback(
    async (formData: any) => {
      await apiClient.request({
        url: `payment:submitSetting`,
        method: 'POST',
        data: formData,
      });
      message.success(`保存成功!`);
    },
    [message, apiClient],
  );

  const renderForm = () => {
    return (
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Form.Item<IAlipaySetting>
          label="App Id (应用 ID)"
          name="appId"
          rules={[{ required: true, message: '该项为必填信息!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<IAlipaySetting>
          label="Alipay Public Key (支付宝公钥)"
          name="alipayPublicKey"
          rules={[{ required: true, message: '该项为必填信息!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<IAlipaySetting>
          label="Private Key (应用私钥)"
          name="privateKey"
          rules={[{ required: true, message: '该项为必填信息!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    );
  };

  useEffect(() => {
    (async () => {
      const {
        data: { data },
      } = await apiClient.request({
        url: `configSetting:get`,
        params: {
          filterByTk: 'alipaySetting',
        },
      });
      if (!isNil(data)) {
        const { value = {} } = data;
        form.setFieldsValue(value);
      }
    })();
  }, []);

  return <Card title="配置信息">{renderForm()}</Card>;
});

AlipaySetting.displayName = 'AlipaySetting';

export default AlipaySetting;
