/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { css, cx } from '@emotion/css';
import { usePrefixCls } from '@formily/antd-v5/esm/__builtins__';
import { useFieldSchema } from '@formily/react';
import { Avatar, Image } from 'antd';
import cls from 'classnames';
import _ from 'lodash';
import React, { useMemo } from 'react';
import { withPopupWrapper } from '../../common/withPopupWrapper';
import { useCompile } from '../../hooks';
import { EllipsisWithTooltip } from './EllipsisWithTooltip';
import { HTMLEncode } from './shared';
import { UserOutlined } from '@ant-design/icons';

export type InputReadPrettyComposed = {
  Input: React.FC<InputReadPrettyProps>;
  URL: React.FC<URLReadPrettyProps>;
  Preview: React.FC<URLReadPrettyProps>;
  Avatar: React.FC<URLReadPrettyProps>;
  TextArea: React.FC<TextAreaReadPrettyProps>;
  Html: React.FC<HtmlReadPrettyProps>;
  JSON: React.FC<JSONTextAreaReadPrettyProps>;
};

export const ReadPretty: InputReadPrettyComposed = () => null;

export interface InputReadPrettyProps {
  value?: any;
  className?: string;
  style?: React.CSSProperties;
  addonBefore?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  addonAfter?: React.ReactNode;
  ellipsis?: boolean;
  prefixCls?: string;
}

ReadPretty.Input = (props: InputReadPrettyProps) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const prefixCls = usePrefixCls('description-input', props);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const compile = useCompile();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const content = useMemo(
    () => (props.value && typeof props.value === 'object' ? JSON.stringify(props.value) : compile(props.value)),
    [props.value],
  );

  return (
    <div
      className={cls(prefixCls, props.className)}
      style={{ overflowWrap: 'break-word', whiteSpace: 'normal', ...props.style }}
    >
      {props.addonBefore}
      {props.prefix}
      {props.ellipsis ? <EllipsisWithTooltip ellipsis={props.ellipsis}>{content}</EllipsisWithTooltip> : content}
      {props.suffix}
      {props.addonAfter}
    </div>
  );
};

export interface TextAreaReadPrettyProps {
  value?: any;
  className?: string;
  style?: React.CSSProperties;
  addonBefore?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  addonAfter?: React.ReactNode;
  ellipsis?: boolean;
  text?: boolean;
  autop?: boolean;
  prefixCls?: string;
}

const toHTML = _.memoize((value: string) => ({ __html: HTMLEncode(value).split('\n').join('<br/>') }));
const lineHeight = { lineHeight: 'inherit' };
const html = (value: string) => <div style={lineHeight} dangerouslySetInnerHTML={toHTML(value)} />;

ReadPretty.TextArea = (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const prefixCls = usePrefixCls('description-textarea', props);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const compile = useCompile();
  const { autop: atop = true, ellipsis, text } = props;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const content = useMemo(() => {
    const value = compile(props.value ?? '');

    return ellipsis ? (
      <EllipsisWithTooltip ellipsis={ellipsis} popoverContent={atop ? html(value) : value}>
        {text || value}
      </EllipsisWithTooltip>
    ) : atop ? (
      html(value)
    ) : (
      value
    );
  }, [atop, ellipsis, props.value, text]);

  return (
    <div
      className={cls(prefixCls, props.className)}
      style={{ overflowWrap: 'break-word', whiteSpace: 'normal', ...props.style }}
    >
      {props.addonBefore}
      {props.prefix}
      {content}
      {props.suffix}
      {props.addonAfter}
    </div>
  );
};

const convertToText = _.memoize((html: string) => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const text = temp.innerText;
  return text?.replace(/[\n\r]/g, '') || '';
});

export interface HtmlReadPrettyProps {
  value?: any;
  className?: string;
  style?: React.CSSProperties;
  addonBefore?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  addonAfter?: React.ReactNode;
  ellipsis?: boolean;
  autop?: boolean;
  prefixCls?: string;
}

