import React, { useEffect } from 'react';
import { Plugin, Application, useAPIClient } from '@nocobase/client';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { isNil } from 'lodash';

export const registerOrganPackageInfoProvider = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;
  // app.addProvider(OrganPackageInfoProvider);
};

// 创建一个组件，注意对 children 的渲染
const OrganPackageInfoProvider = (props) => {
  const { children } = props;
  const apiClient = useAPIClient();

  useEffect(() => {
    (async () => {
      const { data } = await apiClient.request({
        url: `servicePermissions:servicesInfo`,
      });
      console.log(`---------[111 ]---------`);
      console.log(`data:`, data);
      if (!isNil(data)) {
        const { organPackages, organServices } = data;
        // setOrganPackages(organPackages || []);
        // setOrganServices(organServices || []);
      }
    })();
  }, []);

  return <>{children}</>;
};
