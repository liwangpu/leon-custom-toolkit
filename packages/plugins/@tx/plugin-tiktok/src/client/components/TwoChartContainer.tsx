import { createStyles } from '@nocobase/client';
import React from 'react';

const useStyles = createStyles(({ css }) => {
  return {
    container: css`
      display: flex;
      flex-flow: row;
      align-items: center;
    `,
    part: css`
      flex: 1;
    `,
  };
});

export interface ITwoChartContainerProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}
const TwoChartContainer: React.FC<ITwoChartContainerProps> = (props) => {
  const { left, right } = props;
  const { styles } = useStyles();
  return (
    <div className={styles.container}>
      <div className={styles.part}>{left}</div>
      <div className={styles.part}>{right}</div>
    </div>
  );
};

TwoChartContainer.displayName = 'TwoChartContainer';

export default TwoChartContainer;
