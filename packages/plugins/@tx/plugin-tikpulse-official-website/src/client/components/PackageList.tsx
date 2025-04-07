import React, { useContext, useEffect, useState } from 'react';
import { createStyles, useAPIClient, useCurrentUserContext } from '@nocobase/client';
import { observer } from 'mobx-react-lite';
import { Button, Form, Input, InputNumber, Modal, Radio, message } from 'antd';
import { CheckOutlined, MoneyCollectFilled, MoneyCollectOutlined } from '@ant-design/icons';
import { IPackage } from '../../interface';
import { isNil, round } from 'lodash';
import { useEvent } from '../hooks';
import { AppStoreContext } from './store';
import queryString from 'query-string';

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
    operatorContainer: css`
      width: 100%;
    `,
    fullWidth: css`
      width: 100%;
    `,
    modalPurchasePrice: css`
      text-align: right;
      font-size: 16px;
      font-weight: 600;
      padding: 0 14px;
      color: ${token.colorPrimary};
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
  organizationId?: number | string;
}

const PackageList: React.FC<IPackageListProps> = observer((props) => {
  const { packages = [], packageType, organizationId } = props;
  const { styles } = useStyles();
  const [purchaseMethod, setPurchaseMethod] = useState<string>('monthly');
  const store = useContext(AppStoreContext);
  const [messageApi, contextHolder] = message.useMessage({ top: 300 });
  const loginIn = store.loginIn;
  const purchasedPackage = store.purchasedPackage;
  const [form] = Form.useForm();
  const apiClient = useAPIClient();
  const [showModa, setShowModa] = useState<boolean>();
  // const currentUserContext = useCurrentUserContext();
  // const currentUser = currentUserContext?.data?.data;
  const purchaseDurationUnit = purchaseMethod === 'annual' ? '年' : '月';
  const [purchasePriceValue, setPurchasePriceValue] = useState<number>(0);
  const subAccount = Form.useWatch((values) => {
    return values.subAccount;
  }, form);
  const packageId = Form.useWatch((values) => {
    return values.packageId;
  }, form);
  const duration = Form.useWatch((values) => {
    return values.duration;
  }, form);

  useEffect(() => {
    if (isNil(packageId) || isNil(subAccount)) return;
    (async () => {
      const {
        data: { price },
      } = (await apiClient.request({
        url: 'payment:caculatePackagePrice',
        method: 'GET',
        params: {
          packageId,
          subAccount,
          duration,
          durationUnit: purchaseMethod,
        },
      })) as any;
      setPurchasePriceValue(price || 0);
    })();
  }, [apiClient, purchaseMethod, duration, subAccount, packageId]);

  const handlePurchaseClick = useEvent((pck: IPackage) => {
    if (!loginIn) {
      messageApi.info(`购买功能需要在客户端中才能购买!`);
      return;
    }
    const price = purchaseMethod === 'annual' ? pck.annualPrice : pck.price;
    const currentPackagePurchaseInfo = purchasedPackage.get(`${pck.id}`);
    form.setFieldsValue({
      packageId: pck.id,
      durationUnit: purchaseMethod,
      packageType,
      duration: 1,
      subAccount: currentPackagePurchaseInfo?.subAccount || 0,
      packagePrice: price,
    });
    setShowModa(true);
  });

  const handlePurchase = useEvent(async (values: any) => {
    const { duration, durationUnit } = values;
    const purchaseMonths = durationUnit === 'annual' ? duration * 12 : duration;
    const baseUrl = `${window.location.origin}/api/payment:makePackagePayment`;
    const url = queryString.stringifyUrl({
      url: baseUrl,
      query: {
        ...values,
        purchaseMonths,
        // organizationId: currentUser.organizationId,
        organizationId,
      },
    });

    window.open(url, '_blank');
    setShowModa(false);
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

  const renderPackagePurchaseForm = () => {
    return (
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        autoComplete="off"
        onFinish={handlePurchase}
      >
        <Form.Item name="packageId" noStyle>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item name="packageType" noStyle>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item name="durationUnit" noStyle>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item name="packagePrice" noStyle>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item<any> label="购买时长" name="duration" rules={[{ required: true, message: '该项为必填信息!' }]}>
          <InputNumber className={styles.fullWidth} addonAfter={purchaseDurationUnit} min={1} precision={0} />
        </Form.Item>

        <Form.Item<any> label="子账号" name="subAccount" rules={[{ required: true, message: '该项为必填信息!' }]}>
          <InputNumber className={styles.fullWidth} addonAfter="个" min={0} precision={0} />
        </Form.Item>

        <Form.Item<any> shouldUpdate label="费用" name="price" dependencies={['duration']}>
          <div className={styles.modalPurchasePrice}>{purchasePriceValue} 元</div>
        </Form.Item>

        <div className={styles.operatorContainer}>
          <Button type="primary" size="large" block htmlType="submit">
            付款
          </Button>
        </div>
      </Form>
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

        <Modal
          // className={styles.customModal}
          title="购买信息"
          open={showModa}
          width={500}
          footer={null}
          keyboard={false}
          maskClosable={false}
          onCancel={() => setShowModa(false)}
        >
          {renderPackagePurchaseForm()}
        </Modal>

        {contextHolder}
      </div>
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
      //
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
  const { styles } = useCardStyles();
  const price = purchaseMethod === 'annual' ? item.annualPrice : item.price;
  const months = purchaseMethod === 'annual' ? 12 : 1;
  const monthlyPrice = round(price / months, 0);
  const needPurchase = item.needPurchase;
  return (
    <div className={styles.card}>
      <div className={styles.title}>{item.name}</div>
      <div className={styles.description}>{item.description}</div>
      {purchased && (
        <div className={styles.purchasedFlag}>
          <MoneyCollectFilled />
          <div>已购</div>
        </div>
      )}
      <div className={styles.priceMessage}>
        <div className={styles.price}> {`¥ ${monthlyPrice}`}</div>
        <div className={styles.priceUnit}> {' / 每月'}</div>
      </div>
      <div className={styles.operators}>
        <Button block type="primary" onClick={() => onPurchase(item)} disabled={!needPurchase}>
          {purchased ? '续费' : '购买'}
        </Button>
      </div>
      {item.features && item.features.length ? (
        <div className={styles.featureContainer}>
          {item.features.map((f, idx) => (
            <div className={styles.feature} key={idx}>
              <CheckOutlined className={styles.featureIcon} />
              <span>{f}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

ServiceItemCard.displayName = 'ServiceItemCard';

const PurchasePrice: React.FC<{ value?: any }> = (props) => {
  const { value } = props;
  return <div>{value}元</div>;
};

PurchasePrice.displayName = 'PurchasePrice';
