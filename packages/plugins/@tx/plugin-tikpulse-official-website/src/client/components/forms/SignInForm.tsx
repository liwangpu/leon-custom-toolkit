import React, { useState } from 'react';
import { createStyles, useAPIClient } from '@nocobase/client';
import { Button, Form, Input, Modal, Tabs, TabsProps, message } from 'antd';
import CommonModalLayout from '../CommonModalLayout';
import { useEvent } from '../../hooks';
import VerificationCodeInput, { useSmsVerificationRule } from '../commons/VerificationCodeInput';

interface IPasswordLoginForm {
  account: string;
  password: string;
}

interface IPhoneLoginForm {
  phone: string;
  verificationCode: string;
}

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
      align-items: flex-start;
      width: 100%;
      padding: 10px 0 0;
      gap: 6px 0;
    `,
    submitBtn: css`
      /* max-width: 420px; */
    `,
    tabsContainer: css`
      display: flex;
      flex-flow: column;
      align-items: center;
      width: 100%;
    `,
    tabs: css`
      /* width: 420px; */
      width: 100%;
    `,
    formContainer: css`
      display: flex;
      flex-flow: column;
      align-items: center;
      width: 100%;
      padding: 10px 0 30px;
    `,
    passwordForm: css`
      /* width: 400px; */
      width: 100%;
    `,
    fullWidth: css`
      width: 100%;
    `,
  };
});

const testValue = {
  // phone: '15577637102',
  phone: '15721457986',
  // phone: '15316063291',
  // verificationCode: '123456',
};

export const useSignInForm = (props: { show?: boolean; onNavigateSignIn: () => void }) => {
  const { onNavigateSignIn, show } = props;
  const { styles } = useStyles();
  const [passwordSignForm] = Form.useForm();
  const [phoneSignForm] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [showModa, setShowModa] = useState<boolean>(show);
  const apiClient = useAPIClient();
  const phone: string = Form.useWatch<IPhoneLoginForm>((val) => val.phone, phoneSignForm) as any;
  const { validator: verificationCodeRule, setVerificationKey } = useSmsVerificationRule({ phone });
  const handlePasswordLogin = useEvent(async (formData: IPasswordLoginForm) => {
    await apiClient.auth.signIn({ account: formData.account, password: formData.password }, 'basic');
    message.success('登录成功!');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });

  const handleCancelFreeTrial = useEvent(() => {
    setShowModa(false);
    passwordSignForm.resetFields();
    phoneSignForm.resetFields();
  });

  const toggleModa = (show: boolean) => {
    setShowModa(show);
  };

  const renderPasswordLoginForm = () => {
    return (
      <div className={styles.formContainer}>
        <Form
          form={passwordSignForm}
          layout="vertical"
          autoComplete="off"
          className={styles.passwordForm}
          onFinish={handlePasswordLogin}
        >
          <Form.Item<IPasswordLoginForm>
            label="账号"
            name="account"
            rules={[{ required: true, message: '该项为必填信息!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<IPasswordLoginForm>
            label="密码"
            name="password"
            rules={[{ required: true, message: '该项为必填信息!' }]}
          >
            <Input.Password />
          </Form.Item>

          <div className={styles.operatorContainer}>
            <Button className={styles.submitBtn} type="primary" size="large" block htmlType="submit" loading={loading}>
              登录
            </Button>

            <Button type="link" onClick={onNavigateSignIn}>
              没有账号，注册一个
            </Button>
          </div>
        </Form>
      </div>
    );
  };

  const renderPhoneLoginForm = () => {
    return (
      <div className={styles.formContainer}>
        <Form
          form={phoneSignForm}
          layout="vertical"
          autoComplete="off"
          // initialValues={testValue}
          className={styles.passwordForm}
          onFinish={handlePasswordLogin}
        >
          <Form.Item<IPhoneLoginForm>
            label="手机号"
            name="phone"
            rules={[{ required: true, message: '该项为必填信息!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<IPhoneLoginForm>
            label="验证码"
            name="verificationCode"
            rules={[{ required: true, message: '该项为必填信息!' }, verificationCodeRule]}
          >
            <VerificationCodeInput phone={phone} setVerificationKey={setVerificationKey} />
          </Form.Item>

          <div className={styles.operatorContainer}>
            <Button className={styles.submitBtn} type="primary" size="large" block htmlType="submit" loading={loading}>
              登录
            </Button>

            <Button type="link" onClick={onNavigateSignIn}>
              没有账号，注册一个
            </Button>
          </div>
        </Form>
      </div>
    );
  };

  const renderFreeTrialForm = () => {
    const items: TabsProps['items'] = [
      {
        key: 't1',
        label: '密码登录',
        children: renderPasswordLoginForm(),
      },
      {
        key: 't2',
        label: '验证码登录',
        children: renderPhoneLoginForm(),
      },
    ];
    return (
      <CommonModalLayout title="登录">
        <div className={styles.tabsContainer}>
          <Tabs defaultActiveKey="t1" className={styles.tabs} items={items} />
        </div>
      </CommonModalLayout>
    );
  };

  const contextHolder = () => (
    <Modal
      className={styles.customModal}
      open={showModa}
      width={520}
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
