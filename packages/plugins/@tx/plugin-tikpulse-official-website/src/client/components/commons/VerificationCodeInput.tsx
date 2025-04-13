import { Button, Input, message, Space } from 'antd';
import React, { useContext, useState } from 'react';
import { useEvent } from '../../hooks';
import { observer } from 'mobx-react-lite';
import { isFunction } from 'lodash';
import { GenerateShortId } from '../../utils';

export interface IVerificationCodeInputProps {
  disabled?: boolean;
  value?: any;
  onChange?: (val?: any) => void;
}

const VerificationCodeInput: React.FC<IVerificationCodeInputProps> = (props) => {
  const { value, onChange, disabled } = props;
  const [canSendVerificationCode, setCanSendVerificationCode] = useState<boolean>(true);

  const handleSendVerificationCode = useEvent(async () => {
    const verificationKey = GenerateShortId('free_trial', 16);
    // form.setFieldValue('verificationKey', verificationKey);
    // const phone = form.getFieldValue('phone');
    // await apiClient.request({
    //   url: 'applyUser:sendPhoneVerificationSMS',
    //   method: 'POST',
    //   data: {
    //     verificationKey,
    //     phone,
    //   },
    // });
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
