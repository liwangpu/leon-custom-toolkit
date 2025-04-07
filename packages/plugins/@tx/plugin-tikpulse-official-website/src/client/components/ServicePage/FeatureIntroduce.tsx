import React, { useEffect, useState } from 'react';
import { createStyles } from '@nocobase/client';
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
import classNames from 'classnames';
import { CheckOutlined } from '@ant-design/icons';
import { isArray } from 'lodash';
import { useEvent } from '../../hooks';

const useStyles = createStyles(({ css, responsive }) => {
  return {
    introduce: css`
      display: flex;
      flex-flow: row wrap;
      justify-content: space-between;
      width: 100%;
      gap: 14px 140px;
      z-index: 2;
    `,
    navPart: css`
      flex: 1;
      display: flex;
      flex-flow: column;
      gap: 16px 0;
    `,
    imagePart: css`
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      min-width: 600px;
      min-height: 600px;
      background-color: rgb(152, 229, 142);
      border-radius: 16px;
      overflow: hidden;
      ${responsive.sm} {
        width: 300px;
        height: 300px;
        min-width: 300px !important;
        min-height: 300px !important;
        padding: 8px;
      }
    `,
    image: css`
      ${responsive.sm} {
        width: 240px;
        height: 240px;
      }
    `,
    title: css`
      font-size: ${FirstLevelTitleFontSize};
      font-weight: ${FirstLevelTitleFontWeight};
      ${responsive.sm} {
        font-size: ${FirstLevelTitleFontSize_SM};
        font-weight: ${FirstLevelTitleFontWeight_SM};
      }
    `,
    description: css`
      font-size: 18px;
    `,
    featureContainer: css`
      display: flex;
      flex-flow: column;
      gap: 10px 0;
    `,
    feature: css`
      /* border: 2px solid transparent; */
      padding: 16px;
      border-radius: 8px;
      cursor: pointer;
      /* color: #515e5f; */
      border-color: black;
      &:hover {
        /* border-color: #515e5f; */
      }
      /* &.actived {
        color: black;
        border-color: black;
      } */
    `,
    featureTitle: css`
      font-size: ${SecondLevelTitleFontSize};
      font-weight: ${SecondLevelTitleFontWeight};
      ${responsive.sm} {
        font-size: ${SecondLevelTitleFontSize_SM};
        font-weight: ${SecondLevelTitleFontWeight_SM};
      }
    `,
    titleIcon: css`
      margin-right: 8px;
    `,
    featureDescription: css`
      font-size: 16px;
      padding-left: 26px;
    `,
  };
});

interface IFeatureIntroduce {
  title: string;
  description?: string;
  image?: any;
}

export interface IFeatureIntroduceProps {
  title: string;
  description?: string;
  features: Array<IFeatureIntroduce>;
  /**
   * 正常情况,是左边导航,右边图片,如果使用反向,那么这两个反过来
   */
  reverse?: boolean;
}

const FeatureIntroduce: React.FC<IFeatureIntroduceProps> = observer((props) => {
  const { title, description, features, reverse } = props;
  const { styles } = useStyles();
  const [activedFeature, setActivedFeature] = useState<IFeatureIntroduce>();

  useEffect(() => {
    if (!isArray(features) || !features.length) return;
    setActivedFeature(features[0]);
  }, [features]);

  const handleActiveFeature = useEvent((featureTitle: string) => {
    // setActivedFeature(features.find((f) => f.title === featureTitle));
  });

  const renderNavs = () => {
    if (!isArray(features) || !features.length || !activedFeature) return;
    return (
      <div className={styles.navPart}>
        <div className={styles.title}>{title}</div>
        {description ? <div className={styles.description}>{description}</div> : null}
        <div className={styles.featureContainer}>
          {features.map((f) => (
            <div
              className={classNames(styles.feature, {
                actived: f.title === activedFeature.title,
              })}
              key={f.title}
              onClick={() => handleActiveFeature(f.title)}
            >
              <div className={styles.featureTitle}>
                <CheckOutlined className={styles.titleIcon} />
                <span>{f.title}</span>
              </div>
              <div className={styles.featureDescription}>{f.description}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderImage = () => {
    return (
      <div className={styles.imagePart}>
        {activedFeature && activedFeature.image ? <img src={activedFeature.image} className={styles.image} /> : null}
      </div>
    );
  };

  return (
    <div className={styles.introduce}>
      {reverse ? (
        <>
          {renderImage()}
          {renderNavs()}
        </>
      ) : (
        <>
          {renderNavs()}
          {renderImage()}
        </>
      )}
    </div>
  );
});

FeatureIntroduce.displayName = 'FeatureIntroduce';

export default FeatureIntroduce;

export const FeatureIntroduceCB: React.FC<{ items: IFeatureIntroduceProps[] }> = observer((props) => {
  const { items } = props;
  const { styles } = useStyles();

  const renderNavs = (item: IFeatureIntroduceProps) => {
    const { title, description, features, reverse } = item;
    if (!isArray(features) || !features.length) return;
    return (
      <div className={styles.navPart}>
        <div className={styles.title}>{title}</div>
        {description ? <div className={styles.description}>{description}</div> : null}
        <div className={styles.featureContainer}>
          {features.map((f) => (
            <div className={classNames(styles.feature, {})} key={f.title}>
              <div className={styles.featureTitle}>
                <CheckOutlined className={styles.titleIcon} />
                <span>{f.title}</span>
              </div>
              <div className={styles.featureDescription}>{f.description}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return <div className={styles.introduce}>{items.map((it) => renderNavs(it))}</div>;
});

FeatureIntroduceCB.displayName = 'FeatureIntroduceCB';
