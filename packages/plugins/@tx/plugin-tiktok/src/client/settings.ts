import { SchemaSettings, SchemaSettingsBlockHeightItem } from '@nocobase/client';
import { PaymentNameLowercase } from './consts';

export const PaymentSettings = new SchemaSettings({
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
