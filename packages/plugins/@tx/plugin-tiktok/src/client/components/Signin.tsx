import React, { memo } from 'react';
import { Authenticator } from '@nocobase/plugin-auth/client';
import tiktokSignIn from '../images/tiktok-signIn.png';
import { createStyles } from '@nocobase/client';
import { getTiktokAPIBaseUrl } from '../../common';
import AuthPlugin from '@nocobase/plugin-auth/client';
import { Plugin } from '@nocobase/client';

export const registerSignComponent = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  const auth = app.pm.get(AuthPlugin);
  auth.registerType('TikTok', {
    components: {
      SignInButton: TikTokSignIn,
    },
  });
};

const TIKTOK_API_URL = getTiktokAPIBaseUrl();
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
