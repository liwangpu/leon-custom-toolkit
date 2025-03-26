import React, { memo, useCallback, useEffect } from 'react';
import { Plugin, useAPIClient } from '@nocobase/client';
import { App as AntdApp, Button, Form, Input, Card, Space, InputNumber } from 'antd';
import { createStyles } from '@nocobase/client';
// import type { IWebsiteSetting } from '../../interfaces';
import { isNil } from 'lodash';
import { IWebsiteSetting } from '../../interface';

export const registerWebsiteSetting = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;
  const { pluginSettingsManager } = app;

  pluginSettingsManager.add('TikPulseSetting', {
    title: 'TikPulse官网配置',
    icon: 'BankOutlined',
    Component: WebsiteSetting,
    aclSnippet: 'pm.official_website_setting',
  });
};

const useStyles = createStyles(({ css }) => {
  return {
    fullWidth: css`
      width: 100%;
    `,
  };
});

const WebsiteSetting: React.FC = memo((props) => {
  const { styles } = useStyles();
  const apiClient = useAPIClient();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm();

  const handleSubmit = useCallback(
    async (formData: any) => {
      await apiClient.request({
        url: `officalWebsiteSetting:submitSetting`,
        method: 'POST',
        data: formData,
      });
      message.success(`保存成功!`);
    },
    [message, apiClient],
  );

  const renderSSs = () => {
    // return <Button>Submit</Button>;
    return <div>Submit</div>;
  };

  const renderForm = () => {
    return (
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Form.Item<IWebsiteSetting>
          label="咨询电话"
          name="hotline"
          rules={[{ required: true, message: '该项为必填信息!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<IWebsiteSetting>
          label="客服微信二维码(Base64)"
          name="wechatServieQRCode"
          rules={[{ required: true, message: '该项为必填信息!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<IWebsiteSetting>
          label="免费试用天数"
          name="trialDays"
          rules={[{ required: true, message: '该项为必填信息!' }]}
        >
          <InputNumber min={1} className={styles.fullWidth} addonAfter="天" />
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
        url: `officalWebsiteSetting:setting`,
      });
      if (!isNil(data)) {
        const { setting = {} } = data;
        form.setFieldsValue(setting);
      }
    })();
  }, []);

  return <Card title="配置信息">{renderForm()}</Card>;
});

WebsiteSetting.displayName = 'WebsiteSetting';

export default WebsiteSetting;
