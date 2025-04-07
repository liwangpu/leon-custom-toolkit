import React, { useContext, useState } from 'react';
import { createStyles } from '@nocobase/client';
import { observer } from 'mobx-react-lite';
import PackageList from '../PackageList';
import { useEvent } from '../../hooks';
import { isNil } from 'lodash';
import classNames from 'classnames';
import ImgContent from '../../assets/images/10003.png';
import { AppStoreContext } from '../store';

const useStyles = createStyles(({ css, responsive }) => {
  return {
    container: css`
      position: relative;
      display: flex;
      flex-flow: column;
      /* gap: 80px 0; */
      width: 100%;
      overflow: hidden;
    `,
    header: css`
      height: 62px;
      border-bottom: 3px solid #002b20;
      z-index: 1;
      background-color: black;
    `,
    content: css`
      position: relative;
      padding: 20px 30px 50px;
      z-index: 1;
    `,
    footer: css`
      height: 62px;
      border-top: 3px solid #002b20;
      background-color: black;
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
      bottom: -300px;
      left: 0;
      width: 1600px;
      height: 800px;
    `,
    navContainer: css`
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    `,
    nav: css`
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 18px;
      font-weight: 600;
      padding: 0 24px;
      height: 100%;
      cursor: pointer;

      &.actived {
        &::after {
          background-color: #98e58e;
        }
      }

      &::after {
        content: '';
        position: absolute;
        bottom: -3px;
        left: 0;
        width: 100%;
        height: 3px;
        background-color: transparent;
      }
    `,
  };
});

const Part1: React.FC = observer((props) => {
  const { styles } = useStyles();
  const [activedItem, setActivedItem] = useState<ITabItem>(tabs[0]);
  const store = useContext(AppStoreContext);
  const packages = store.packages || [];
  const services = store.services || [];
  const packageType = activedItem.name === '套餐' ? 'package' : 'service';

  const handleActiveTab = useEvent((item: ITabItem) => {
    setActivedItem(item);
  });

  const renderNavs = () => {
    return (
      <div className={styles.navContainer}>
        {tabs.map((t) => (
          <div
            className={classNames(styles.nav, {
              actived: activedItem?.name === t.name,
            })}
            key={t.name}
            onClick={() => handleActiveTab(t)}
          >
            {t.name}
          </div>
        ))}
      </div>
    );
  };

  const renderTab = () => {
    if (isNil(activedItem)) return;
    const ds = packageType === 'package' ? packages : services;
    return <PackageList packages={ds} key={activedItem.name} packageType={packageType} />;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>{renderNavs()}</div>
      <div className={styles.content}>{renderTab()}</div>
      <div className={styles.footer}></div>
      <img className={styles.contentImgBg1} src={ImgContent} />
      {/* <img className={styles.contentImgBg2} src={ImgContent} /> */}
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
