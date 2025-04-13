import React, { useContext, useState } from 'react';
import { createStyles } from '@nocobase/client';
import { observer } from 'mobx-react-lite';
import { Button, Popconfirm, Radio } from 'antd';
import { CheckOutlined, CloseOutlined, MoneyCollectFilled } from '@ant-design/icons';
import { IPackage } from '../../interface';
import { cloneDeep, isFunction, isNil, isString, round } from 'lodash';
import { AppStoreContext } from './store';
import classnames from 'classnames';
import { useEvent } from '../hooks';
import { usePurchaseForm } from './forms/PurchaseForm';

const useStyles = createStyles(({ css, responsive, token }) => {
  return {
    container: css`
      display: flex;
      flex-flow: column;
      width: 100%;
    `,
    header: css`
      display: flex;
      justify-content: center;
      padding: 42px 32px;
    `,
    content: css`
      //
    `,
    serviceContainer: css`
      display: flex;
      flex-flow: row wrap;
      justify-content: center;
      gap: 30px 40px;
    `,
  };
});

const options = [
  { label: '月付', value: 'monthly' },
  { label: '年付', value: 'annual' },
];

export interface IPackageListProps {
  packages: IPackage[];
  packageType: string;
}

const PackageList: React.FC<IPackageListProps> = observer((props) => {
  const { packages = [], packageType } = props;
  const { styles } = useStyles();
  const [purchaseMethod, setPurchaseMethod] = useState<string>('annual');
  const store = useContext(AppStoreContext);
  const purchasedPackage = store.purchasedPackage;
  const { contextHolder: purchaseFormContextHolder, handlePurchaseClick } = usePurchaseForm({
    purchaseMethod,
    packageType,
  });

  const renderServiceItems = () => {
    return (
      <div className={styles.serviceContainer}>
        {packages.map((item) => (
          <ServiceItemCard
            key={item.name}
            item={item}
            purchaseMethod={purchaseMethod}
            onPurchase={handlePurchaseClick}
            purchased={purchasedPackage.has(`${item.id}`)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Radio.Group
          options={options}
          size="large"
          value={purchaseMethod}
          onChange={(v) => setPurchaseMethod(v.target.value)}
          optionType="button"
          buttonStyle="solid"
        />
      </div>
      {purchaseFormContextHolder()}
      <div className={styles.content}>{renderServiceItems()}</div>
    </div>
  );
});

PackageList.displayName = 'PackageList';

export default PackageList;

const useCardStyles = createStyles(({ css, responsive, token }) => {
  return {
    card: css`
      position: relative;
      display: flex;
      flex-flow: column;
      width: 328px;
      border: 1px solid rgba(0, 0, 0, 0.4);
      /* border: 1px solid #f3f3f3; */
      border-radius: 16px;
      padding: 22px;
      gap: 14px 0;
      color: black;
      background-color: #fff;
      box-shadow:
        0 1px 2px 0 rgba(0, 0, 0, 0.03),
        0 1px 6px -1px rgba(0, 0, 0, 0.02),
        0 2px 4px 0 rgba(0, 0, 0, 0.02);
      overflow: hidden;
    `,
    title: css`
      font-size: 18px;
      line-height: 18px;
      font-weight: 600;
    `,
    description: css`
      font-size: 14px;
      line-height: 16px;
      height: 70px;
      color: gray;
      /* font-weight: 600; */
    `,
    purchasedFlag: css`
      position: absolute;
      top: 4px;
      right: 10px;
      display: flex;
      align-items: center;
      color: ${token.colorPrimary};
      font-size: 16px;
      & > * {
        margin-right: 4px;
      }
    `,
    priceMessage: css`
      display: flex;
      align-items: flex-end;
      /* padding: 0 20px; */
    `,
    price: css`
      font-size: 34px;
      line-height: 34px;
      font-weight: 600;
    `,
    priceUnit: css`
      font-size: 16px;
      padding-left: 20px;

      &.hidden {
        display: none;
      }
    `,
    operators: css`
      padding: 10px 0 6px;
    `,
    featureContainer: css`
      flex: 1 0 1;
      display: flex;
      flex-flow: column;
      gap: 8px;
      height: 300px;
      overflow-x: hidden;
      overflow-y: auto;
      padding: 0 12px;
    `,
    feature: css`
      display: flex;
      flex-flow: row;
      align-items: center;
      &.disabled {
        color: ${token.colorTextDisabled};
      }
      &.primaryColor {
        color: ${token.colorPrimary};
      }
    `,
    featureIcon: css`
      margin-right: 8px;
    `,
  };
});

const ServiceItemCard: React.FC<{
  item: IPackage;
  purchaseMethod: string;
  onPurchase: (pck: IPackage) => void;
  purchased?: boolean;
}> = (props) => {
  const { item, purchaseMethod, onPurchase, purchased } = props;
  const { features } = item;
  const { styles } = useCardStyles();
  const price = purchaseMethod === 'annual' ? item.annualPrice : item.price;
  const months = purchaseMethod === 'annual' ? 12 : 1;
  const monthlyPrice = round(price / months, 0);
  const needPurchase = item.needPurchase;

  const handlePurchase = useEvent(() => {
    if (!isFunction(onPurchase)) return;
    if (price > 0) {
      onPurchase(item);
    }
  });

  const handleConfirmOK = useEvent(() => {
    onPurchase(item);
  });

  const renderFeatures = () => {
    if (!(features && features.length)) return;

    const renderItem = (feature: any) => {
      if (isNil(item)) return;
      let disabled = false;
      let primaryColor = false;
      let featureContent = '';
      let style: Record<string, any> = {};
      if (isString(feature)) {
        featureContent = feature;
      } else {
        featureContent = feature.content;
        disabled = feature.disabled;
        primaryColor = feature.primaryColor;
        style = feature.style ? cloneDeep(feature.style) : {};
      }

      return (
        <div
          className={classnames(styles.feature, {
            disabled,
            primaryColor,
          })}
          style={style}
        >
          {disabled ? (
            <CloseOutlined className={styles.featureIcon} />
          ) : (
            <CheckOutlined className={styles.featureIcon} />
          )}
          <div>{featureContent}</div>
        </div>
      );
    };

    return <div className={styles.featureContainer}>{features.map((feature) => renderItem(feature))}</div>;
  };

  return (
    <div className={styles.card}>
      <div className={styles.title}>{item.name}</div>
      <div className={styles.description}>{item.description}</div>
      {purchased && price > 0 && (
        <div className={styles.purchasedFlag}>
          <MoneyCollectFilled />
          <div>已购</div>
        </div>
      )}
      <div className={styles.priceMessage}>
        <div className={styles.price}> {`¥ ${monthlyPrice}`}</div>
        <div
          className={classnames(styles.priceUnit, {
            hidden: monthlyPrice < 1,
          })}
        >
          {' '}
          {' / 每月'}
        </div>
      </div>
      <div className={styles.operators}>
        {needPurchase ? (
          <Button block type="primary" onClick={handlePurchase} disabled={price === 0 && purchased}>
            购买
          </Button>
        ) : (
          <Popconfirm
            title="温馨提示"
            description="领取后功能生效期将从此时开始算起，请确认是否领取？"
            onConfirm={handleConfirmOK}
            okText="确认"
            cancelText="取消"
          >
            <Button block type="primary" onClick={handlePurchase} disabled={price === 0 && purchased}>
              {purchased ? '已领取' : '免费领取'}
            </Button>
          </Popconfirm>
        )}
      </div>

      {renderFeatures()}
    </div>
  );
};

ServiceItemCard.displayName = 'ServiceItemCard';

const PurchasePrice: React.FC<{ value?: any }> = (props) => {
  const { value } = props;
  return <div>{value}元</div>;
};

PurchasePrice.displayName = 'PurchasePrice';
