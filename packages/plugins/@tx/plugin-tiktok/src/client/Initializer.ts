import { SchemaInitializerItemType, useSchemaInitializer } from '@nocobase/client';
import { useT } from './locale';
import { PaymentNameLowercase } from './consts';
import { PaymentSchema } from './schemas';

export const PaymentInitializerItem: SchemaInitializerItemType = {
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
