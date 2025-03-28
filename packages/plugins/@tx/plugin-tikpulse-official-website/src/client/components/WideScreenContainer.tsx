import React from 'react';
import { createStyles } from '@nocobase/client';
import { CommonPageContentHorizontalPadding, CommonPageContentHorizontalPadding_SM } from './common';

const useStyles = createStyles(({ css, responsive }) => {
  return {
    container: css`
      position: relative;
      width: 100%;
    `,
    contentWrapper: css`
      display: flex;
      flex-flow: column;
      max-width: 1360px;
      position: relative;
      left: 0;
      right: 0;
      margin: auto;
      padding: 0 ${CommonPageContentHorizontalPadding};
      ${responsive.sm} {
        padding: 0 ${CommonPageContentHorizontalPadding_SM};
      }
    `,
  };
});

const WideScreenContainer: React.FC<{ children?: React.ReactNode }> = (props) => {
  const { children } = props;
  const { styles } = useStyles();
  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>{children}</div>
    </div>
  );
};

WideScreenContainer.displayName = 'WideScreenContainer';

export default WideScreenContainer;
