import React, { useEffect, useMemo } from 'react';
import { useAPIClient } from '@nocobase/client';
import { createStyles, useResponsive } from 'antd-style';
import { Plugin } from '@nocobase/client';
import { observer } from 'mobx-react-lite';
import ImgLogo from '../assets/images/logo-s.png';
import classnames from 'classnames';
import { useNavigate, useParams } from 'react-router-dom';
import { useEvent } from '../hooks';
import HeaderOperator from './HeaderOperator';
import FooterInfo from './FooterInfo';
import { ConfigProvider, Dropdown } from 'antd';
import { AppStore, AppStoreContext } from './store';
import DownloadPage from './DownloadPage';
import IntroducePage from './IntroducePage';
import PackagePage from './PackagePage';
import { MenuOutlined } from '@ant-design/icons';
import { PrimaryColor } from './common';

// 下载链接
// https://astrolabe-releaser.taixiang-tech.com/download/latest/windows_64

interface INavItem {
  key: AppNameEnum;
  label: string;
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

const useStyles = createStyles(({ css, responsive }) => {
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
      color: black;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 16px;
      z-index: 100;

      ${responsive.sm} {
        height: 50px;
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
      }
    `,
    pageContent: css`
      flex: 1;
      width: 100%;
      color: #fff;
      padding: 50px 0;
      padding: 140px 0 40px;
      ${responsive.sm} {
        padding: 70px 0 20px;
      }
    `,
    pageFooter: css`
      display: flex;
      flex-flow: column;
      width: 100%;
      background: rgb(4, 4, 4);
      border-top-left-radius: 64px;
      border-top-right-radius: 64px;
      z-index: 100;
      ${responsive.sm} {
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
      }
    `,
    logoContainer: css`
      display: flex;
      align-items: center;
      font-size: 26px;
      font-weight: 600;
      color: ${PrimaryColor};
      cursor: pointer;
    `,
    logo: css`
      width: 24px;
      height: 24px;
      margin-right: 6px;
    `,
    logoTitle: css`
      ${responsive.sm} {
        display: none;
      }
    `,
    navs: css`
      display: flex;
      align-items: center;
      flex: 1;
      font-size: 15px;
      font-weight: 700;
      padding: 0 16px;
      color: black;
    `,
    navItem: css`
      padding: 6px 16px;
      cursor: pointer;
      &.actived {
        color: ${PrimaryColor};
      }
      &:hover {
        color: ${PrimaryColor};
      }
      &:not(:last-of-type) {
        margin-right: 14px;
      }
    `,
    bgSection1: css``,
  };
});

const theme = {
  token: {
    // Seed Token，影响范围大
    colorPrimary: '#3f6600',
    borderRadius: 2,

    // 派生变量，影响范围小
    colorBgContainer: '#f6ffed',
  },
};

const HomePage: React.FC = observer((props) => {
  const { styles } = useStyles();
  const { appName: _appName } = useParams();
  const navigate = useNavigate();
  const apiClient = useAPIClient();
  const appStore = useMemo(() => new AppStore({ apiClient }), [apiClient]);
  const { lg } = useResponsive();

  const appName: AppNameEnum = (_appName || AppNameEnum.introduce) as any;

  const handleNavigateTo = useEvent((appName: AppNameEnum) => {
    navigate(`/home/${appName}`);
  });

  const handleNavigateToHome = useEvent(() => {
    handleNavigateTo(AppNameEnum.introduce);
  });

  const renderNavs = () => {
    if (!lg) {
      const navItems = NAV_ITEMS.map((it) => ({
        key: it.key,
        label: (
          <div onClick={() => handleNavigateTo(it.key)}>
            <img src={appName === it.key ? it.activedIcon : it.icon} />
            <span>{it.label}</span>
          </div>
        ),
      }));
      return (
        <Dropdown menu={{ items: navItems }} trigger={['click']}>
          <a onClick={(e) => e.preventDefault()}>
            <MenuOutlined />
          </a>
        </Dropdown>
      );
    }

    return NAV_ITEMS.map((it) => (
      <div
        className={classnames(styles.navItem, {
          actived: appName === it.key,
        })}
        key={it.key}
        onClick={() => handleNavigateTo(it.key)}
      >
        {/* <img src={appName === it.key ? it.activedIcon : it.icon} /> */}
        <span>{it.label}</span>
      </div>
    ));
  };

  const renderPage = () => {
    switch (appName) {
      case AppNameEnum.softwareDownload:
        return <DownloadPage />;
      case AppNameEnum.introduce:
        return <IntroducePage />;
      case AppNameEnum.package:
        return <PackagePage />;
      default:
        return <></>;
    }
  };

  useEffect(() => {
    appStore.initialize();
    document.title = 'TIKPULSE';

    let meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
    }
    if (meta) {
      meta.content = 'width=device-width, initial-scale=1, user-scalable=1';
    }
  }, [appStore]);

  return (
    <ConfigProvider theme={theme}>
      <AppStoreContext.Provider value={appStore}>
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div className={styles.logoContainer} onClick={handleNavigateToHome}>
              <img className={styles.logo} src={ImgLogo} />
              <div className={styles.logoTitle}>TIKPULSE</div>
            </div>
            <div className={styles.navs}>{renderNavs()}</div>
            <HeaderOperator store={appStore} />
          </div>
          <div className={styles.pageContent}>{renderPage()}</div>
          <div className={styles.pageFooter}>
            <FooterInfo store={appStore} />
          </div>
        </div>
      </AppStoreContext.Provider>
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
    label: '软件介绍',
    // icon: aiAnalyzeImg,
    // activedIcon: aiAnalyzeActivedImg,
  },
  {
    key: AppNameEnum.package,
    label: '套餐详情',
    // icon: solutionImg,
    // activedIcon: solutionActivedImg,
  },
  {
    key: AppNameEnum.softwareDownload,
    label: '软件下载',
    // icon: solutionImg,
    // activedIcon: solutionActivedImg,
  },
];
