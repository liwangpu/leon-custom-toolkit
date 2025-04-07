import React, { useContext } from 'react';
import { createStyles, useResponsive } from 'antd-style';
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
    part: css`
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
    infoSection: css`
      display: flex;
      flex-flow: column;
      padding: 12px;
      gap: 30px 0;
      z-index: 10;
      ${responsive.sm} {
        gap: 10px 0;
      }
    `,
    infoSectionImgContainer: css`
      position: relative;
      display: flex;
    `,
    infoSectionDesTitle: css`
      font-size: 50px;
      font-weight: 550;
      padding: 0;
      margin: 0;
      ${responsive.sm} {
        font-size: ${FirstLevelTitleFontSize_SM};
        font-weight: ${FirstLevelTitleFontWeight_SM};
      }
    `,
    infoSectionDes: css`
      font-size: 19px;
      /* font-weight: 550; */
      ${responsive.sm} {
        font-size: ${FirstLevelTitleFontSize_SM};
        font-weight: ${FirstLevelTitleFontWeight_SM};
      }
    `,
    infoSectionDesSubTitle: css`
      font-size: 25px;
      font-weight: 650;
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
      ${responsive.sm} {
        width: 300px;
        width: 400px;
      }
    `,
    infoSectionDesExp: css`
      width: 100%;
      font-size: 19px;
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
  const { lg } = useResponsive();

  const handleFreeTrial = useEvent(() => {
    store.toggleTrialModa(true);
  });

  return (
    <WideScreenContainer>
      <div className={styles.part}>
        <div className={classnames(styles.infoSectionPart, styles.infoSection)}>
          <div className={styles.infoSectionDesTitle}>利用 TikPulse 智能解锁 TikTok 运营新境界</div>
          <div className={styles.infoSectionDes}>
            TikPulse是一款为商家，个人创作者和代理商打造的一站式TikTok运营工具。通过多账号管理、自动化运营、数据收集分析、选品⽀持、达⼈匹配和直播优化于⼀体，帮助⽤⼾突破运营瓶颈，实现快速变现。⽆论您是企业还是个⼈创业者，TikPulse
            都能为您提供⾼性价⽐、⾼安全性的全链路⽀持，助⼒在TikTok平台脱颖⽽出。
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
              <div>击破封号壁垒</div>
              <div>定向引流吸粉</div>
              <div>智能洞察市场</div>
            </div>
          </div>
        </div>
        <div className={classnames(styles.infoSectionPart, styles.infoSectionImgContainer)}>
          <img className={styles.infoSectionImgBg} src={bg10046} />
          <img className={styles.infoSectionImg} src={bg1234} />
          {/* <Image width={lg ? 656 : 300} height={lg ? 595 : 400} src={bg1234} /> */}
        </div>
      </div>
    </WideScreenContainer>
  );
});

Part1.displayName = 'Part1';

export default Part1;
