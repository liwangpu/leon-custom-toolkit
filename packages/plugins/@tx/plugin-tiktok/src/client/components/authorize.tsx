import React, { useLayoutEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useSearchParams } from 'react-router-dom';
import { createStyles, useAPIClient } from '@nocobase/client';
import { isNil } from 'lodash';
import { Button, Result, Typography } from 'antd';
import axios from 'axios';

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

export const TKAuthorize: React.FC = observer((props) => {
  const [searchParams] = useSearchParams();
  const apiClient = useAPIClient();
  const { styles } = useStyles();
  // const [error, setError] = useState<string>('skdfjsdfdsf');
  // const [errorDescription, setErrorDescription] = useState<string>('发展男生看上的就发了多少积分龙山地方');
  const [code, setCode] = useState<string>();
  const [error, setError] = useState<string>();
  const [errorDescription, setErrorDescription] = useState<string>();

  useLayoutEffect(() => {
    (async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      setCode(code);
      if (isNil(code)) return;
      if (!isNil(error)) {
        setError(error);
        setErrorDescription(errorDescription);
      }
      await apiClient.request({
        url: 'tiktok:authorizeFeedback',
        method: 'POST',
        data: {
          code,
          state,
          error,
          errorDescription,
        },
      });
    })();
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

  const renderFeedbackSuccess = () => {
    if (!isNil(error) || isNil(code)) return;
    return (
      <Result
        status="success"
        title="TikTok授权成功"
        extra={[
          <Button type="primary" key="toTiktok">
            访问TikTok
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
      {renderParamsTip()}
      {renderFeedbackSuccess()}
      {renderFeedbackError()}
    </div>
  );
});

TKAuthorize.displayName = 'TKAuthorize';
