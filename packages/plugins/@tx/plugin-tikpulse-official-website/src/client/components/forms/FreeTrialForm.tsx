import React, { useState } from 'react';
import { createStyles, useAPIClient } from '@nocobase/client';
import { Button, Form, Input, Modal, message } from 'antd';
import CommonModalLayout from '../CommonModalLayout';
import { useEvent } from '../../hooks';
import VerificationCodeInput from '../commons/VerificationCodeInput';

type IFreeTrialForm = {
  name?: string;
  phone?: string;
  email?: string;
  verificationCode?: string;
  company?: string;
  password?: string;
  password2?: string;
};

const testValue = {
  name: '小秋秋',
  // phone: '15577637102',
  company: '小秋秋的宇宙直通车',
  phone: '15316063291',
  verificationCode: '123456',
  email: 'qiu@gmail.com',
  password: '888888',
  password2: '888888',
};

const useStyles = createStyles(({ css, responsive }) => {
  return {
    customModal: css`
      & .ant-modal-content {
        padding: 0 !important;
        border-radius: 8px !important;
      }
    `,
    operatorContainer: css`
      display: flex;
      flex-flow: column;
      /* justify-content: center; */
      align-items: flex-start;
      width: 100%;
      padding: 0 0 34px 68px;
      gap: 6px 0;
    `,
    submitBtn: css`
      /* max-width: 420px; */
    `,
  };
});

export const useFreeTrialForm = (props: { onNavigateLogin: () => void }) => {
  const { onNavigateLogin } = props;
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [showModa, setShowModa] = useState<boolean>(false);
  const apiClient = useAPIClient();

  const handleCancelFreeTrial = useEvent(() => {
    setShowModa(false);
    form.resetFields();
  });

  const toggleModa = (show: boolean) => {
    setShowModa(show);
    console.log(`---------[ toggleModa ]---------`);
    console.log(`show:`, show);
  };

  const handleSubmitFreeTrial = useEvent(async (formData: IFreeTrialForm) => {
    if (loading) return;
    try {
      setLoading(true);
      const {
        data: { data },
      } = await apiClient.request({
        url: 'applyUser:requestTrial',
        method: 'POST',
        data: formData,
      });

      message.success('用户注册成功!');
      setTimeout(async () => {
        handleCancelFreeTrial();
        await apiClient.auth.signIn({ account: formData.phone, password: formData.password }, 'basic');
        window.location.href = '/home/download';
      }, 1000);
    } catch (error) {
      console.log(`error:`, error);
    }
    setLoading(false);
  });

  const renderFreeTrialForm = () => {
    return (
      <CommonModalLayout title={`注册`}>
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          form={form}
          // initialValues={testValue}
          autoComplete="off"
          onFinish={handleSubmitFreeTrial}
        >
          <Form.Item name="verificationKey" noStyle>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item<IFreeTrialForm> label="姓名" name="name" rules={[{ required: true, message: '该项为必填信息!' }]}>
            <Input />
          </Form.Item>

          <Form.Item<IFreeTrialForm>
            label="公司名称"
            name="company"
            rules={[{ required: true, message: '该项为必填信息!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<IFreeTrialForm> label="邮箱" name="email" rules={[{ required: true, message: '该项为必填信息!' }]}>
            <Input />
          </Form.Item>

          <Form.Item<IFreeTrialForm>
            label="手机号"
            name="phone"
            rules={[{ required: true, message: '该项为必填信息!' }]}
          >
            <Input addonBefore="+86" maxLength={11} />
          </Form.Item>

          {/* <Form.Item<IFreeTrialForm>
            label="验证码"
            name="verificationCode"
            rules={[{ required: true, message: '该项为必填信息!' }]}
          >
            <VerificationCodeInput phone={phone} />
          </Form.Item> */}

          <Form.Item<IFreeTrialForm>
            label="密码"
            name="password"
            rules={[{ required: true, message: '该项为必填信息!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item<IFreeTrialForm>
            label="确认密码"
            name="password2"
            dependencies={['password']}
            rules={[
              { required: true, message: '该项为必填信息!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('确认密码的输入与密码不匹配!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item<any> label="邀请码" name="invitationCode">
            <Input />
          </Form.Item>

          <div className={styles.operatorContainer}>
            <Button className={styles.submitBtn} type="primary" size="large" block htmlType="submit" loading={loading}>
              立即提交
            </Button>

            <Button type="link" onClick={onNavigateLogin}>
              已有账号，直接登录
            </Button>
          </div>
        </Form>
      </CommonModalLayout>
    );
  };

  const contextHolder = () => (
    <Modal
      className={styles.customModal}
      open={showModa}
      width={600}
      footer={null}
      keyboard={false}
      maskClosable={false}
      onCancel={handleCancelFreeTrial}
    >
      {renderFreeTrialForm()}
    </Modal>
  );

  return {
    contextHolder,
    toggleModa,
  };
};
