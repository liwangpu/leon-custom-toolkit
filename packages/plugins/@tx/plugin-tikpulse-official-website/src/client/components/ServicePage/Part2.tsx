import React from 'react';
import { createStyles } from '@nocobase/client';
import WideScreenContainer from '../WideScreenContainer';
import { observer } from 'mobx-react-lite';
import {
  FirstLevelTitleFontSize,
  FirstLevelTitleFontSize_SM,
  FirstLevelTitleFontWeight,
  FirstLevelTitleFontWeight_SM,
} from '../common';

const useStyles = createStyles(({ css, responsive }) => {
  return {
    partContainer: css`
      display: flex;
      flex-flow: column;
      align-items: center;
      gap: 40px 0;
      width: 100%;
      padding: 40px;
      color: black;
      ${responsive.sm} {
        padding: 12px;
      }
    `,
    containerTitle: css`
      font-size: ${FirstLevelTitleFontSize};
      font-weight: ${FirstLevelTitleFontWeight};
      ${responsive.sm} {
        font-size: ${FirstLevelTitleFontSize_SM};
        font-weight: ${FirstLevelTitleFontWeight_SM};
      }
    `,
    card: css`
      width: 92%;
      height: 611px;
      border: 2px solid rgb(4, 4, 4);
      border-radius: 16px;
      ${responsive.sm} {
        width: 100%;
        height: 300px;
      }
    `,
  };
});

const Part2: React.FC = observer((props) => {
  const { styles } = useStyles();
  return (
    <WideScreenContainer>
      <div className={styles.partContainer}>
        <div className={styles.containerTitle}>
          您可通过电话、邮箱、实时客服聊天等多种方式随时联系我们，专业团队承诺在第一时间为您提供解决方案，并通过季度回访持续优化服务体验。
        </div>
        {/* <div className={styles.card}></div> */}
      </div>
    </WideScreenContainer>
  );
});

Part2.displayName = 'Part2';

export default Part2;
