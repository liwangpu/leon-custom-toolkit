import React from 'react';
import { createStyles } from '@nocobase/client';
import { PageHeaderHeight, PageHeaderHeight_SM } from './common';
import classNames from 'classnames';

const commonVerticalPadding = 42;
const commonVerticalPaddingSM = 22;
const useStyles = createStyles(({ css, responsive }) => {
  return {
    pageLayout: css`
      /* position: relative; */
      width: 100%;
      padding: ${PageHeaderHeight}px 0 0;
      ${responsive.sm} {
        padding: ${PageHeaderHeight_SM}px 0 0;
        &.verticalPadding {
          padding: ${PageHeaderHeight_SM + 22}px 0 ${commonVerticalPaddingSM}px !important;
        }
      }
      &.verticalPadding {
        padding: ${PageHeaderHeight + commonVerticalPadding}px 0 ${commonVerticalPadding}px;
      }
    `,
  };
});

export interface IPageLayout {
  /**
   * 启用页面上下的padding
   */
  verticalPadding?: boolean;
  children?: React.ReactNode;
}

const PageLayout: React.FC<IPageLayout> = (props) => {
  const { children, verticalPadding } = props;
  const { styles } = useStyles();
  return (
    <div
      className={classNames(styles.pageLayout, {
        verticalPadding: verticalPadding,
      })}
    >
      {children}
    </div>
  );
};

PageLayout.displayName = 'PageLayout';

export default PageLayout;
