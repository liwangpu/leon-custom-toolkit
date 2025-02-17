import React from 'react';
import { observer } from 'mobx-react-lite';
import { createStyles, withDynamicSchemaProps } from '@nocobase/client';
import { PaymentName } from '../consts';

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

export const Payment: React.FC<any> = withDynamicSchemaProps(
  observer((props) => {
    const { styles } = useStyles();
    return <div className={styles.page}>付款二维码</div>;
  }),
  { displayName: PaymentName },
);
