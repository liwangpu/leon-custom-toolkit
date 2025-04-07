import React, { useEffect, useMemo, useState } from 'react';
import { Plugin, useAPIClient, useCurrentUserContext } from '@nocobase/client';
import { createStyles } from '@nocobase/client';
import { isNil } from 'lodash';
import PackageList from './PackageList';
import { observer } from 'mobx-react-lite';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppStore, AppStoreContext } from './store';
import { useEvent } from '../hooks';
import classNames from 'classnames';

export const registerPackagePurchase = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;
  const { pluginSettingsManager } = app;

  pluginSettingsManager.add('TikPulsePackagePurchase', {
    title: '套餐购买',
    icon: 'ShopOutlined',
    Component: PackagePurchase,
    aclSnippet: 'pm.package_purchase',
  });
};

const useStyles = createStyles(({ css, responsive }) => {
  return {
    container: css`
      position: relative;
      display: flex;
      flex-flow: column;
      width: 100%;
      overflow: hidden;
      border-radius: 16px;
      background-color: #fff;
    `,
    header: css`
      height: 62px;
      border-bottom: 3px solid #f3f3f3;
      z-index: 1;
    `,
    content: css`
      position: relative;
      padding: 20px 30px 50px;
      z-index: 1;
    `,
    footer: css`
      height: 62px;
      border-top: 3px solid #f3f3f3;
    `,
    contentImgBg1: css`
      position: absolute;
      top: 0;
      left: 0;
      width: 1600px;
      height: 800px;
    `,
    contentImgBg2: css`
      position: absolute;
      bottom: -300px;
      left: 0;
      width: 1600px;
      height: 800px;
    `,
    navContainer: css`
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    `,
    nav: css`
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 18px;
      font-weight: 600;
      padding: 0 24px;
      height: 100%;
      cursor: pointer;

      &.actived {
        &::after {
          background-color: #1777ff;
        }
      }

      &::after {
        content: '';
        position: absolute;
        bottom: -3px;
        left: 0;
        width: 100%;
        height: 3px;
        background-color: transparent;
      }
    `,
  };
});

const PackagePurchase: React.FC = observer((props) => {
  const { styles } = useStyles();
  const navigate = useNavigate();
  const apiClient = useAPIClient();
  const [searchParams, setSearchParams] = useSearchParams();
  let type = searchParams.get('type');
  if (isNil(type)) {
    type = 'package';
  }
  const [activedItem, setActivedItem] = useState<ITabItem>(tabs.find((t) => t.key === type));
  const store = useMemo(() => new AppStore({ apiClient, loginIn: true, navigate }), [apiClient]);
  const currentUserContext = useCurrentUserContext();
  const currentUser = currentUserContext?.data?.data;
  const organizationId = currentUser.organizationId;
  const packages = store.packages || [];
  const services = store.services || [];
  const packageType = activedItem.key;

  const handleActiveTab = useEvent((item: ITabItem) => {
    setActivedItem(item);
    setSearchParams([['type', item.key]]);
  });

  const renderNavs = () => {
    return (
      <div className={styles.navContainer}>
        {tabs.map((t) => (
          <div
            className={classNames(styles.nav, {
              actived: activedItem?.name === t.name,
            })}
            key={t.name}
            onClick={() => handleActiveTab(t)}
          >
            {t.name}
          </div>
        ))}
      </div>
    );
  };

  const renderTab = () => {
    if (isNil(activedItem)) return;
    const ds = packageType === 'package' ? packages : services;
    return (
      <PackageList packages={ds} key={activedItem.name} packageType={packageType} organizationId={organizationId} />
    );
  };

  useEffect(() => {
    (async () => {
      const { data } = await apiClient.request({
        url: `servicePermissions:servicesInfo`,
      });
      if (!isNil(data)) {
        const { organPackages, organServices } = data;
        const purchasedInfo: Record<string, any> = {};
        for (const pck of organPackages) {
          purchasedInfo[pck.packageId] = pck;
        }
        store.setPurchasedPackage(purchasedInfo);
      }
      store.initialize();
    })();
  }, []);

  return (
    <AppStoreContext.Provider value={store}>
      <div className={styles.container}>
        <div className={styles.header}>{renderNavs()}</div>
        <div className={styles.content}>{renderTab()}</div>
        <div className={styles.footer}></div>
      </div>
    </AppStoreContext.Provider>
  );
});

PackagePurchase.displayName = 'PackagePurchase';

export default PackagePurchase;

interface ITabItem {
  key: string;
  name: string;
}

export const tabs: ITabItem[] = [
  {
    key: 'package',
    name: '套餐',
  },
  {
    key: 'service',
    name: '服务',
  },
];
