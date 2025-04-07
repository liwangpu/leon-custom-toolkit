import React from 'react';
import { observer } from 'mobx-react-lite';
import { createStyles } from '@nocobase/client';
import Part1 from './Part1';
import Part2 from './Part2';
import Img10042 from '../../assets/images/10042.png';
import Img10043 from '../../assets/images/10043.png';
import Part3 from './Part3';
import Part4 from './Part4';
import PageLayout from '../PageLayout';

const useStyles = createStyles(({ css, responsive }) => {
  return {
    container: css`
      /* position: relative; */
      display: flex;
      flex-flow: column;
      gap: 50px 0;
    `,
    introImgBg1: css`
      position: absolute;
      top: 50%;
      left: -400px;
      width: 60%;
      height: auto;
      transform: scale(1.7);
    `,
    introImgBg2: css`
      position: absolute;
      top: 40%;
      left: 560px;
      width: 60%;
      height: auto;
      transform: scale(1.7);
    `,
  };
});

const ServicePage: React.FC = observer((props) => {
  const { styles } = useStyles();
  return (
    <PageLayout verticalPadding={true}>
      <div className={styles.container}>
        <img className={styles.introImgBg1} src={Img10042} />
        <img className={styles.introImgBg2} src={Img10043} />
        <Part1 />
        <Part2 />
        <Part3 />
        <Part4 />
        {/* <div className={styles.bgMark}></div> */}
      </div>
    </PageLayout>
  );
});

ServicePage.displayName = 'ServicePage';

export default ServicePage;
