import { Button, Input, message, Space } from 'antd';
import React, { useState } from 'react';
import { useEvent } from '../../hooks';
import { observer } from 'mobx-react-lite';
import { isEmpty, isFunction, isNil } from 'lodash';
import { GenerateShortId } from '../../utils';
import { useAPIClient } from '@nocobase/client';

export interface IVerificationCodeInputProps {
  phone?: string;
  value?: any;
  onChange?: (val?: any) => void;
  setVerificationKey?: (key: string) => void;
}

const VerificationCodeInput: React.FC<IVerificationCodeInputProps> = (props) => {
  const { value, onChange, phone, setVerificationKey } = props;
  const apiClient = useAPIClient();
  const disabled = isNil(phone) || phone.length < 11;
  const handleSendVerificationCode = useEvent(async () => {
    const vk = GenerateShortId('free_trial', 16);
    if (isFunction(setVerificationKey)) {
      setVerificationKey(vk);
    }

    await apiClient.request({
      url: 'aliyunSms:sendSms',
      method: 'POST',
      data: {
        verificationKey: vk,
        phone,
        signName: '南宁市泰香农业科技',
        templateCode: 'SMS_481215207',
        params: {
          code: '123456',
        },
      },
    });
    message.success('短信发送成功!');
  });

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Input value={value} onChange={onChange} />
      <CountDownButton disabled={disabled} onClick={handleSendVerificationCode} />
    </Space.Compact>
  );
};

VerificationCodeInput.displayName = 'VerificationCodeInput';

export default VerificationCodeInput;

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

export function useSmsVerificationRule(props: { phone?: string }) {
  const apiClient = useAPIClient();
  let verificationKey: string;
  const check = useEvent(async (val: string) => {
    const { data } = (await apiClient.axios.request({
      url: 'aliyunSms:verification',
      method: 'POST',
      data: {
        verificationKey,
        verificationCode: val,
      },
    })) as any;
    const { message } = data;
    console.log(`---------[ 校验结果 ]---------`);
    console.log(`message:`, message);
    // if (id && count > 0 && content.some((c) => c.id === id)) {
    //   return false;
    // }
    // return count > 0;
    return !isNil(message);
  });

  const setVerificationKey = (key: string) => {
    verificationKey = key;
  };

  return {
    validator: useUniqueCheckRule({ message: '验证码不正确，请仔细检查或重新发送!', check }),
    setVerificationKey,
  };
}

type AsyncFunction = (...args: any[]) => Promise<any>;

function debounceAsync(fn: AsyncFunction, wait: number) {
  let timeoutId: NodeJS.Timeout | undefined;

  return function (...args) {
    clearTimeout(timeoutId);

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => {
        fn(...args)
          .then(resolve)
          .catch(reject);
      }, wait);
    });
  };
}

function useUniqueCheckRule(props: { message: string; check: (val: any) => Promise<boolean> }) {
  const { message, check } = props;

  const validator = useEvent(
    debounceAsync(async (rule: any, value: string) => {
      if (!isFunction(check)) return;
      if (isNil(value) || value === '' || value.length < 6) return;
      if (isEmpty(value.trim())) return Promise.reject(`不能输入空字符信息!`);
      try {
        const existed = await check(value);
        if (existed) {
          return Promise.reject(message);
        } else {
          return Promise.resolve();
        }
      } catch (error) {
        return Promise.reject(`请求过程出现异常!`);
      }
    }, 120),
  );

  return { validator };
}
