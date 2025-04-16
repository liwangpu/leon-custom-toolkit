import React, { useContext, useEffect, useState } from 'react';
import { createStyles, useAPIClient } from '@nocobase/client';
import { Button, Form, Input, InputNumber, Modal, notification } from 'antd';
import { useEvent } from '../../hooks';
import { AppStoreContext } from '../store';
import queryString from 'query-string';
import { isNil, round } from 'lodash';
import { IPackage } from '../../../interface';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';

const useStyles = createStyles(({ css, token }) => {
  return {
    formContainer: css`
      padding: 28px;
    `,
    fullWidth: css`
      width: 100%;
    `,
    noErrorFit: css`
      margin-bottom: 0 !important;
    `,
    operatorContainer: css`
      width: 100%;
    `,
    modalPurchasePrice: css`
      text-align: right;
      font-size: 16px;
      font-weight: 600;
      padding: 0 14px;
      color: ${token.colorPrimary};
    `,
    subAccountAveragePrice: css`
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 12px;
    `,
    confirmContainer: css`
      //
    `,
    reduceAccountTip: css`
      text-align: right;
      font-size: 13px;
      color: ${token.colorWarning};
    `,
  };
});

export const usePurchaseForm = (props: { purchaseMethod: any; packageType: string }) => {
  const { purchaseMethod, packageType } = props;
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [showModa, setShowModa] = useState<boolean>(false);
  const [isReduceSubAccount, setIsReduceSubAccount] = useState<boolean>(false);
  const [purchasePriceValue, setPurchasePriceValue] = useState<number>(0);
  const [subAccountAveragePrice, setSubAccountAveragePrice] = useState<number>(0);
  const apiClient = useAPIClient();
  const store = useContext(AppStoreContext);
  const purchaseDurationUnit = purchaseMethod === 'annual' ? '年' : '月';
  const organizationId = store.organizationId;
  const purchasedPackage = store.purchasedPackage;

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
        data: { price = 0 },
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
      const _subAccountAveragePrice = round(
        price / duration / (subAccount + 1) / (purchaseMethod === 'annual' ? 12 : 1),
        1,
      );
      setSubAccountAveragePrice(_subAccountAveragePrice);
    })();
  }, [apiClient, purchaseMethod, duration, subAccount, packageId]);

  useEffect(() => {
    if (isNil(packageId) || isNil(subAccount)) return;
    const pck = store.purchasedPackage.get(packageId) || store.purchasedPackage.get(`${packageId}`);
    if (isNil(pck)) return;
    setIsReduceSubAccount(pck.subAccount > subAccount);
  }, [packageId, store.purchasedPackage, subAccount]);

  const handleCancel = useEvent(() => {
    setShowModa(false);
    form.resetFields();
  });

  const handlePurchaseClick = useEvent((pck: IPackage) => {
    if (pck.packageUidType === '试用') {
      handlePurchase({
        packageType,
        packageId: pck.id,
        duration: 0,
        purchaseMonths: 0,
        subAccount: 0,
        expirationDate: dayjs().add(3, 'd').format('YYYY-MM-DD HH:mm:ss'),
        durationUnit: 'annual',
      });
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

  const toggleModa = (show: boolean) => {
    setShowModa(show);
  };

  const handlePurchase = useEvent(async (values: any) => {
    if (isNil(organizationId)) {
      notification.open({
        message: '温馨提示',
        // duration: 0,
        description: `请先登录后再购买!`,
      });
      return;
    }

    const { duration, durationUnit } = values;
    const purchaseMonths = durationUnit === 'annual' ? duration * 12 : duration;
    // const baseUrl = `${window.location.origin}/api/payment:makePackagePayment`;
    const baseUrl = `/api/payment:makePackagePayment`;
    const url = queryString.stringifyUrl({
      url: baseUrl,
      query: {
        ...values,
        purchaseMonths,
        organizationId,
      },
    });

    // window.open(url, '_blank');
    window.open(url, '_self');
    // navigate(url);
    setShowModa(false);
  });

  const renderPackagePurchaseForm = () => {
    return (
      <div className={styles.formContainer}>
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

          {isReduceSubAccount && (
            <Form.Item<any> noStyle>
              <div className={styles.reduceAccountTip}>降低子账号配置后，系统会初始化角色信息，管理员需要重新分配</div>
            </Form.Item>
          )}

          <Form.Item<any> className={styles.noErrorFit} label="费用" name="price">
            <div className={styles.modalPurchasePrice}>¥{purchasePriceValue}</div>
          </Form.Item>

          <Form.Item<any> noStyle>
            <div className={styles.subAccountAveragePrice}>
              <span>仅 </span>
              <span>¥ {subAccountAveragePrice} 每账号/月</span>
            </div>
          </Form.Item>

          <div className={styles.operatorContainer}>
            <Button type="primary" size="large" block htmlType="submit">
              付款
            </Button>
          </div>
        </Form>
      </div>
    );
  };

  const contextHolder = () => (
    <>
      <Modal
        title="购买信息"
        open={showModa}
        centered={true}
        width={500}
        footer={null}
        keyboard={false}
        maskClosable={false}
        onCancel={handleCancel}
      >
        {renderPackagePurchaseForm()}
      </Modal>
    </>
  );

  return {
    contextHolder,
    toggleModa,
    handlePurchaseClick,
  };
};
