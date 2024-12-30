import React, { useState } from 'react';
import { onFieldValueChange } from '@formily/core';
import { uid } from '@formily/shared';
import { useForm, useField, useFormEffects } from '@formily/react';
import { ArrayItems } from '@formily/antd-v5';

import {
  Instruction,
  WorkflowVariableJSON,
  WorkflowVariableTextArea,
} from '@nocobase/plugin-workflow/client';

import { SchemaComponent, css } from '@nocobase/client';
import { WEBHOOK_RESPONSE_NAMESPACE } from '../../enums';

const BodySchema = {
  'application/json': {
    type: 'void',
    properties: {
      responseBody: {
        type: 'object',
        'x-decorator': 'FormItem',
        'x-decorator-props': {},
        'x-component': 'WorkflowVariableJSON',
        'x-component-props': {
          changeOnSelect: true,
          autoSize: {
            minRows: 10,
          },
          placeholder: '请输入JSON格式的返回内容',
        },
        required: true,
      },
    },
  },
  'text/plain': {
    type: 'void',
    properties: {
      responseBody: {
        type: 'text',
        'x-decorator': 'FormItem',
        'x-decorator-props': {},
        'x-component': 'WorkflowVariableTextArea',
        'x-component-props': {
          changeOnSelect: true,
          autoSize: {
            minRows: 10,
          },
          placeholder: '请输入返回文本',
        },
        required: true,
      },
    },
  },
};

function BodyComponent(props) {
  const f = useField();
  const { values, setValuesIn, clearFormGraph } = useForm();
  const { contentType } = values;
  const [schema, setSchema] = useState(BodySchema[contentType]);

  useFormEffects(() => {
    onFieldValueChange('contentType', (field) => {
      clearFormGraph(`${f.address}.*`);
      setSchema({ ...BodySchema[field.value], name: uid() });
      setValuesIn('responseBody', null);
    });
  });

  return <SchemaComponent basePath={f.address} schema={schema} onlyRenderProperties />;
}

function useVariables(node, opts) {
  return {
    value: node.key, label: node.title,
    children: [
      { value: 'statusCode', label: 'Status Code(string)' },
      { value: 'contentType', label: 'Content Type(string)' },
      { value: 'responseHeaders', label: 'Headers(array<name, value>)' },
      { value: 'responseBody', label: 'Response Body(json|string)' },
    ]
  }
}

export default class WebhookResponseInstruction extends Instruction {
  title = 'Webhook Response';
  type = WEBHOOK_RESPONSE_NAMESPACE;
  group = 'extended';
  description = '定义Webhook请求响应数据的状态码和返回内容';
  fieldset = {
    statusCode: {
      type: 'string',
      title: 'Response Status Code',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      default: '200',
      required: true,
    },
    contentType: {
      type: 'string',
      title: 'Response Content-Type',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        allowClear: false,
      },
      enum: [
        { label: 'application/json', value: 'application/json' },
        { label: 'text/plain', value: 'text/plain' },
      ],
      default: 'application/json',
    },
    responseHeaders: {
      type: 'array',
      'x-component': 'ArrayItems',
      'x-decorator': 'FormItem',
      title: 'Response Headers',
      description: '请勿定义Content-Type',
      items: {
        type: 'object',
        properties: {
          space: {
            type: 'void',
            'x-component': 'Space',
            'x-component-props': {
              style: {
                flexWrap: 'nowrap',
                maxWidth: '100%',
              },
              className: css`
                & > .ant-space-item:first-child,
                & > .ant-space-item:last-child {
                  flex-shrink: 0;
                }
              `,
            },
            properties: {
              name: {
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  placeholder: `{{t("Name")}}`,
                },
              },
              value: {
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'WorkflowVariableTextArea',
                'x-component-props': {
                  useTypedConstant: true,
                  placeholder: `{{t("Value")}}`,
                },
              },
              remove: {
                type: 'void',
                'x-decorator': 'FormItem',
                'x-component': 'ArrayItems.Remove',
              },
            },
          },
        },
      },
      properties: {
        add: {
          type: 'void',
          title: `请添加响应头header`,
          'x-component': 'ArrayItems.Addition',
        },
      },
    },
    responseBody: {
      type: 'void',
      title: `Response Body`,
      'x-decorator': 'FormItem',
      'x-decorator-props': {},
      'x-component': 'BodyComponent',
    },
  };
  components = {
    ArrayItems,
    BodyComponent,
    WorkflowVariableTextArea,
    WorkflowVariableJSON,
  };
  useVariables = useVariables;
}