import React, { useContext } from 'react';
import { createStyles } from '@nocobase/client';
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
import { useEvent } from '../../hooks';
import Img10007 from '../../assets/images/10007.png';
import ImgWindows from '../../assets/images/windows.png';
import ImgMacOS from '../../assets/images/macOS.png';
import { AppStoreContext } from '../store';

const useStyles = createStyles(({ css, responsive }) => {
  return {
    partContainer: css`
      width: 100%;
      color: black;
      z-index: 9;
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
    downloadBtn: css`
      color: #026661;
      background-color: rgb(2, 102, 97);
      color: #fff;
      /* padding: 10px 24px; */
      display: flex;
      justify-content: center;
      align-items: center;
      width: 140px;
      height: 50px;
      border-radius: 14px;
      border: none;

      &:hover {
        background-color: #15736b;
      }
      & > div {
        font-size: 14px;
        font-weight: 600;
        margin-left: 8px;
      }
    `,
    windowsIcon: css`
      width: 22px;
      height: 22px;
    `,
  };
});

// 下载链接
// https://astrolabe-releaser.taixiang-tech.com/download/latest/windows_64

const Part1: React.FC = observer((props) => {
  const { styles } = useStyles();
  const store = useContext(AppStoreContext);
  const handleDownloadWindows = useEvent(() => {
    window.open('https://astrolabe-releaser.taixiang-tech.com/download/latest/windows_64', '_blank');
  });
  return (
    <WideScreenContainer>
      <div className={styles.partContainer}>
        <div className={styles.intro}>
          <div className={styles.introLeft}>
            {/* <div className={styles.tip}>客户服务</div> */}
            <div className={styles.introTitle}>功能强大的客户端软件</div>
            <div className={styles.introSubTitle}>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias inventore necessitatibus aliquid
              tempore saepe quia aspernatur corporis sed ratione repellat ipsum possimus nemo reiciendis doloribus vitae
              minus sit, temporibus magnam!
            </div>
            <div>
              <button className={styles.downloadBtn} onClick={handleDownloadWindows}>
                <img className={styles.windowsIcon} src={ImgWindows} />
                <div>Windows</div>
              </button>
            </div>
          </div>
          <div className={styles.introRight}>
            <img className={styles.introImg} src={Img10007} />
          </div>
        </div>
      </div>
    </WideScreenContainer>
  );
});

Part1.displayName = 'Part1';

export default Part1;
