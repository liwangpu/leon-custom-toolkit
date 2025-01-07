import React, { memo } from 'react';
import { Button } from 'antd';
import { Authenticator } from '@nocobase/plugin-auth/client';
import { WechatFilled } from '@ant-design/icons';

export const TikTokSignIn = memo((props: { authenticator: Authenticator }) => {
  const handleSignIn = () => {
    //
  };
  return (
    <>
      {/* <Button onClick={handleSignIn} icon={<WechatFilled color="#01A0FF" />} block>
      企微登录
    </Button> */}
      <a href="https://astrolabe.taixiang-tech.com/api/tiktok:authorize?accountId=99">TK登录</a>
    </>
  );
});

TikTokSignIn.displayName = 'TikTokSignIn';
