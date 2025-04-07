import React, { useState } from 'react';
import { createStyles, useAPIClient } from '@nocobase/client';
import { observer } from 'mobx-react-lite';
import { Button, Form, Input, Modal, Space, message } from 'antd';
import CommonModalLayout from './CommonModalLayout';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../hooks';
import { GenerateShortId } from '../utils';
import { isFunction } from 'lodash';
import { AppStore } from './store';

const CountDownButton: React.FC<{ disabled?: boolean; onClick?: () => void }> = observer((props) => {
  const { disabled, onClick } = props;
  const [countDown, setCountDown] = useState<number>(0);

  const handleSendVerificationCode = useEvent(() => {
    if (countDown > 0) return;

    if (isFunction(onClick)) {
      onClick();
    }
    let _countDown = 60;
    setCountDown(_countDown);
    const timer = setInterval(() => {
      if (_countDown === 0) {
        clearInterval(timer);
        return;
      }
      _countDown--;
      setCountDown(_countDown);
    }, 1000);
  });

  return (
    <Button disabled={disabled || countDown > 0} onClick={handleSendVerificationCode}>
      {countDown > 0 ? `重新发送 (${countDown}s)` : '获取验证码'}
    </Button>
  );
});

const useStyles = createStyles(({ css, responsive }) => {
  return {
    operators: css`
      height: 100%;
      display: flex;
      flex-flow: row;
      align-items: center;
      & > *:not(:last-of-type) {
        margin-right: 20px;
      }
    `,
    freeTrialBtn: css`
      background-color: rgb(4, 4, 4);
      padding: 8px 14px;
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      ${responsive.sm} {
        font-size: 13px;
        padding: 4px 7px;
      }
      &:hover {
        background-color: #273333;
      }
    `,
    requestDemoBtn: css`
      padding: 8px 14px;
      color: rgb(4, 4, 4);
      font-size: 16px;
      font-weight: 700;
      border: 2px solid rgb(4, 4, 4);
      border-radius: 6px;
      background-color: transparent;
      cursor: pointer;
      ${responsive.sm} {
        font-size: 13px;
        padding: 4px 7px;
      }
      &:hover {
        color: #273333;
      }
    `,
    loginBtn: css`
      background: rgba(1, 77, 255, 0.1);
      color: #014dff;
    `,
    operatorContainer: css`
      display: flex;
      flex-flow: column;
      width: 100%;
      padding: 0 0 34px 24px;
    `,
    fullWidth: css`
      width: 100%;
    `,
    customModal: css`
      & .ant-modal-content {
        padding: 0 !important;
        border-radius: 8px !important;
      }
    `,
  };
});

type IFreeTrialForm = {
  name?: string;
  phone?: string;
  email?: string;
  verificationCode?: string;
};

const testValue = {
  name: '小昭昭',
  // phone: '15577637102',
  phone: '15577637101',
  // verificationCode: '123456',
  email: 'zhao@gmail.com',
};

export interface IHeaderOperatorProps {
  store: AppStore;
}

const HeaderOperator: React.FC<IHeaderOperatorProps> = observer((props) => {
  const { store } = props;
  const { styles } = useStyles();
  const navigate = useNavigate();
  const apiClient = useAPIClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const canSendVerificationCode = Form.useWatch<IFreeTrialForm>((val) => val.phone && val.phone.length === 11, form);

  const smallScreeen = false;

  const handleFreeTrial = useEvent(() => {
    store.toggleTrialModa(true);
  });

  const handleLogin = useEvent(() => {
    navigate('/signin');
  });

  const handleSendVerificationCode = useEvent(async () => {
    const verificationKey = GenerateShortId('free_trial', 16);
    form.setFieldValue('verificationKey', verificationKey);
    const phone = form.getFieldValue('phone');
    await apiClient.request({
      url: 'applyUser:sendPhoneVerificationSMS',
      method: 'POST',
      data: {
        verificationKey,
        phone,
      },
    });
    messageApi.success('短信发送成功!');
  });

  const handleCancelFreeTrial = useEvent(() => {
    store.toggleTrialModa(false);
    form.resetFields();
  });

  const handleRequestDemo = useEvent(() => {
    store.requestDemoHandler();
  });

  const handleSubmitFreeTrial = useEvent(async (formData) => {
    try {
      const {
        data: { data },
      } = await apiClient.request({
        url: 'applyUser:requestTrial',
        method: 'POST',
        data: formData,
      });

      const appUrl = '/';

      messageApi.success('用户注册成功!');
      setTimeout(async () => {
        handleCancelFreeTrial();
        await apiClient.auth.signIn(data, 'basic');
        // navigate('/');
        window.location.href = appUrl;
        // window.open(appUrl, '_blank');
      }, 1000);
    } catch (error) {
      console.log(`error:`, error);
    }
  });

  const renderFreeTrialForm = () => {
    return (
      <CommonModalLayout title={`免费试用${store.trialDays}天`}>
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          // variant="underlined"
          form={form}
          initialValues={testValue}
          autoComplete="off"
          onFinish={handleSubmitFreeTrial}
        >
          <Form.Item name="verificationKey" noStyle>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item<IFreeTrialForm> label="姓名" name="name" rules={[{ required: true, message: '该项为必填信息!' }]}>
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
            <Space.Compact style={{ width: '100%' }}>
              <Input />
              <CountDownButton disabled={!canSendVerificationCode} onClick={handleSendVerificationCode} />
            </Space.Compact>
          </Form.Item> */}

          <div className={styles.operatorContainer}>
            <Button type="primary" size="large" block htmlType="submit">
              立即提交
            </Button>
          </div>
        </Form>
      </CommonModalLayout>
    );
  };

  return (
    <div className={styles.operators}>
      {contextHolder}

      <button className={styles.requestDemoBtn} onClick={handleRequestDemo}>
        预约演示
      </button>

      <button className={styles.freeTrialBtn} onClick={handleFreeTrial}>
        免费试用
      </button>

      <Modal
        className={styles.customModal}
        open={store.trialModaShow}
        width={smallScreeen ? '92%' : 500}
        footer={null}
        keyboard={false}
        maskClosable={false}
        onCancel={handleCancelFreeTrial}
      >
        {renderFreeTrialForm()}
      </Modal>
    </div>
  );
});

HeaderOperator.displayName = 'HeaderOperator';

export default HeaderOperator;
