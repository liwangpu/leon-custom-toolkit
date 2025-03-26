import React, { useEffect, useMemo } from 'react';
import { createStyles, useAPIClient } from '@nocobase/client';
import { Plugin } from '@nocobase/client';
import { observer } from 'mobx-react-lite';
import ImgPageBackground from '../assets/images/page-back.png';
// import ImgLogo from '../assets/images/logo.png';
import ImgLogo from '../assets/images/logo-s.png';
import classnames from 'classnames';
import { useNavigate, useParams } from 'react-router-dom';
import { useEvent } from '../hooks';
import HeaderOperator from './HeaderOperator';
import FooterInfo from './FooterInfo';
import { Button, ConfigProvider, Space } from 'antd';
import { AppStore } from './store';
import DownloadPage from './DownloadPage';
import IntroducePage from './IntroducePage';
import PackagePage from './PackagePage';

// 下载链接
// https://astrolabe-releaser.taixiang-tech.com/download/latest/windows_64

interface INavItem {
  key: AppNameEnum;
  title: string;
  icon?: string;
  activedIcon?: string;
}

export const registerHomePage = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.router.add('home', {
    path: '/home/:appName?',
    Component: HomePage,
  });
};

const useStyles = createStyles(({ css }) => {
  const headerHeight = 76;
  return {
    page: css`
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-flow: column;
      overflow-y: auto;
      overflow-x: hidden;
      background-color: #0d3333;
      padding-top: ${headerHeight}px;
    `,
    pageHeader: css`
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      max-width: 1360px;
      height: ${headerHeight}px;
      margin: auto;
      padding: 16px;
      background-color: #fff;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 16px;
      z-index: 100;
    `,
    pageContent: css`
      flex: 1;
      width: 100%;
      color: #fff;
    `,
    pageFooter: css`
      display: flex;
      flex-flow: column;
      width: 100%;
      /* height: 200px; */
      background: rgb(4, 4, 4);
      border-top-left-radius: 64px;
      border-top-right-radius: 64px;
      z-index: 100;
    `,
    logoContainer: css`
      display: flex;
      align-items: center;
      font-size: 26px;
      font-weight: 600;
      color: #026661;
    `,
    logo: css`
      width: 24px;
      height: 24px;
      margin-right: 6px;
    `,
    navs: css`
      display: flex;
      align-items: center;
      flex: 1;
      font-size: 15px;
      font-weight: 700;
      padding: 0 22px;
    `,
    navItem: css`
      padding: 6px 16px;
      cursor: pointer;
      &.actived {
        color: #026661;
      }
      &:hover {
        color: #026661;
      }
      &:not(:last-of-type) {
        margin-right: 14px;
      }
    `,
    bgSection1: css``,
  };
});

const HomePage: React.FC = observer((props) => {
  const { styles } = useStyles();
  const { appName: _appName } = useParams();
  const navigate = useNavigate();
  const apiClient = useAPIClient();
  const appStore = useMemo(() => new AppStore({ apiClient }), [apiClient]);
  const appName: AppNameEnum = (_appName || AppNameEnum.introduce) as any;
  const handleNavigateTo = useEvent((appName: AppNameEnum) => {
    navigate(`/home/${appName}`);
  });

  const renderNavs = () => {
    return NAV_ITEMS.map((it) => (
      <div
        className={classnames(styles.navItem, {
          actived: appName === it.key,
        })}
        key={it.key}
        onClick={() => handleNavigateTo(it.key)}
      >
        {/* <img src={appName === it.key ? it.activedIcon : it.icon} /> */}
        <span>{it.title}</span>
      </div>
    ));
  };

  const renderPage = () => {
    switch (appName) {
      case AppNameEnum.softwareDownload:
        return <DownloadPage />;
      case AppNameEnum.introduce:
        return <IntroducePage store={appStore} />;
      case AppNameEnum.package:
        return <PackagePage />;
      default:
        return <></>;
    }
  };

  useEffect(() => {
    appStore.initialize();
    document.title = 'TIKPULSE';
  }, [appStore]);

  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token，影响范围大
          colorPrimary: '#3f6600',
          borderRadius: 2,

          // 派生变量，影响范围小
          colorBgContainer: '#f6ffed',
        },
      }}
    >
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.logoContainer}>
            <img className={styles.logo} src={ImgLogo} />
            <div>TIKPULSE</div>
          </div>
          <div className={styles.navs}>{renderNavs()}</div>
          <HeaderOperator store={appStore} />
        </div>
        <div className={styles.pageContent}>{renderPage()}</div>
        <div className={styles.pageFooter}>
          <FooterInfo store={appStore} />
        </div>
      </div>
    </ConfigProvider>
  );
});

HomePage.displayName = 'HomePage';

enum AppNameEnum {
  introduce = 'introduce',
  package = 'package',
  softwareDownload = 'download',
}

const NAV_ITEMS: INavItem[] = [
  {
    key: AppNameEnum.introduce,
    title: '软件介绍',
    // icon: aiAnalyzeImg,
    // activedIcon: aiAnalyzeActivedImg,
  },
  {
    key: AppNameEnum.package,
    title: '套餐详情',
    // icon: solutionImg,
    // activedIcon: solutionActivedImg,
  },
  {
    key: AppNameEnum.softwareDownload,
    title: '软件下载',
    // icon: solutionImg,
    // activedIcon: solutionActivedImg,
  },
];
