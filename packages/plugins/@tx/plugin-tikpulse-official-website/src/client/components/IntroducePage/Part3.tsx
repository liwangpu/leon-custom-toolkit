import React, { useState } from 'react';
import { createStyles } from '@nocobase/client';
import WideScreenContainer from '../WideScreenContainer';
import { observer } from 'mobx-react-lite';
import {
  CommonPageContentHorizontalPadding,
  CommonPageContentHorizontalPadding_SM,
  FirstLevelTitleFontSize,
  FirstLevelTitleFontSize_SM,
  FirstLevelTitleFontWeight,
  FirstLevelTitleFontWeight_SM,
  PrimaryColor,
  SecondLevelTitleFontSize,
  SecondLevelTitleFontSize_SM,
  SecondLevelTitleFontWeight,
  SecondLevelTitleFontWeight_SM,
} from '../common';
import classNames from 'classnames';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useEvent } from '../../hooks';

const useStyles = createStyles(({ css, responsive }) => {
  return {
    partContainer: css`
      width: 100%;
      background-color: #fff;
      color: black;
      padding: 50px ${CommonPageContentHorizontalPadding};
      ${responsive.sm} {
        padding: 20px ${CommonPageContentHorizontalPadding_SM};
      }
    `,
    tabs: css`
      //
    `,
    tabNavs: css`
      display: flex;
      flex-flow: row wrap;
      gap: 10px 40px;
      padding: 0 18px;
      font-size: ${SecondLevelTitleFontSize};
      /* font-weight: ${SecondLevelTitleFontWeight}; */
      ${responsive.sm} {
        font-size: ${SecondLevelTitleFontSize_SM};
        /* font-weight: ${SecondLevelTitleFontWeight_SM}; */
      }
    `,
    tabContents: css`
      padding: 30px 0 0;
      font-size: 15px;
    `,
    nav: css`
      cursor: pointer;
      &.actived {
        color: ${PrimaryColor};
        font-weight: ${SecondLevelTitleFontWeight};
      }
      &:hover {
        color: ${PrimaryColor};
      }
    `,
  };
});
interface ITabItem {
  title: string;
  content: () => React.ReactNode;
}

const Part3: React.FC = observer((props) => {
  const { styles } = useStyles();
  const [activedKey, setActivedKey] = useState<string>('多账号管理');
  const tabItems: ITabItem[] = [
    {
      title: '多账号管理',
      content: () => {
        return (
          <TabCard
            bgColor="#236B40"
            imageBorderColor="rgb(89, 203, 89)"
            title="多账号智能管理"
            features={[
              ' 通过先进的指纹环境技术和专属 TK 云服务，TikPulse 支持一台电脑轻松管理 100+ TikTok 账号，硬件成本降低 50%，运营效率翻倍。',
              '账号安全无忧：采用军事级加密与实时行为监控技术，将账号封禁率降至最低，确保您的 TikTok 资产安全稳定。',
            ]}
          />
        );
      },
    },
    {
      title: '养号与增粉',
      content: () => {
        return (
          <TabCard
            bgColor="#6C2277"
            imageBorderColor="rgb(172, 68, 168)"
            title="自动养号与增粉"
            features={[
              ` 全自动养号：TikPulse模拟真实用户行为，快速提升账号的活跃度和平台信任度，帮助用户在最短时间内达到开通 TikTok Shop 的条件。`,
              `精准增粉：支持根据目标人群特征设定策略，吸引高质量粉丝，轻松打造千粉、万粉账号，精准流量触手可得。`,
              `自动化粉丝管理：智能回复评论与私信，提升账号活跃度与粉丝黏性，强化互动效果。`,
              `私域流量引流：支持将流量引导至社群或独立站，不错过每一个潜在客户，助力构建私域生态。`,
            ]}
          />
        );
      },
    },
    {
      title: '创作与发布',
      content: () => {
        return (
          <TabCard
            bgColor="#931847"
            imageBorderColor="rgb(206, 54, 101)"
            title="智能内容创作与发布"
            features={[
              `一键批量发布： 只需将视频上传至素材库，TikPulse 支持一键将内容发布到多个账号或地区，发布效率提升 5 倍，节约 99% 手动操作时间。`,
              `智能优化曝光：内置热门音乐识别与智能定时发布功能，通过分析 TikTok 流量趋势，精准匹配 TikTok 流量高峰，确保内容获得最大曝光量。`,
              `零门槛混剪：无需剪辑经验，上传素材即可通过 AI 一键生成多样化短视频，1 分钟批量混剪 1000 条原创内容，创作效率提升 10 倍。`,
              `多功能视频处理：支持视频去重、去文字、添加品牌标识及背景音乐，满足多样化商业创作需求。`,
            ]}
          />
        );
      },
    },
    {
      title: '监测与分析',
      content: () => {
        return (
          <TabCard
            bgColor="#123F89"
            imageBorderColor="#215BC3"
            title="数据监测与分析"
            features={[
              `市场趋势洞察：覆盖全球 TikTok 市场的热门视频、创作者、标签及电商数据，助您快速捕捉流量风口与商机。`,
              `账号深度分析：提供账号视频表现、粉丝增长与互动数据的多维度分析，优化内容与运营策略，驱动持续增长。`,
            ]}
          />
        );
      },
    },
    {
      title: '变现与助力',
      content: () => {
        return (
          <TabCard
            bgColor="#113F3F"
            imageBorderColor="#47C4B2"
            title="变现助力"
            features={[
              `智能选品引擎：实时同步 TikTok Shop 热销商品数据，快速锁定爆款产品，减少试错成本，提升电商转化率。`,
              `达人资源库：提多维度筛选达⼈，分析历史带货数据，降低合作⻛险。`,
              `直播资源库：实时同步监控达人直播表现，评估带货能力和流量吸引力，优化合作策略。`,
            ]}
          />
        );
      },
    },
    {
      title: '免费福利',
      content: () => {
        return (
          <TabCard
            bgColor="#F8BC01"
            imageBorderColor="#FCE16E"
            title="变现助力"
            features={[
              `专业课程：包括TikTok运营基础、选品策略、达人合作技巧等内容，帮助用户快速掌握平台玩法，提升变现效率。新手也能通过课程迅速成长为专业运营者。`,
              `白号赠送：新用户可获得免费TikTokVideo白号(全新账号；账号资料属于用户个人)，无需自行注册即可开始运营，降低前期成本，助力快速启动。`,
            ]}
          />
        );
      },
    },
  ];

  const renderTabs = () => {
    const renderNavs = () => {
      return tabItems.map((it) => (
        <div
          className={classNames(styles.nav, {
            actived: it.title === activedKey,
          })}
          key={it.title}
          onClick={() => setActivedKey(it.title)}
        >
          <div>{it.title}</div>
        </div>
      ));
    };

    const renderActiveContent = () => {
      const item = tabItems.find((it) => it.title === activedKey);
      return item.content();
    };

    return (
      <div className={styles.tabs}>
        <div className={styles.tabNavs}>{renderNavs()}</div>
        <div className={styles.tabContents}>{renderActiveContent()}</div>
      </div>
    );
  };

  return (
    <div className={styles.partContainer}>
      <WideScreenContainer>{renderTabs()}</WideScreenContainer>
    </div>
  );
});

