import React, { memo } from 'react';
import { Button } from 'antd';
import { Authenticator } from '@nocobase/plugin-auth/client';
import { WechatFilled } from '@ant-design/icons';
import { TIKTOK_API_URL } from '../../common';
import tiktokSignIn from '../images/tiktok-signIn.png';
import { createStyles } from '@nocobase/client';

const useStyles = createStyles(({ css }) => {
  return {
    tkSignInImg: css`
      /* display: flex;
      flex-flow: column;
      align-items: center; */
      width: 60px;
      height: 60px;
    `,
  };
});

export const TikTokSignIn = memo((props: { authenticator: Authenticator }) => {
  const { styles } = useStyles();

  const handleSignIn = () => {
    //
  };

  const url = `${TIKTOK_API_URL}/api/tiktok:registerAuthorize`;
  return (
    <>
      {/* <Button onClick={handleSignIn} icon={<WechatFilled color="#01A0FF" />} block>
      企微登录
    </Button> */}
      <a href={url}>
        <img className={styles.tkSignInImg} src={tiktokSignIn} />
      </a>
    </>
  );
});

TikTokSignIn.displayName = 'TikTokSignIn';
