import React from 'react';
import { createStyles } from '@nocobase/client';
import WideScreenContainer from '../WideScreenContainer';
import Img10008 from '../../assets/images/10008.png';
import Img10009 from '../../assets/images/10009.png';
import Img10010 from '../../assets/images/10010.png';
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
    container: css`
      display: flex;
      flex-flow: column;
      gap: 20px 0;
      color: #fff;
      ${responsive.sm} {
        gap: 10px 0;
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
    containerDes: css`
      font-size: 19px;
      ${responsive.sm} {
        font-size: 14px;
      }
    `,
    cardContainer: css`
      display: flex;
      flex-flow: row wrap;
      justify-content: space-between;
      padding-top: 8px;
      gap: 10px 0;
    `,
    card: css`
      display: flex;
      flex-flow: column;
      gap: 16px 0;
      max-width: 416px;
      max-height: 290px;
      border-radius: 16px;
      padding: 32px;
      background-color: #ebf9eb;
      ${responsive.sm} {
        padding: 16px;
        gap: 11px 0;
      }
    `,
    cardTitle: css`
      color: black;
      font-size: 25px;
      font-weight: 700;
      ${responsive.sm} {
        font-size: ${SecondLevelTitleFontSize_SM};
        font-weight: ${SecondLevelTitleFontWeight_SM};
      }
    `,
    cardContent: css`
      color: black;
      font-size: 16px;
    `,
    cardIcon: css`
      width: 40px;
      height: 40px;
      background-color: rgb(89, 203, 89);
      border-radius: 50%;
    `,
  };
});

const Part2: React.FC<{}> = (props) => {
  const { styles } = useStyles();

  return (
    <WideScreenContainer>
      <div className={styles.container}>
        <div className={styles.containerTitle}>TikPulse: TikTok生态的领先者</div>
        <div className={styles.containerDes}>从0到1万粉丝，我们负责责「养」；从1万到100万，您负责「赚」</div>
        <div className={styles.cardContainer}>
          <div className={styles.card}>
            <img className={styles.cardIcon} src={Img10008} />
            <div className={styles.cardTitle}>全球运营 & 安全保障</div>
            <div className={styles.cardContent}>
              与仅提供单一功能的竞品相比，TikPulse覆盖运营全流程，满足用户多样化需求，真正实现一站式服务。
              先进的⻛控系统将封号率降低97%，为⽤⼾提供稳定可靠的运营环境，竞品难以企及。
            </div>
          </div>
          <div className={styles.card}>
            <img className={styles.cardIcon} src={Img10009} />
            <div className={styles.cardTitle}>智能高效 & 成本效益</div>
            <div className={styles.cardContent}>
              ⾃动化操作和AI的功能开发，让粉丝增⻓速度达到⾏业平均⽔平的2倍，30天内即可⻅到显著成效，远超⼿动操作的竞品。
              单设备多账号管理和⾃动化操作将硬件成本降低50%，⼈⼒投⼊⼤幅减少，帮助⽤⼾以更低成本实现更⾼收益
            </div>
          </div>

          <div className={styles.card}>
            <img className={styles.cardIcon} src={Img10010} />
            <div className={styles.cardTitle}>数据优势 & 数据分析</div>
            <div className={styles.cardContent}>
              强大的数据分析能力为选品、达人合作和直播优化提供精准支持，帮助用户做出更优决策，抢占市场先机。
              洞察账号数据与平台趋势，支持导出和可视化分析
            </div>
          </div>
        </div>
      </div>
    </WideScreenContainer>
  );
};

Part2.displayName = 'Part2';

export default Part2;
