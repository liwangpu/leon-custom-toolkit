import React, { memo, useCallback, useEffect } from 'react';
import { Plugin, useAPIClient } from '@nocobase/client';
import { App as AntdApp, Button, Form, Input, Card } from 'antd';
import { createStyles } from '@nocobase/client';
import type { IAliyunSmsSetting } from '../../interfaces';
import { isNil } from 'lodash';

export const registerSmsSetting = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;
  const { pluginSettingsManager } = app;

  pluginSettingsManager.add('dingtalk', {
    title: '阿里短信服务',
    icon: 'SendOutlined',
    Component: SmsSetting,
    aclSnippet: 'pm.sms_setting',
  });
};

const useStyles = createStyles(({ css }) => {
  return {};
});

const SmsSetting: React.FC = memo((props) => {
  const { styles } = useStyles();
  const apiClient = useAPIClient();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm();

  const handleSubmit = useCallback(
    async (formData: any) => {
      await apiClient.request({
        url: `aliyunSms:submitSetting`,
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
        <Form.Item<IAliyunSmsSetting>
          label="AccessKey ID"
          name="accessKeyID"
          rules={[{ required: true, message: '该项为必填信息!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<IAliyunSmsSetting>
          label="AccessKey Secret"
          name="accessKeySecret"
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
      const { data } = await apiClient.request({
        url: `aliyunSms:setting`,
      });
      if (!isNil(data)) {
        form.setFieldsValue(data);
      }
    })();
  }, []);

  return <Card title="配置信息">{renderForm()}</Card>;
});

SmsSetting.displayName = 'SmsSetting';

export default SmsSetting;
