import React from 'react';
import { observer } from 'mobx-react-lite';
import { createStyles } from '@nocobase/client';
import classnames from 'classnames';
import bg10046 from '../assets/images/10046.png';
import ImgWinWin from '../assets/images/win-win.png';
import { AppStore } from './store';
import { useEvent } from '../hooks';

const useStyles = createStyles(({ css }) => {
  return {
    container: css`
      display: flex;
      flex-flow: column;
      align-items: center;
    `,
    infoSection: css`
      display: flex;
      width: 1360px;
      padding: 50px 0;
      font-size: 16px;
      color: #fff;
    `,
    infoSectionPart: css`
      flex: 1;
      min-height: 596px;
    `,
    infoSectionDes: css`
      display: flex;
      flex-flow: column;
      /* justify-content: center; */
      padding: 12px;
      gap: 30px 0;
    `,
    infoSectionImgContainer: css`
      position: relative;
      display: flex;
    `,
    infoSectionDesTitle: css`
      font-size: 30px;
      font-weight: 400;
      padding: 0;
      margin: 0;
    `,
    infoSectionDesSubTitle: css`
      font-size: 18px;
      font-weight: 400;
      padding: 0;
      margin: 0;
    `,
    infoSectionImg: css`
      position: absolute;
      top: -200px;
      left: -360px;
      width: 1000px;
      height: 1000px;
    `,
    infoSectionDesExp: css`
      width: 560px;
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
    `,
    imgWin: css`
      width: 24px;
      height: 24px;
      margin-right: 8px;
    `,
  };
});

export interface IIntroducePageProps {
  store: AppStore;
}

const IntroducePage: React.FC<IIntroducePageProps> = observer((props) => {
  const { store } = props;
  const { styles } = useStyles();

  const handleFreeTrial = useEvent(() => {
    store.toggleTrialModa(true);
  });

  return (
    <div className={styles.container}>
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
          <img className={styles.infoSectionImg} src={bg10046} />
        </div>
      </div>
    </div>
  );
});

IntroducePage.displayName = 'IntroducePage';

export default IntroducePage;
