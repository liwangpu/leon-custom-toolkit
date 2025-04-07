import React, { useContext } from 'react';
import { createStyles } from '@nocobase/client';
import WideScreenContainer from '../WideScreenContainer';
import { observer } from 'mobx-react-lite';
import {
  CommonPageContentHorizontalPadding_SM,
  FirstLevelTitleFontSize,
  FirstLevelTitleFontSize_SM,
  FirstLevelTitleFontWeight,
  FirstLevelTitleFontWeight_SM,
  SecondLevelTitleFontSize,
  SecondLevelTitleFontSize_SM,
  SecondLevelTitleFontWeight,
  SecondLevelTitleFontWeight_SM,
} from '../common';
import { useEvent } from '../../hooks';
import Img10006 from '../../assets/images/10006.png';
import { AppStoreContext } from '../store';

const useStyles = createStyles(({ css, responsive }) => {
  return {
    partContainer: css`
      width: 100%;
      color: black;
      /* ${responsive.sm} {
        padding: 20px ${CommonPageContentHorizontalPadding_SM};
      } */
    `,
    intro: css`
      display: flex;
      flex-flow: row wrap;
      gap: 0 40px;
    `,
    introLeft: css`
      flex: 1;
      display: flex;
      flex-flow: column;
      align-items: flex-start;
      min-width: 320px;
      border: 2px solid rgb(4, 4, 4);
      border-radius: 32px;
      padding: 48px 32px;
      gap: 30px 0;
      background-color: #fff;
    `,
    introRight: css`
      position: relative;
      z-index: 1;
    `,
    introImg: css`
      position: static;
      width: 600px;
      height: 658px;
      z-index: 2;
    `,
    tip: css`
      display: inline-block;
      font-size: 14px;
      border: 2px solid rgb(4, 4, 4);
      border-radius: 12px;
      padding: 3px 12px;
    `,
    introTitle: css`
      font-size: ${FirstLevelTitleFontSize};
      font-weight: ${FirstLevelTitleFontWeight};
      ${responsive.sm} {
        font-size: ${FirstLevelTitleFontSize_SM};
        font-weight: ${FirstLevelTitleFontWeight_SM};
      }
    `,
    introSubTitle: css`
      font-size: ${SecondLevelTitleFontSize};
      /* font-weight: ${SecondLevelTitleFontWeight}; */
      ${responsive.sm} {
        font-size: ${SecondLevelTitleFontSize_SM};
        /* font-weight: ${SecondLevelTitleFontWeight_SM}; */
      }
    `,
    contactUsBtn: css`
      color: #026661;
      background-color: rgb(2, 102, 97);
      color: #fff;
      padding: 10px 24px;
      border-radius: 8px;
      border: none;
      ${responsive.sm} {
        font-size: 14px;
        padding: 5px 8px;
      }
    `,
  };
});

const Part1: React.FC = observer((props) => {
  const { styles } = useStyles();
  const store = useContext(AppStoreContext);
  const handleContactUs = useEvent(() => {
    store.requestDemoHandler();
  });
  return (
    <WideScreenContainer>
      <div className={styles.partContainer}>
        <div className={styles.intro}>
          <div className={styles.introLeft}>
            <div className={styles.tip}>客户服务</div>
            <div className={styles.introTitle}>为客户提供个性化服务</div>
            <div className={styles.introSubTitle}>
              欢迎您来到客户服务中心！ 我们始终以高效、专业、个性化的服务为宗旨，
              无论您需要产品咨询、预约演示还是使用指导， 我们都为您准备了全方位服务渠道， 确保您的需求得到及时响应。
            </div>
            <div>
              <button className={styles.contactUsBtn} onClick={handleContactUs}>
                咨询我们
              </button>
            </div>
          </div>
          <div className={styles.introRight}>
            <img className={styles.introImg} src={Img10006} />
          </div>
        </div>
      </div>
    </WideScreenContainer>
  );
});

Part1.displayName = 'Part1';

export default Part1;
