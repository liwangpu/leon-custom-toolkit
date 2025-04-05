import React, { memo, useCallback, useEffect, useState } from 'react';
import { createStyles } from 'antd-style';
import { Plugin } from '@nocobase/client';
import { Alert, Empty } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const registerForcedOfflinePage = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.router.add('force-offline', {
    path: '/token/force-offline',
    Component: ForcedOffline,
  });
};

const useStyles = createStyles(({ css, responsive }) => {
  return {
    page: css`
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-flow: column;
      justify-content: center;
      align-items: center;
    `,
    tip: css`
      font-size: 16px;
    `,
  };
});

const remainingSecond = 5;
const ForcedOffline: React.FC = memo((props) => {
  const { styles } = useStyles();
  const [remainingTime, setRemainingTime] = useState<number>(remainingSecond);
  const navigate = useNavigate();

  const backToLogin = useCallback(() => {
    localStorage.removeItem('NOCOBASE_TOKEN');
    navigate('/signin');
  }, []);

  const renderDes = () => {
    return (
      <div>
        <div className={styles.tip}>用户已经在另一台设备登录,请使用其他账号或者重新登录!</div>
        <div className={styles.tip}>
          {`${remainingTime}秒后跳转登录界面,或者`}
          <a href="#" onClick={backToLogin}>
            立即前往登录界面
          </a>
        </div>
      </div>
    );
  };

  useEffect(() => {
    let remaining = remainingSecond;
    const it = setInterval(() => {
      remaining--;
      if (remaining === 0) {
        clearInterval(it);
        backToLogin();
        return;
      }
      setRemainingTime(remaining);
    }, 1000);
  }, []);

  return (
    <div className={styles.page}>
      {/* <div className={styles.message}>用户已经在另一个地方登录,请使用其他账号或者重新登录</div> */}

      <Alert message="温馨提示" description={renderDes()} type="info" showIcon />
    </div>
  );
});

ForcedOffline.displayName = 'ForcedOffline';
