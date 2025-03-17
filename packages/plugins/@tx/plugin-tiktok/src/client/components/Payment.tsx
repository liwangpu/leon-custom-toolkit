import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  createStyles,
  SchemaInitializerItemType,
  useSchemaInitializer,
  withDynamicSchemaProps,
} from '@nocobase/client';
import { ISchema } from '@formily/react';
import { SchemaSettings, Plugin } from '@nocobase/client';
import { useT } from '../locale';

const PaymentName = 'Payment';
const PaymentNameLowercase = PaymentName.toLowerCase();

export const registerPaymentComponent = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.addComponents({ Payment });
  app.schemaSettingsManager.add(PaymentSettings);
  app.schemaInitializerManager.addItem(
    'popup:addNew:addBlock',
    `otherBlocks.${PaymentInitializerItem.name}`,
    PaymentInitializerItem,
  );
  app.schemaInitializerManager.addItem(
    'page:addBlock',
    `otherBlocks.${PaymentInitializerItem.name}`,
    PaymentInitializerItem,
  );

  app.router.add('payment', {
    path: 'payment',
    Component: Payment,
  });
};

const PaymentSettings = new SchemaSettings({
  name: `blockSettings:${PaymentNameLowercase}`,
  items: [
    {
      type: 'remove',
      name: 'remove',
      componentProps: {
        removeParentsIfNoChildren: true,
        breakRemoveOn: {
          'x-component': 'Grid',
        },
      },
    },
  ],
});

const PaymentSchema: ISchema = {
  type: 'void',
  'x-decorator': 'BlockItem',
  'x-component': PaymentName,
  'x-settings': PaymentSettings.name,
  'x-component-props': {
    style: {
      // width: '100%',
      // height: '100%',
    },
  },
  properties: {
    [PaymentNameLowercase]: {
      'x-component': PaymentName,
    },
  },
};

const PaymentInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: PaymentNameLowercase,
  icon: 'BarcodeOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    const t = useT();
    return {
      // title: t('Payment'),
      title: '付款',
      onClick: () => {
        insert(PaymentSchema);
      },
    };
  },
};

const useStyles = createStyles(({ css }) => {
  return {
    page: css`
      display: flex;
      flex-flow: column;
      align-items: center;
      padding: 100px 0 0 0;
      width: 100%;
      height: 100%;
    `,
  };
});

const Payment: React.FC<any> = withDynamicSchemaProps(
  observer((props) => {
    const { styles } = useStyles();
    return <div className={styles.page}>付款二维码</div>;
  }),
  { displayName: PaymentName },
);