const lineHeight142 = { lineHeight: '1.42' };
ReadPretty.Html = (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const prefixCls = usePrefixCls('description-textarea', props);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const compile = useCompile();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const content = useMemo(() => {
    const value = compile(props.value ?? '');
    const { autop = true, ellipsis } = props;
    const html = (
      <div
        style={lineHeight142}
        dangerouslySetInnerHTML={{
          __html: value,
        }}
      />
    );
    const text = convertToText(value);

    if (ellipsis) {
      return (
        <EllipsisWithTooltip ellipsis={ellipsis} popoverContent={autop ? html : value}>
          {text}
        </EllipsisWithTooltip>
      );
    }

    return autop ? html : value;
  }, [props.value]);

  return (
    <div
      className={cls(prefixCls, props.className)}
      style={{ overflowWrap: 'break-word', whiteSpace: 'normal', ...props.style }}
    >
      {props.addonBefore}
      {props.prefix}
      {content}
      {props.suffix}
      {props.addonAfter}
    </div>
  );
};

export interface URLReadPrettyProps {
  value?: any;
  className?: string;
  style?: React.CSSProperties;
  addonBefore?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  addonAfter?: React.ReactNode;
  prefixCls?: string;
  ellipsis?: boolean;
}

const ellipsisStyle = { textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' };

ReadPretty.URL = (props: URLReadPrettyProps) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const prefixCls = usePrefixCls('description-url', props);
  const content = props.value && (
    <a style={props.ellipsis ? ellipsisStyle : undefined} target="_blank" rel="noopener noreferrer" href={props.value}>
      {props.value}
    </a>
  );
  return (
    <div className={cls(prefixCls, props.className)} style={{ whiteSpace: 'normal', ...props.style }}>
      {props.addonBefore}
      {props.prefix}
      {content}
      {props.suffix}
      {props.addonAfter}
    </div>
  );
};

const sizes = {
  small: 24,
  middle: 48,
  large: 72,
  oversized: 120,
};

ReadPretty.Preview = function Preview(props: any) {
  const fieldSchema = useFieldSchema();
  const size = fieldSchema['x-component-props']?.['size'] || 'small';
  const objectFit = fieldSchema['x-component-props']?.['objectFit'] || 'cover';

  if (!props.value) {
    return props.value;
  }
  // @泰香: 添加图片预览组建容错处理
  return (
    <Image
      style={
        ['small', 'middle', 'large', 'oversized'].includes(size)
          ? {
              width: sizes[size],
              height: sizes[size],
              objectFit,
            }
          : {}
      }
      src={props.value}
      fallback="data:image/png;base64,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"
    />
  );
};

const AVATAR_SIZE_MAPPING = {
  small: 40,
  middle: 64,
  large: 80,
  oversized: 100,
};
/**
 * @泰香: 自定义头像组件
 * @param props  props
 * @returns
 */
ReadPretty.Avatar = function Preview(props: any) {
  const fieldSchema = useFieldSchema();
  const avatarSize = fieldSchema['x-component-props']?.['avatarSize'] || 'small';
  const avatarShape = fieldSchema['x-component-props']?.['avatarShape'] || 'circle';

  if (!props.value) {
    return props.value;
  }
  return (
    <Avatar
      // shape="square"
      // size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
      size={AVATAR_SIZE_MAPPING[avatarSize]}
      src={props.value}
      icon={<UserOutlined />}
      shape={avatarShape}
    />
  );
};

export interface JSONTextAreaReadPrettyProps {
  value?: any;
  className?: string;
  style?: React.CSSProperties;
  space?: number;
  prefixCls?: string;
  ellipsis?: boolean;
}

const JSONClassName = css`
  margin-bottom: 0;
  line-height: 1.5;
  font-size: 90%;
`;

ReadPretty.JSON = (props: JSONTextAreaReadPrettyProps) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const prefixCls = usePrefixCls('json', props);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const content = useMemo(
    () => (props.value != null ? JSON.stringify(props.value, null, props.space ?? 2) : ''),
    [props.space, props.value],
  );
  const JSONContent = (
    <pre className={cx(prefixCls, props.className, JSONClassName)} style={props.style}>
      {content}
    </pre>
  );

  if (props.ellipsis) {
    return (
      <EllipsisWithTooltip ellipsis={props.ellipsis} popoverContent={JSONContent}>
        {content}
      </EllipsisWithTooltip>
    );
  }

  return JSONContent;
};

ReadPretty.Input = withPopupWrapper(ReadPretty.Input);
ReadPretty.TextArea = withPopupWrapper(ReadPretty.TextArea);
ReadPretty.Html = withPopupWrapper(ReadPretty.Html);
ReadPretty.Preview = withPopupWrapper(ReadPretty.Preview);
ReadPretty.Avatar = withPopupWrapper(ReadPretty.Avatar);
ReadPretty.JSON = withPopupWrapper(ReadPretty.JSON);
