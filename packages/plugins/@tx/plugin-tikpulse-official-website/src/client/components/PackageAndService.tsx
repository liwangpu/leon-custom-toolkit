import React, { useContext, useEffect, useState } from 'react';
import { useAPIClient } from '@nocobase/client';
import { createStyles } from '@nocobase/client';
import { isNil } from 'lodash';
import PackageList from './PackageList';
import { observer } from 'mobx-react-lite';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppStoreContext } from './store';
import { useEvent } from '../hooks';
import classNames from 'classnames';

const useStyles = createStyles(({ css, token, responsive }) => {
  return {
    container: css`
      position: relative;
      display: flex;
      flex-flow: column;
      width: 100%;
      overflow: hidden;
      z-index: 10;
    `,
    header: css`
      flex: 0 0 62px;
      border-bottom: 3px solid #f3f3f3;
      z-index: 1;
    `,
    content: css`
      position: relative;
      flex: 0 0 auto;
      padding: 20px 30px 50px;
      z-index: 1;
    `,
    footer: css`
      flex: 0 0 62px;
      border-top: 3px solid #f3f3f3;

      &.noFooterBorder {
        border-color: transparent !important;
      }
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
          background-color: ${token.colorPrimary};
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

const PackageAndService: React.FC<{ noFooterBorder?: boolean }> = observer((props) => {
  const { noFooterBorder } = props;
  const { styles } = useStyles();
  const apiClient = useAPIClient();
  const [searchParams, setSearchParams] = useSearchParams();
  let type = searchParams.get('type');
  if (isNil(type)) {
    type = 'package';
  }
  const [activedItem, setActivedItem] = useState<ITabItem>(tabs.find((t) => t.key === type));
  const store = useContext(AppStoreContext);
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
    return <PackageList packages={ds} key={activedItem.name} packageType={packageType} />;
  };

  useEffect(() => {
    (async () => {
      store.initialize();
      if (isNil(store.organizationId)) return;
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
    })();
  }, [apiClient, store, store.organizationId]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>{renderNavs()}</div>
      <div className={styles.content}>{renderTab()}</div>
      <div
        className={classNames(styles.footer, {
          noFooterBorder,
        })}
      ></div>
    </div>
  );
});

PackageAndService.displayName = 'PackageAndService';

export default PackageAndService;

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
