import React, { useEffect, useLayoutEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createStyles, useAPIClient } from '@nocobase/client';
import { isNil } from 'lodash';
import { Button, Result, Typography } from 'antd';
import axios from 'axios';
import { useEvent } from '../hooks';

const { Paragraph, Text } = Typography;

const useStyles = createStyles(({ css }) => {
  return {
    page: css`
      display: flex;
      flex-flow: column;
      align-items: center;
      padding: 100px 0 0 0;
      width: 100%;
      height: 100%;
    `,
  };
});

export const TKAuthorizeFeedback: React.FC = observer((props) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const apiClient = useAPIClient();
  const { styles } = useStyles();
  // const [error, setError] = useState<string>('skdfjsdfdsf');
  // const [errorDescription, setErrorDescription] = useState<string>('发展男生看上的就发了多少积分龙山地方');
  const [type, setType] = useState<string>(searchParams.get('type'));
  // 返回/关闭或其他倒计时
  const [countdown, setCountdown] = useState<number>(3);
  const [code, setCode] = useState<string>();
  const [error, setError] = useState<string>();
  const [errorDescription, setErrorDescription] = useState<string>();

  const handleBackToHome = useEvent(() => {
    navigate('/');
  });
  useEffect(() => {
    if (type === 'backToHome') {
      const token = searchParams.get('token');
      localStorage.setItem('NOCOBASE_TOKEN', token);
      let _countdown = countdown;
      const it = setInterval(() => {
        if (_countdown === 0) {
          handleBackToHome();
          return clearInterval(it);
        }
        _countdown--;
        setCountdown(_countdown);
      }, 1000);
    }
    // const _type = searchParams.get('type');
    // setType(_type);
    // (async () => {
    //   const _type = searchParams.get('type');
    //   setType(_type);
    //   // const state = searchParams.get('state');
    //   // const error = searchParams.get('error');
    //   // const errorDescription = searchParams.get('error_description');
    //   // if (isNil(code)) return;
    //   // if (!isNil(error)) {
    //   //   setError(error);
    //   //   setErrorDescription(errorDescription);
    //   // }
    //   // const {
    //   //   data: { data },
    //   // } = await apiClient.request({
    //   //   url: 'tiktok:authorizeFeedback',
    //   //   method: 'POST',
    //   //   data: {
    //   //     code,
    //   //     state,
    //   //     error,
    //   //     errorDescription,
    //   //   },
    //   // });
    //   // setCode(code);
    //   // console.log(`data:`, data);
    //   // if (!isNil(data?.registerUserId)) {
    //   //   // localStorage.setItem('NOCOBASE_TOKEN', data.token);
    //   //   await apiClient.auth.signIn({
    //   //     account: data.registerUserName,
    //   //     password: data.registerUserPassword,
    //   //   });
    //   //   navigate('/');
    //   // }
    //   // console.log(`authorizeFeedback res data:`, data);
    // })();
  }, []);

  const renderParamsTip = () => {
    if (!isNil(code)) return;
    return (
      <Result title="页面请求参数不完整" subTitle="query参数中需要有tiktok认证后返回参数">
        <div className="desc">
          <Paragraph>
            <Text
              strong
              style={{
                fontSize: 16,
              }}
            >
              详细参数参考:
            </Text>
          </Paragraph>
          <Paragraph>
            <a href="https://developers.tiktok.com/doc/login-kit-web?enter_method=left_navigation">TikTok文档</a>
          </Paragraph>
        </div>
      </Result>
    );
  };

  const renderBackToHome = () => {
    if (type !== 'backToHome') return;
    return (
      <Result
        status="success"
        title="tiktok authorize success!"
        extra={[
          <Button type="primary" key="toTiktok" onClick={handleBackToHome}>
            Redirect to homepage or automatically redirect after {countdown} seconds
          </Button>,
        ]}
      />
    );
  };

  const renderFeedbackSuccess = () => {
    if (type !== 'close') return;
    return (
      <Result
        status="success"
        title="TikTok授权成功"
        extra={[
          <Button type="primary" key="toTiktok">
            访问Astrolabe
          </Button>,
        ]}
      />
    );
  };

  const renderFeedbackError = () => {
    if (isNil(error)) return;
    return (
      <div>
        <Result status="error" title="授权出现错误" subTitle={error}>
          <div className="desc">
            <Paragraph>
              <Text
                strong
                style={{
                  fontSize: 16,
                }}
              >
                {error}
              </Text>
            </Paragraph>
            <Paragraph>{errorDescription}</Paragraph>
          </div>
        </Result>
      </div>
    );
  };
  return (
    <div className={styles.page}>
      {renderFeedbackSuccess()}
      {renderBackToHome()}
      {/* {renderParamsTip()}
      {renderFeedbackSuccess()}
      {renderFeedbackError()} */}
    </div>
  );
});

TKAuthorizeFeedback.displayName = 'TKAuthorizeFeedback';
