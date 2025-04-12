import React, { useContext } from 'react';
import { createStyles } from '@nocobase/client';
import WideScreenContainer from '../WideScreenContainer';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
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
import { Tooltip } from 'antd';

const useStyles = createStyles(({ css, responsive, token }) => {
  return {
    partContainer: css`
      width: 100%;
      color: black;
      z-index: 9;
    `,
    intro: css`
      display: flex;
      flex-flow: row wrap;
      justify-content: space-around;
      gap: 0 40px;
    `,
    introLeft: css`
      flex: 0 0 44%;
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
      width: 400px;
      height: 458px;
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
    downloadOperators: css`
      display: flex;
      align-items: center;
      gap: 10px 20px;
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

      &.disabled {
        background-color: gray !important;
        cursor: not-allowed;
      }
    `,
    windowsIcon: css`
      width: 22px;
      height: 22px;
    `,
    macIcon: css`
      width: 28px;
      height: 28px;
    `,
  };
});

// 下载链接
// https://releaser.tikpulse.net/download/latest/windows_64

const Part1: React.FC = observer((props) => {
  const { styles } = useStyles();
  const store = useContext(AppStoreContext);
  const handleDownloadWindows = useEvent(() => {
    window.open('https://releaser.tikpulse.net/download/latest/windows_64', '_blank');
  });
  return (
    <WideScreenContainer>
      <div className={styles.partContainer}>
        <div className={styles.intro}>
          <div className={styles.introLeft}>
            {/* <div className={styles.tip}>客户服务</div> */}
            <div className={styles.introTitle}>TIKPULSE 客户端下载</div>
            <div className={styles.introSubTitle}>
              多账号管理，安全智能系统，为每个账号构建独立运行空间，已守护超千万跨境账号安全
            </div>
            <div className={styles.downloadOperators}>
              <Tooltip title="点击下载" placement="bottom">
                <button className={styles.downloadBtn} onClick={handleDownloadWindows}>
                  <img className={styles.windowsIcon} src={ImgWindows} />
                  <div>Windows</div>
                </button>
              </Tooltip>

              <Tooltip title="敬请期待" placement="bottom">
                <button className={classnames(styles.downloadBtn, 'disabled')}>
                  <img className={styles.macIcon} src={ImgMacOS} />
                  <div>MacOS</div>
                </button>
              </Tooltip>
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
