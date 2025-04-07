import React from 'react';
import { createStyles, useAPIClient } from '@nocobase/client';
import { observer } from 'mobx-react-lite';
import { Button, Form, Input, message } from 'antd';
import {
  FirstLevelTitleFontSize,
  FirstLevelTitleFontSize_SM,
  FirstLevelTitleFontWeight,
  FirstLevelTitleFontWeight_SM,
} from '../common';
import Image10037 from '../../assets/images/10037.png';
import { useEvent } from '../../hooks';

const useStyles = createStyles(({ css, responsive }) => {
  return {
    partContainer: css`
      position: relative;
      display: flex;
      flex-flow: column;
      align-items: center;
      width: 100%;
      padding: 60px 32px;
      background-color: rgb(4, 4, 4);
      border-top-left-radius: 64px;
      border-top-right-radius: 64px;
      z-index: 2;
      ${responsive.sm} {
        padding: 24px;
      }
    `,
    title: css`
      color: #fff;
      font-size: ${FirstLevelTitleFontSize};
      font-weight: ${FirstLevelTitleFontWeight};
      z-index: 3;
      ${responsive.sm} {
        font-size: ${FirstLevelTitleFontSize_SM};
        font-weight: ${FirstLevelTitleFontWeight_SM};
      }
    `,
    operatorContainer: css`
      display: flex;
      flex-flow: column;
      width: 100%;
      padding: 14px 0 0 0;
    `,
    formContainer: css`
      width: 100%;
      max-width: 600px;
      z-index: 3;
    `,
    form: css`
      & .ant-form-item-required {
        color: #fff !important;
      }
    `,
    bgImgContainer: css`
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-top-left-radius: 64px;
      border-top-right-radius: 64px;
      overflow: hidden;
    `,
    bgImg: css`
      position: absolute;
      top: 5%;
      left: 20%;
      width: 1000px;
      height: 800px;
    `,
    bgMark: css`
      position: absolute;
      left: 0;
      bottom: -100px;
      width: 100%;
      height: 120px;
      background-color: rgb(4, 4, 4);
    `,
  };
});

const Part4: React.FC = observer((props) => {
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const apiClient = useAPIClient();
  const [messageApi, contextHolder] = message.useMessage({ top: 300 });

  const handleSubmitServiceSupport = useEvent(async (formData) => {
    const {
      data: { data },
    } = await apiClient.request({
      url: 'serviceSupport:create',
      method: 'POST',
      data: formData,
    });
    messageApi.success('服务支持提交成功');
    form.resetFields();
  });

  const renderFreeTrialForm = () => {
    return (
      <div className={styles.formContainer}>
        <Form
          id="request-demo-form"
          // labelCol={{ span: 6 }}
          // wrapperCol={{ span: 18 }}
          // variant="underlined"
          className={styles.form}
          form={form}
          layout="vertical"
          // initialValues={testValue}
          autoComplete="off"
          size="large"
          onFinish={handleSubmitServiceSupport}
        >
          <Form.Item<any> label="姓名" name="name" rules={[{ required: true, message: '该项为必填信息!' }]}>
            <Input />
          </Form.Item>

          <Form.Item<any> label="电话" name="phone" rules={[{ required: true, message: '该项为必填信息!' }]}>
            <Input />
          </Form.Item>

          <Form.Item<any> label="邮箱" name="email" rules={[{ required: true, message: '该项为必填信息!' }]}>
            <Input />
          </Form.Item>

          <Form.Item<any> label="公司" name="company" rules={[{ required: true, message: '该项为必填信息!' }]}>
            <Input />
          </Form.Item>

          <Form.Item<any> label="服务类型" name="supportType" rules={[{ required: true, message: '该项为必填信息!' }]}>
            <Input.TextArea placeholder="您可以填写具体的服务支持内容,如预约演示/业务咨询/技术支持 或其他具体的问题" />
          </Form.Item>

          <div className={styles.operatorContainer}>
            <Button type="primary" size="large" htmlType="submit">
              立即提交
            </Button>
          </div>
        </Form>
      </div>
    );
  };

  return (
    <div className={styles.partContainer}>
      <div className={styles.title}>服务支持</div>
      {renderFreeTrialForm()}
      <div className={styles.bgImgContainer}>
        {contextHolder}
        <img src={Image10037} className={styles.bgImg} />
      </div>
      <div className={styles.bgMark}></div>
    </div>
  );
});

Part4.displayName = 'Part4';

export default Part4;
