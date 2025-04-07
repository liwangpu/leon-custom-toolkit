import React from 'react';
import { observer } from 'mobx-react-lite';
import { createStyles } from '@nocobase/client';
import Part1 from './Part1';
import PageLayout from '../PageLayout';
import Img10014 from '../../assets/images/10014.png';
import Img10015 from '../../assets/images/10015.png';

const useStyles = createStyles(({ css, responsive }) => {
  return {
    container: css`
      position: relative;
      display: flex;
      flex-flow: column;
      gap: 50px 0;
    `,
    introImgBg1: css`
      position: absolute;
      top: 100px;
      left: 100px;
      width: 500px;
      height: 500px;
      /* transform: scale(1.7); */
      z-index: 2;
    `,
    introImgBg2: css`
      position: absolute;
      top: -300px;
      left: 560px;
      width: 1000px;
      height: 1000px;
      /* transform: scale(1.7); */
      z-index: 1;
    `,
  };
});

const DownloadPage: React.FC = observer((props) => {
  const { styles } = useStyles();
  return (
    <PageLayout verticalPadding={true}>
      <div className={styles.container}>
        <img className={styles.introImgBg1} src={Img10014} />
        <img className={styles.introImgBg2} src={Img10014} />
        <Part1 />
      </div>
    </PageLayout>
  );
});

DownloadPage.displayName = 'DownloadPage';

export default DownloadPage;
