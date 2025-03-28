import React from 'react';
import { createStyles } from '@nocobase/client';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { AppStore } from './store';

const useStyles = createStyles(({ css, responsive }) => {
  return {
    container: css`
      display: flex;
      flex-flow: row wrap;
      padding: 48px 100px;
      gap: 20px 140px;
      ${responsive.sm} {
        padding: 22px;
        gap: 14px;
      }
    `,
    cardInfo: css`
      //
    `,
    cardInfoTitle: css`
      font-family: MiSans;
      font-size: 20px;
      font-weight: 500;
      line-height: 31.68px;
      display: flex;
      align-items: center;
      letter-spacing: 0px;
      font-variation-settings: 'opsz' auto;
      color: #ffffff;
      padding: 0 0 30px 0;
    `,
    cardInfoKV: css`
      display: flex;
      align-items: flex-start;
    `,
    cardInfoKVLabel: css`
      font-family: MiSans;
      font-size: 14px;
      font-weight: normal;
      line-height: 18.48px;
      display: flex;
      align-items: center;
      letter-spacing: 0px;
      color: #d9d9d9;
      margin: 0;
      padding: 0 0 20px 0;
    `,
    cardInfoKVLabelColon: css`
      &::after {
        content: ':';
        display: block;
        margin-right: 10px;
      }
    `,
    cardInfoKVValue: css`
      font-family: MiSans;
      font-size: 14px;
      font-weight: normal;
      line-height: 18.48px;
      display: flex;
      align-items: center;
      letter-spacing: 0px;
      color: #d9d9d9;
      margin: 0;
      padding: 0 0 20px 0;
    `,
    cardInfoPlaceholder: css`
      flex: 1;
    `,
    QRCodeContainer: css`
      display: flex;
      flex-flow: column;
      align-items: center;
    `,
    QRCode: css`
      width: 178px;
      height: 178px;
    `,
    QRCodeDes: css`
      font-family: MiSans;
      font-size: 14px;
      font-weight: normal;
      line-height: 24.31px;
      text-align: center;
      display: flex;
      align-items: center;
      letter-spacing: 0px;
      color: #c9c9c9;
      margin-top: 20px;
    `,
  };
});

export interface IFooterInfoProps {
  store: AppStore;
}

const FooterInfo: React.FC<IFooterInfoProps> = observer((props) => {
  const { store } = props;
  const { styles } = useStyles();
  return (
    <div className={styles.container}>
      <div className={styles.cardInfo}>
        <h4 className={styles.cardInfoTitle}>解决方案</h4>
        <div className={styles.cardInfoKV}>
          <div className={styles.cardInfoKVLabel}>账号运营</div>
        </div>
        <div className={styles.cardInfoKV}>
          <div className={styles.cardInfoKVLabel}>平台排行榜</div>
        </div>
        <div className={styles.cardInfoKV}>
          <div className={styles.cardInfoKVLabel}>小店数据分析</div>
        </div>
        {/* <div className={styles.cardInfoKV}>
          <div className={styles.cardInfoKVLabel}>开店管理</div>
        </div>
        <div className={styles.cardInfoKV}>
          <div className={styles.cardInfoKVLabel}>门店巡检</div>
        </div>
        <div className={styles.cardInfoKV}>
          <div className={styles.cardInfoKVLabel}>收入与供应商对账</div>
        </div>
        <div className={styles.cardInfoKV}>
          <div className={styles.cardInfoKVLabel}>数据中台</div>
        </div> */}
      </div>
      <div className={styles.cardInfo}>
        <h4 className={styles.cardInfoTitle}>联系我们</h4>

        <div className={styles.cardInfoKV}>
          <div className={classnames(styles.cardInfoKVLabel, styles.cardInfoKVLabelColon)}>咨询电话</div>
          <div className={styles.cardInfoKVValue}>{store.hotline}</div>
        </div>
        <div className={styles.cardInfoKV}>
          <div className={classnames(styles.cardInfoKVLabel, styles.cardInfoKVLabelColon)}>工作时间</div>
          <div className={styles.cardInfoKVValue}>09:00 - 18:00</div>
        </div>
        {/* <div className={styles.cardInfoKV}>
          <div className={classnames(styles.cardInfoKVLabel, styles.cardInfoKVLabelColon)}>总部地址</div>
          <div className={styles.cardInfoKVValue}>
            <div>上海市杨浦区政立路489号</div>
            <div>国正中心2号楼18楼</div>
          </div>
        </div> */}
      </div>
      <div className={styles.cardInfoPlaceholder}></div>
      <div className={styles.QRCodeContainer}>
        {store.wechatServieQRCode && <img className={styles.QRCode} src={store.wechatServieQRCode} />}
        <p className={styles.QRCodeDes}>扫码获取专属服务</p>
      </div>
    </div>
  );
});

FooterInfo.displayName = 'FooterInfo';

export default FooterInfo;
