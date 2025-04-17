import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { createStyles, DataBlockContext, DataBlockContextValue, useAPIClient, SchemaComponent } from '@nocobase/client';
import { Plugin } from '@nocobase/client';
import { ILabelPanelProps, IndicatorCard, LabelPanel } from './LabelPanel';
import { Radio } from 'antd';
import { useEvent } from '../hooks';
import TKVideoCard, { ITKVideoCardProps } from './TKVideoCard';
import { ISchema } from '@formily/json-schema';
import { padEnd, floor } from 'lodash';

export const registerTestComponent = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  // app.addComponents({ LabelPanel });

  app.router.add('test1-demo', {
    path: 'test1-demo',
    Component: TestDemo,
  });
};

const schema: ISchema = {
  type: 'void',
  name: 'root',
  // 'x-decorator': 'DataBlockProvider',
  // 'x-use-decorator-props': 'useBlockDecoratorProps',
  'x-decorator-props': {
    // association,
    // action,
  },
  // 'x-component': 'InfluencerOverview',
  // 'x-component': 'ProductOverview',
  // 'x-component': 'SellerOverview',
  'x-component': 'HashTagOverview',
  // properties: {
  //   demo: {
  //     type: 'array',
  //     'x-component': 'MyTable',
  //     'x-use-component-props': 'useTableProps',
  //   },
  // },
};

const useStyles = createStyles(({ css }) => {
  return {
    page: css`
      display: flex;
      flex-flow: column;
      width: 100%;
      height: 100%;
      padding: 20px;
      background-color: rgb(242, 243, 245);
      overflow: auto;
    `,
  };
});

const TestDemo: React.FC = observer((props) => {
  const { styles } = useStyles();
  const apiClient = useAPIClient();

  return (
    <DataBlockContext.Provider value={dataContext}>
      <div className={styles.page}>
        <SchemaComponent schema={schema}></SchemaComponent>
      </div>
      ;
    </DataBlockContext.Provider>
  );
});

TestDemo.displayName = 'TestDemo';

const dataContext: DataBlockContextValue<any> = {
  props: {
    filterByTk: '229207',
    // filterByTk: '1729431948361436125',
  },
  dn: null,
};
