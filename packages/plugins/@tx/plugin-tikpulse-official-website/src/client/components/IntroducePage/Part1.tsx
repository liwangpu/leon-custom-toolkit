import React, { useContext } from 'react';
import { createStyles } from '@nocobase/client';
import classnames from 'classnames';
import bg10046 from '../../assets/images/10046.png';
import bg1234 from '../../assets/images/1234.png';
import ImgWinWin from '../../assets/images/win-win.png';
import { AppStoreContext } from '../store';
import { useEvent } from '../../hooks';
import WideScreenContainer from '../WideScreenContainer';
import { observer } from 'mobx-react-lite';
import {
  FirstLevelTitleFontSize,
  FirstLevelTitleFontSize_SM,
  FirstLevelTitleFontWeight,
  FirstLevelTitleFontWeight_SM,
  SecondLevelTitleFontSize,
  SecondLevelTitleFontSize_SM,
  SecondLevelTitleFontWeight,
  SecondLevelTitleFontWeight_SM,
} from '../common';

const useStyles = createStyles(({ css, responsive }) => {
  return {
    infoSection: css`
      display: flex;
      flex-flow: row wrap;
      font-size: 16px;
      color: #fff;
      ${responsive.sm} {
        font-size: 14px;
      }
    `,
    infoSectionPart: css`
      width: 566px;
    `,
    infoSectionDes: css`
      display: flex;
      flex-flow: column;
      padding: 12px;
      gap: 30px 0;
      ${responsive.sm} {
        gap: 10px 0;
      }
    `,
    infoSectionImgContainer: css`
      position: relative;
      display: flex;
    `,
    infoSectionDesTitle: css`
      font-size: ${FirstLevelTitleFontSize};
      font-weight: ${FirstLevelTitleFontWeight};
      padding: 0;
      margin: 0;
      ${responsive.sm} {
        font-size: ${FirstLevelTitleFontSize_SM};
        font-weight: ${FirstLevelTitleFontWeight_SM};
      }
    `,
    infoSectionDesSubTitle: css`
      font-size: ${SecondLevelTitleFontSize};
      font-weight: ${SecondLevelTitleFontWeight};
      padding: 0;
      margin: 0;
      ${responsive.sm} {
        font-size: ${SecondLevelTitleFontSize_SM};
        font-weight: ${SecondLevelTitleFontWeight_SM};
      }
    `,
    infoSectionImgBg: css`
      position: absolute;
      top: -200px;
      left: -360px;
      width: 1000px;
      height: 1000px;
    `,
    infoSectionImg: css`
      width: 656px;
      height: 595px;
      z-index: 1;
    `,
    infoSectionDesExp: css`
      width: 100%;
      font-size: 13px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 8px;
    `,
    trialBtn: css`
      color: #026661;
      background-color: #fff;
      padding: 10px 16px;
      border-radius: 8px;
      border: none;
      ${responsive.sm} {
        font-size: 14px;
        padding: 5px 8px;
      }
    `,
    imgWin: css`
      width: 24px;
      height: 24px;
      margin-right: 8px;
    `,
    imgScroller: css`
      width: 100%;
      max-width: 1360px;
      overflow: hidden;
    `,
  };
});

const Part1: React.FC = observer(() => {
  const store = useContext(AppStoreContext);
  const { styles } = useStyles();

  const handleFreeTrial = useEvent(() => {
    store.toggleTrialModa(true);
  });

  return (
    <WideScreenContainer>
      <div className={styles.infoSection}>
        <div className={classnames(styles.infoSectionPart, styles.infoSectionDes)}>
          <h1 className={styles.infoSectionDesTitle}>解锁 TikTok 成功 —— 您的一体化增长解决方</h1>
          <div>
            <div>使用面向创作者和企业的智能工具，自动化、优化您的 TikTok 业务并实现盈利</div>
            <div>自动化运营，智能分析，助你玩转TikTok</div>
            <div>AI驱动增长，安全无忧，TikTok成功触手可及</div>
          </div>
          <div>
            <button className={styles.trialBtn} onClick={handleFreeTrial}>
              {`免费试用${store.trialDays}天`}
            </button>
          </div>
          <div className={styles.infoSectionDesSubTitle}>
            <img className={styles.imgWin} src={ImgWinWin} />
            选择TikPulse，开启TikTok流量与收益的双赢
          </div>
          <div>
            <div className={styles.infoSectionDesExp}>
              <div>独家数据看板</div>
              <div>击破封号壁垒，TikPulse护航你的TikTok征途</div>
              <div>定向引流，铸就你的TikTok影响力王国</div>
              <div>智能洞察市场，爆款选品尽在TikPulse</div>
            </div>
          </div>
        </div>
        <div className={classnames(styles.infoSectionPart, styles.infoSectionImgContainer)}>
          <img className={styles.infoSectionImgBg} src={bg10046} />
          <img className={styles.infoSectionImg} src={bg1234} />
        </div>
      </div>
    </WideScreenContainer>
  );
});

Part1.displayName = 'Part1';

export default Part1;
