import React, { useContext, useState } from 'react';
import { createStyles } from '@nocobase/client';
import { observer } from 'mobx-react-lite';
import ImgContent from '../../assets/images/10003.png';
import { AppStoreContext } from '../store';
import { PublicPackagePurchase } from '../PackagePurchase';

const useStyles = createStyles(({ css, responsive }) => {
  return {
    container: css`
      position: relative;
      display: flex;
      flex-flow: column;
      width: 100%;
      overflow: hidden;
      color: #fff;
    `,
    contentImgBg1: css`
      position: absolute;
      top: 0;
      left: 0;
      width: 1600px;
      height: 800px;
    `,
    contentImgBg2: css`
      position: absolute;
      bottom: -16px;
      left: 0;
      width: 1600px;
      height: 800px;
      transform: rotate(180deg);
    `,
  };
});

const Part1: React.FC = observer((props) => {
  const { styles } = useStyles();
  const [activedItem, setActivedItem] = useState<ITabItem>(tabs[0]);
  const store = useContext(AppStoreContext);

  return (
    <div className={styles.container}>
      <PublicPackagePurchase noFooterBorder={true} />
      <img className={styles.contentImgBg1} src={ImgContent} />
      <img className={styles.contentImgBg2} src={ImgContent} />
    </div>
  );
});

Part1.displayName = 'Part1';

export default Part1;

interface ITabItem {
  name: string;
}

export const tabs: ITabItem[] = [
  {
    name: '套餐',
  },
  {
    name: '服务',
  },
];
