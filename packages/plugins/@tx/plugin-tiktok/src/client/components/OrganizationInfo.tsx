import React, { memo, useCallback, useEffect, useState } from 'react';
import { Plugin, useAPIClient } from '@nocobase/client';
import { App as AntdApp, Button, Form, Input, Card } from 'antd';
import { createStyles } from '@nocobase/client';
import { isNil } from 'lodash';
import { observer } from 'mobx-react-lite';
import { IOrganizationPaidService, IOrganizationServicePackage } from '../../interfaces';

export const registerOrganizationInfoComponent = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;
  const { pluginSettingsManager } = app;

  pluginSettingsManager.add('organization_info', {
    title: '组织信息',
    icon: 'SketchOutlined',
    Component: OrganizationInfo,
    aclSnippet: 'pm.organization_info',
  });
};

const useStyles = createStyles(({ css, token }) => {
  return {
    page: css`
      display: flex;
      flex-flow: column;
      width: 100%;
    `,
    card: css`
      display: flex;
      flex-flow: column;
      width: 100%;
      padding: 14px 22px 22px;
      border-radius: 16px;
      background-color: #fff;
      margin-bottom: 16px;
    `,
    cardHeader: css`
      display: flex;
      width: 100%;
    `,
    cardContent: css`
      display: flex;
      flex-flow: column;
      width: 100%;
      margin-top: 12px;
    `,
    cardTitle: css`
      font-size: 16px;
      font-weight: 700;
    `,
    packageContainer: css`
      //
    `,
    packageItem: css`
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      &:not(:last-of-type) {
        margin-bottom: 8px;
      }
    `,
    kvBox: css`
      display: flex;
      align-items: center;
    `,
    kvBoxLabel: css`
      display: flex;
      justify-content: flex-end;
      align-items: center;
      width: 90px;
      &::after {
        content: ':';
        margin-right: 8px;
      }
    `,
    kvBoxValue: css`
      width: 220px;
      color: ${token.colorPrimary};
    `,
  };
});

const OrganizationInfo: React.FC = memo((props) => {
  const { styles } = useStyles();
  const apiClient = useAPIClient();
  const { message } = AntdApp.useApp();
  const [organPackages, setOrganPackages] = useState<IOrganizationServicePackage[]>();
  const [organServices, setOrganServices] = useState<IOrganizationPaidService[]>();

  useEffect(() => {
    (async () => {
      const { data } = await apiClient.request({
        url: `servicePermissions:servicesInfo`,
      });
      console.log(`---------[ organ service ]---------`);
      console.log(`data:`, data);
      if (!isNil(data)) {
        const { organPackages, organServices } = data;
        setOrganPackages(organPackages || []);
        setOrganServices(organServices || []);
      }
    })();
  }, []);

  const renderPackageList = () => {
    const renderPackageItem = (pck: IOrganizationServicePackage) => {
      return (
        <div className={styles.packageItem} key={pck.id}>
          <div className={styles.kvBox}>
            <div className={styles.kvBoxLabel}>名称</div>
            <div className={styles.kvBoxValue}>{pck.name}</div>
          </div>
          <div className={styles.kvBox}>
            <div className={styles.kvBoxLabel}>购买时间</div>
            <div className={styles.kvBoxValue}>{pck.purchasingDate}</div>
          </div>
          <div className={styles.kvBox}>
            <div className={styles.kvBoxLabel}>到期时间</div>
            <div className={styles.kvBoxValue}>{pck.expirationDate}</div>
          </div>
        </div>
      );
    };
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>套餐信息</div>
        </div>
        {organPackages && (
          <div className={styles.cardContent}>{organPackages.map((pck) => renderPackageItem(pck))}</div>
        )}
      </div>
    );
  };

  const renderServiceList = () => {
    const renderServiceItem = (srv: IOrganizationPaidService) => {
      //
    };
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>服务信息</div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      {renderPackageList()}
      {renderServiceList()}
    </div>
  );
});

OrganizationInfo.displayName = 'OrganizationInfo';

export default OrganizationInfo;
