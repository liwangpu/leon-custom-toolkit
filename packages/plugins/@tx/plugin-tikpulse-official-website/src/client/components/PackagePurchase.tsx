import React, { useEffect, useLayoutEffect, useMemo } from 'react';
import { Plugin, useAPIClient, useCurrentUserContext } from '@nocobase/client';
import { createStyles } from '@nocobase/client';
import { observer } from 'mobx-react-lite';
import { useNavigate, useParams } from 'react-router-dom';
import { AppStore, AppStoreContext } from './store';
import PackageAndService from './PackageAndService';
import { isNil } from 'lodash';

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

  app.router.add('public-package-purchase', {
    path: '/package-purchase/:organizationId',
    Component: PublicPackagePurchase,
  });
};

const usePurchaseStyles = createStyles(({ css, responsive }) => {
  return {
    page: css`
      position: relative;
      width: 100%;
      border-radius: 16px;
      background-color: #fff;
    `,
  };
});

const PackagePurchase: React.FC = observer((props) => {
  const navigate = useNavigate();
  const apiClient = useAPIClient();
  const { styles } = usePurchaseStyles();
  const store = useMemo(() => new AppStore({ apiClient, loginIn: true, navigate }), [apiClient]);
  const currentUserContext = useCurrentUserContext();
  const currentUser = currentUserContext?.data?.data;
  const organizationId = currentUser.organizationId;

  useEffect(() => {
    store.setOrganizationId(organizationId);
  }, []);

  return (
    <AppStoreContext.Provider value={store}>
      <div className={styles.page}>
        <PackageAndService />
      </div>
    </AppStoreContext.Provider>
  );
});

PackagePurchase.displayName = 'PackagePurchase';

const usePublicPurchaseStyles = createStyles(({ css, responsive }) => {
  return {
    page: css`
      position: relative;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
    `,
  };
});

export const PublicPackagePurchase: React.FC<{ noFooterBorder?: boolean }> = observer((props) => {
  const { noFooterBorder = true } = props;
  const { styles } = usePublicPurchaseStyles();
  const navigate = useNavigate();
  const apiClient = useAPIClient();
  const store = useMemo(() => new AppStore({ apiClient, loginIn: true, navigate }), [apiClient]);
  const currentUserContext = useCurrentUserContext();
  const currentUser = currentUserContext?.data?.data;
  let organizationId = currentUser?.organizationId;
  const { organizationId: _paramOrganizationId } = useParams();
  if (isNil(organizationId) && _paramOrganizationId) {
    organizationId = _paramOrganizationId;
  }

  useLayoutEffect(() => {
    store.setOrganizationId(organizationId);
  }, []);

  return (
    <AppStoreContext.Provider value={store}>
      <div className={styles.page}>
        <PackageAndService noFooterBorder={noFooterBorder} />
      </div>
    </AppStoreContext.Provider>
  );
});

PublicPackagePurchase.displayName = 'PublicPackagePurchase';
