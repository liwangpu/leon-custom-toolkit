import React, { memo, useEffect, useState } from 'react';
import { Plugin, useAPIClient } from '@nocobase/client';
import { App as AntdApp, Button } from 'antd';
import { createStyles } from '@nocobase/client';
import { isNil } from 'lodash';
import { IOrganizationPaidService, IOrganizationServicePackage } from '../../interfaces';
import { AlertOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../hooks';

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
    packageContainer: css`
      //
    `,
    packageItem: css`
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      &:not(:last-of-type) {
        margin-bottom: 8px;
      }
    `,
    kvBox: css`
      flex: 1;
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
      color: ${token.colorPrimary};
    `,
    lineBox: css`
      display: flex;
      flex-flow: row wrap;
      justify-content: space-between;
      border-bottom: 1px solid #f3f3f3;
      gap: 16px;
      padding: 6px 12px 3px;
    `,
  };
});

const OrganizationInfo: React.FC = memo((props) => {
  const { styles } = useStyles();
  const apiClient = useAPIClient();
  const { message } = AntdApp.useApp();
  const navigate = useNavigate();
  const [organPackages, setOrganPackages] = useState<IOrganizationServicePackage[]>();
  const [organServices, setOrganServices] = useState<IOrganizationPaidService[]>();

  useEffect(() => {
    (async () => {
      const { data } = await apiClient.request({
        url: `servicePermissions:servicesInfo`,
      });
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
            <div className={styles.kvBoxLabel}>子账号</div>
            <div className={styles.kvBoxValue}>{pck.subAccount}</div>
          </div>
          <div className={styles.kvBox}>
            <div className={styles.kvBoxLabel}>购买时间</div>
            <div className={styles.kvBoxValue}>{pck.purchasingDate}</div>
          </div>
          <div className={styles.kvBox}>
            <div className={styles.kvBoxLabel}>到期时间</div>
            <div className={styles.kvBoxValue}>{pck.expirationDate}</div>
          </div>
          <div className={styles.kvBox}>
            <div className={styles.kvBoxLabel}>剩余天数</div>
            <div className={styles.kvBoxValue}>{pck.daysRemaining} 天</div>
          </div>
        </div>
      );
    };
    return (
      <InfoCard
        title="已购套餐信息"
        rightOperator={{
          title: '更多套餐',
          icon: <AlertOutlined />,
          onClick: () => navigate(`/admin/settings/TikPulsePackagePurchase?type=package`),
        }}
      >
        {organPackages && organPackages.map((pck) => renderPackageItem(pck))}
      </InfoCard>
    );
  };

  const renderServiceList = () => {
    const renderServiceItem = (srv: IOrganizationPaidService) => {
      return (
        <div className={styles.lineBox} key={srv.id}>
          <div className={styles.kvBox}>
            <div className={styles.kvBoxLabel}>名称</div>
            <div className={styles.kvBoxValue}>{srv.name}</div>
          </div>
          <div className={styles.kvBox}>
            <div className={styles.kvBoxLabel}>购买时间</div>
            <div className={styles.kvBoxValue}>{srv.purchasingDate}</div>
          </div>
          <div className={styles.kvBox}>
            <div className={styles.kvBoxLabel}>到期时间</div>
            <div className={styles.kvBoxValue}>{srv.expirationDate}</div>
          </div>
          <div className={styles.kvBox}>
            <div className={styles.kvBoxLabel}>剩余天数</div>
            <div className={styles.kvBoxValue}>{srv.daysRemaining} 天</div>
          </div>
        </div>
      );
    };
    return (
      <InfoCard
        title="已购服务信息"
        rightOperator={{
          title: '更多服务',
          icon: <AlertOutlined />,
          onClick: () => navigate(`/admin/settings/TikPulsePackagePurchase?type=service`),
        }}
      >
        {organServices && organServices.length ? organServices.map((srv) => renderServiceItem(srv)) : null}
      </InfoCard>
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

const useInfoCardStyles = createStyles(({ css, token }) => {
  return {
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
      justify-content: space-between;
      align-items: center;
      width: 100%;
    `,
    cardContent: css`
      display: flex;
      flex-flow: column;
      width: 100%;
      margin-top: 12px;
      gap: 14px;
    `,
    cardTitle: css`
      font-size: 16px;
      font-weight: 700;
    `,
  };
});

interface IInfoCardProps {
  title: string;
  rightOperator?: {
    title: string;
    icon: React.ReactNode;
    onClick?: () => void;
  };
  children?: React.ReactNode;
}

const InfoCard: React.FC<IInfoCardProps> = (props) => {
  const { title, rightOperator, children } = props;
  const { styles } = useInfoCardStyles();
  const handleClick = useEvent(() => {
    rightOperator.onClick();
  });
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>{title}</div>
        {rightOperator && (
          <div>
            <Button type="link" icon={rightOperator.icon} onClick={handleClick}>
              {rightOperator.title}
            </Button>
          </div>
        )}
      </div>
      <div className={styles.cardContent}>{children}</div>
    </div>
  );
};

InfoCard.displayName = 'InfoCard';
