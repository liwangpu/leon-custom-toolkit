import React from 'react';
import { observer } from 'mobx-react-lite';
import { createStyles } from '@nocobase/client';
import ImgLogo from '../assets/images/logo-s.png';

export interface ICommonModalLayoutProps {
  title: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const useStyles = createStyles(({ css }) => {
  return {
    modal: css`
      background-color: #fff;
      box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3);
      border-radius: 10px;
      overflow: hidden;
    `,
    modalHeader: css`
      position: relative;
      display: flex;
      flex-flow: column;
      justify-content: center;
      align-items: center;
      padding: 20px 0 20px;
      user-select: none;
      background: linear-gradient(180deg, #a7dac5 0%, rgba(255, 255, 255, 0.0001) 100%);
    `,
    modalContent: css`
      display: flex;
      flex-flow: column;
      justify-content: center;
      padding: 0 50px 0;
    `,
    modalFooter: css`
      padding: 0px 24px 34px;
    `,
    logo: css`
      display: flex;
      align-items: center;
      gap: 0 8px;
      font-size: 22px;
      font-weight: 700;
    `,
    logoImg: css`
      width: 24px;
      height: 24px;
    `,
    title: css`
      position: relative;
      display: flex;
      flex-flow: row;
      justify-content: center;
      align-items: center;
      width: 100%;
      margin-top: 13px;
      font-family: MiSans;
      font-size: 24px;
      font-weight: 500;
      line-height: 35.1px;
      text-align: center;
      letter-spacing: 0px;
      color: #101214;
      padding: 0 30px;

      & > span {
        display: block;
        padding: 0 18px;
      }

      &::before {
        content: '';
        display: block;
        flex: 1;
        height: 1px;
        opacity: 1;
        background-color: #dde0e6;
      }

      &::after {
        content: '';
        display: block;
        flex: 1;
        height: 1px;
        opacity: 1;
        background-color: #dde0e6;
      }
    `,
  };
});

const CommonModalLayout: React.FC<ICommonModalLayoutProps> = observer((props) => {
  const { title, children, footer } = props;
  const { styles } = useStyles();

  return (
    <div className={styles.modal}>
      <div className={styles.modalHeader}>
        <div className={styles.logo}>
          <img className={styles.logoImg} src={ImgLogo} />
          <div>TIKPULSE</div>
        </div>
        <div className={styles.title}>
          <span>{title}</span>
        </div>
      </div>
      {children && <div className={styles.modalContent}>{children}</div>}
      {footer && <div className={styles.modalFooter}>{footer}</div>}
    </div>
  );
});

CommonModalLayout.displayName = 'CommonModalLayout';

export default CommonModalLayout;
