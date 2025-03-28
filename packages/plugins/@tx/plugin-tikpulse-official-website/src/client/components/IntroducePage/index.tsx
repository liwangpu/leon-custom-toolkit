import React from 'react';
import { observer } from 'mobx-react-lite';
import { createStyles } from '@nocobase/client';
import Part1 from './Part1';
import Part2 from './Part2';
import Part3 from './Part3';

const useStyles = createStyles(({ css }) => {
  return {
    container: css`
      display: flex;
      flex-flow: column;
      align-items: center;
      gap: 42px 0;
    `,
  };
});

const IntroducePage: React.FC = observer(() => {
  const { styles } = useStyles();

  return (
    <div className={styles.container}>
      <Part1 />
      <Part2 />
      <Part3 />
    </div>
  );
});

IntroducePage.displayName = 'IntroducePage';

export default IntroducePage;