Part3.displayName = 'Part3';

export default Part3;

const useTabCardStyles = createStyles(({ css, responsive }) => {
  return {
    card: css`
      display: flex;
      flex-flow: row wrap;
      justify-content: space-between;
      color: #fff;
      padding: 80px;
      border-radius: 16px;
      gap: 20px 80px;
      ${responsive.sm} {
        padding: 14px;
        gap: 0;
      }
    `,
    leftPart: css`
      position: relative;
      flex: 1;
      min-width: 596px;
      min-height: 364px;
      border: 2px solid transparent;
      border-radius: 16px;
      ${responsive.sm} {
        display: none;
      }
    `,
    rightPart: css`
      position: relative;
      flex: 1;
      display: flex;
      flex-flow: column;
      gap: 28px 0;
    `,
    title: css`
      font-size: ${FirstLevelTitleFontSize};
      font-weight: ${FirstLevelTitleFontWeight};
      ${responsive.sm} {
        font-size: ${FirstLevelTitleFontSize_SM};
        font-weight: ${FirstLevelTitleFontWeight_SM};
      }
    `,
    featureContainer: css`
      display: flex;
      flex-flow: column;
      gap: 10px 0;
    `,
    feature: css`
      /* display: flex;
      align-items: center;
      gap: 0 8px; */
    `,
    featureIcon: css`
      margin-right: 8px;
    `,
  };
});

interface ITabCardProps {
  bgColor: string;
  imageBorderColor: string;
  title: string;
  description?: string;
  features?: string[];
}

const TabCard: React.FC<ITabCardProps> = (props) => {
  const { bgColor, imageBorderColor, title, features } = props;
  const { styles } = useTabCardStyles();
  return (
    <div className={styles.card} style={{ backgroundColor: bgColor }}>
      <div className={styles.leftPart} style={{ borderColor: imageBorderColor }}></div>
      <div className={styles.rightPart}>
        <div className={styles.title}>{title}</div>

        <div className={styles.featureContainer}>
          {features &&
            features.map((feature) => (
              <div className={styles.feature} key={feature}>
                <CheckCircleOutlined className={styles.featureIcon} />
                {feature}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

TabCard.displayName = 'TabCard';
