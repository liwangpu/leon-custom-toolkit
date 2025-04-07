import React from 'react';
import { observer } from 'mobx-react-lite';
import { createStyles } from '@nocobase/client';
import Part1 from './Part1';
import PageLayout from '../PageLayout';

const useStyles = createStyles(({ css, responsive }) => {
  return {
    container: css`
      position: relative;
      display: flex;
      flex-flow: column;
      gap: 50px 0;
      color: #fff;
    `,
  };
});

const PackagePage: React.FC = observer((props) => {
  const { styles } = useStyles();
  return (
    <PageLayout>
      <div className={styles.container}>
        <Part1 />
      </div>
    </PageLayout>
  );
});

PackagePage.displayName = 'PackagePage';

export default PackagePage;
