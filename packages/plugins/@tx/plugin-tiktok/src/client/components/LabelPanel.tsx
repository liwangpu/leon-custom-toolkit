import React from 'react';
import { observer } from 'mobx-react-lite';
import { createStyles } from '@nocobase/client';
import { isArray, isFunction, isNil } from 'lodash';
import { Spin } from 'antd';

export interface ILabelPanelLabel {
  label: string;
  value: any;
  prefix?: string;
}
export interface ILabelPanelGroup {
  key: string;
  title?: string;
  rightFilter?: React.ReactNode;
  // labels: Array<ILabelPanelLabel>;
  column?: number;
  customRender?: () => React.ReactNode;
}

export interface ILabelPanelProps {
  title?: string;
  loading?: boolean;
  groups: Array<ILabelPanelGroup>;
  values?: { [key: string]: any };
}

const useStyles = createStyles(({ css }) => {
  return {
    container: css`
      display: flex;
      flex-flow: column;
      width: 100%;
      margin-bottom: 24px;
      padding: 14px 24px;
      border-radius: 8px;
      background-color: #fff;
    `,
    header: css``,
    content: css``,
    panelTitle: css`
      font-size: 18px;
      font-weight: 700;
    `,
    group: css`
      &:not(:last-of-type) {
        margin-bottom: 20px;
      }
    `,
    groupHeader: css`
      display: flex;
      justify-content: space-between;
      align-items: center;
    `,
    groupContent: css`
      display: grid;
      grid-template-columns: repeat(auto-fill, 160px);
      grid-row-gap: 8px;
      width: 100%;
      margin-top: 10px;
      & > *:last-of-type::after {
        display: none !important;
      }
    `,
    groupContentCustomRender: css`
      display: flex;
      flex-flow: column;
      margin-top: 10px;
    `,
    groupHeaderTitle: css`
      font-size: 18px;
      font-weight: 700;
    `,
    groupHeaderFilter: css``,
    labelBox: css`
      position: relative;
      display: flex;
      flex-flow: column;
      justify-content: center;
      align-items: center;
      min-height: 50px;
      &::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        display: block;
        width: 1px;
        height: 32px;
        margin: auto;
        background-color: rgb(225, 227, 238);
      }
    `,
    labelBoxValue: css`
      font-size: 20px;
      color: rgb(0, 1, 57);
    `,
    labelBoxTitle: css`
      font-size: 12px;
      color: rgb(136, 139, 166);
    `,
  };
});

export const LabelPanel: React.FC<ILabelPanelProps> = observer((props) => {
  const { title, groups, values, loading } = props;
  const { styles } = useStyles();

  const renderGroup = (group: ILabelPanelGroup) => {
    const { key, title: groupTitle, column = 6, rightFilter, customRender } = group;

    const labels: Array<ILabelPanelLabel> = values[key] || [];

    const renderLabel = (lb: ILabelPanelLabel) => {
      const { label, value: _value, prefix } = lb;
      let value: string;
      if (isNil(_value)) {
        value = '-';
      } else {
        value = `${_value}`;
        if (!isNil(prefix)) {
          value = `${prefix}${value}`;
        }
      }
      return (
        <div className={styles.labelBox} key={label}>
          <div className={styles.labelBoxValue}>{isNil(value) ? '-' : value}</div>
          <div className={styles.labelBoxTitle}>{label}</div>
        </div>
      );
    };
    return (
      <div className={styles.group} key={key}>
        <div className={styles.groupHeader}>
          <div className={styles.groupHeaderTitle}>{groupTitle}</div>
          <div className={styles.groupHeaderFilter}>{rightFilter}</div>
        </div>
        {isFunction(customRender) ? (
          <div className={styles.groupContentCustomRender}>{customRender()}</div>
        ) : (
          <div className={styles.groupContent} style={{ gridTemplateColumns: `repeat(${column}, 1fr)` }}>
            {labels && labels.length ? labels.map((lb, idx) => renderLabel(lb)) : null}
          </div>
        )}
      </div>
    );
  };
  return (
    <Spin spinning={loading}>
      <div className={styles.container}>
        {groups && groups.length ? <div className={styles.content}>{groups.map((g) => renderGroup(g))}</div> : null}
      </div>
    </Spin>
  );
});

LabelPanel.displayName = 'LabelPanel';

export interface IIndicator {
  label: string;
  value: string;
}

export interface IIndicatorCardProps {
  subject: string;
  subjectValue?: any;
  indicators?: Array<IIndicator>;
}

const useIndicatorCardStyles = createStyles(({ css }) => {
  return {
    card: css`
      display: flex;
      flex-flow: column;
      justify-content: space-between;
      width: 186px;
      min-height: 208px;
      border-radius: 12px;
      padding: 18px;
      background-color: rgb(250, 250, 255);
      color: rgb(136, 139, 166);
    `,
    cardHeader: css`
      display: flex;
      flex-flow: column;
    `,
    cardContent: css`
      display: flex;
      flex-flow: column;
    `,
    indicatorLabel: css`
      font-size: 12px;
    `,
    indicatorValue: css`
      font-size: 20px;
      font-weight: 700;
      color: black;
    `,
    indicator: css`
      display: flex;
      flex-flow: row;
      justify-content: space-between;
      font-size: 12px;
      position: relative;
      padding: 6px 0;
      &:not(:last-of-type) {
        border-bottom: 1px solid rgb(240, 241, 248);
      }
    `,
  };
});

export const IndicatorCard: React.FC<IIndicatorCardProps> = observer((props) => {
  const { subject, subjectValue, indicators } = props;
  const { styles } = useIndicatorCardStyles();

  const renderIndicator = (it: IIndicator) => {
    return (
      <div className={styles.indicator}>
        <div>{it.label}</div>
        <div>{it.value}</div>
      </div>
    );
  };
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.indicatorLabel}>{subject}</div>
        <div className={styles.indicatorValue}>{subjectValue}</div>
      </div>
      <div className={styles.cardContent}>
        {isArray(indicators) && indicators.length ? indicators.map((it) => renderIndicator(it)) : null}
      </div>
    </div>
  );
});

IndicatorCard.displayName = 'IndicatorCard';
