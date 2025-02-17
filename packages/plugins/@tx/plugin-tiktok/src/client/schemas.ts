import { ISchema } from '@nocobase/client';
import { PaymentName, PaymentNameLowercase } from './consts';

export const PaymentSchema: ISchema = {
  type: 'void',
  'x-decorator': 'BlockItem',
  'x-component': PaymentName,
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
