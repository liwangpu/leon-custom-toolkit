import React from 'react';
import { createStyles } from '@nocobase/client';
import WideScreenContainer from '../WideScreenContainer';
import { observer } from 'mobx-react-lite';
import ImgContactUs from '../../assets/images/contactUs.png';
import FeatureIntroduce, { FeatureIntroduceCB, IFeatureIntroduceProps } from './FeatureIntroduce';

const useStyles = createStyles(({ css, responsive }) => {
  return {
    partContainer: css`
      display: flex;
      flex-flow: column;
      gap: 80px 0;
      width: 100%;
    `,
  };
});

const features1: IFeatureIntroduceProps['features'] = [
  {
    title: '获取免费试用和免费课程',
    // description: '我是描述',
    image: ImgContactUs,
  },
  {
    title: '专业团队：由经验丰富的技术专家提供支持，确保问题高效解决。',
    image: ImgContactUs,
  },
  {
    title: '快速响应：24小时内回复邮件，工作时间电话随时畅通。',
    image: ImgContactUs,
  },
];

const features2: IFeatureIntroduceProps['features'] = [
  {
    title: '电话支持',
    description: '+86 19017119967',
    image: ImgContactUs,
  },
  {
    title: '电子邮件：TikPulse',
    description: 'TikPulse@163.com',
    image: ImgContactUs,
  },
  {
    title: '无论您选择哪种方式，我们的团队都将迅速响应您的需求。',
    image: ImgContactUs,
  },
];

const features3: IFeatureIntroduceProps['features'] = [
  {
    title: '支持邮箱',
    description: 'TikPulse@163.com',
    image: ImgContactUs,
  },
  {
    title: '提交问题表单包括',
    description: '姓名；主题；消息内容',
    image: ImgContactUs,
  },
  {
    title: '响应时间：我们将在24小时内回复您的工作日邮件。',
    description: '请提供具体问题描述或账号信息，以便我们更快为您解决问题。',
    image: ImgContactUs,
  },
];

const cbItems: IFeatureIntroduceProps[] = [
  {
    title: '企业联系方式',
    description: '我们提供多种联系渠道，确保您能随时与我们取得联系',
    features: features2,
  },
  {
    title: '邮箱提问',
    description: '有详细问题或需要技术支持？通过以下方式与我们联系',
    features: features3,
  },
];

const Part3: React.FC = observer((props) => {
  const { styles } = useStyles();
  return (
    <WideScreenContainer>
      <div className={styles.partContainer}>
        <FeatureIntroduce title="24小时专属客服" features={features1} />
        <FeatureIntroduceCB items={cbItems} />
        {/* <FeatureIntroduce
          title="邮箱提问"
          description="有详细问题或需要技术支持？通过以下方式与我们联系"
          features={features3}
        /> */}
      </div>
    </WideScreenContainer>
  );
});

Part3.displayName = 'Part3';

export default Part3;
