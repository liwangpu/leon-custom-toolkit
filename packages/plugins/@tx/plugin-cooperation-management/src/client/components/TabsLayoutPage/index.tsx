/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { CaretDownOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps, Tabs } from 'antd';
import { isFunction } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Instance, getParent, t } from 'mobx-state-tree';
import { useMemo } from 'react';
import React from 'react';
import { createStyles } from '@nocobase/client';

const TAB_NAV_STYLE = {
  backgroundColor: '#FFF',
  padding: '0 16px',
};
const TAB_ADVANCE_MENU_TRIGGER = ['click'];

interface ITabChildren {
  (props: { tabs: any; tab: any; dataId?: string }): React.ReactNode;
}

const tabContainerStyle = {
  position: 'relative',
  display: 'block',
  overflow: 'hidden',
  width: '100%',
  height: '100%',
  padding: '0',
};

const TabContainer = (children: React.ReactNode) => {
  return <div style={tabContainerStyle as any}>{children}</div>;
};

export interface ITabDefinition {
  key: string;
  name: string;
  closable?: boolean;
  icon?: React.ReactNode;
  dataId?: string;
  children?: ITabChildren;
  advanceMenus?: MenuProps['items'];
}

export interface ITabsLayoutPageProps {
  title: string;
  tabs: ITabDefinition[];
  headerButtonArea?: React.ReactNode;
}

const TabModel = t
  .model({
    key: t.string,
    name: t.string,
    closable: t.maybeNull(t.boolean),
    icon: t.maybeNull(t.frozen()),
    dataId: t.maybeNull(t.string),
  })
  .volatile(() => {
    let _children: ITabChildren;
    return {
      setChildren(children: ITabChildren) {
        _children = children;
      },
      getChildren() {
        return _children;
      },
    };
  })
  .views((self) => {
    return {
      toView() {
        const children = self.getChildren();
        const tabs = getParent(getParent(self));
        return {
          key: self.key,
          label: <TabNav tab={self as any} />,
          children: isFunction(children)
            ? TabContainer(children({ tabs, tab: self as any, dataId: self.dataId }))
            : null,
        };
      },
    };
  })
  .actions((self) => {
    const getTabs = (): ITabsLayoutPageModel => {
      return getParent(getParent(self));
    };
    const close = () => {
      const tabs = getTabs();
      tabs.closeTab(self.key);
    };
    const closeRightTab = () => {
      const tabs = getTabs();
      tabs.closeRightTab(self.key);
    };
    const closeOtherTab = () => {
      const tabs = getTabs();
      tabs.closeOtherTab(self.key);
    };
    return {
      close,
      closeRightTab,
      closeOtherTab,
      update(props: { name?: string; dataId?: string } = {}) {
        const { name, dataId } = props;
        if (name) {
          self.name = name;
        }

        if (dataId) {
          self.dataId = dataId;
        }
      },
    };
  });

const TabsLayoutPageModel = t
  .model({
    pageName: t.string,
    tabs: t.array(TabModel),
    activedTab: t.maybeNull(t.string),
  })
  .views((self) => {
    return {
      get tabViews() {
        return self.tabs.map((tab) => tab.toView());
      },
    };
  })
  .actions((self) => {
    const addTab = (def: ITabDefinition) => {
      if (self.tabs.some((t) => t.key === def.key)) {
        self.activedTab = def.key;
        return;
      }
      const tab = TabModel.create({
        key: def.key,
        name: def.name,
        closable: def.closable,
        dataId: def.dataId,
        // icon: def.icon,
      });
      tab.setChildren(def.children);
      self.tabs.push(tab);
      self.activedTab = tab.key;
    };

    const closeTab = (tabKey: string) => {
      if (!tabKey) return;
      const tabIndex = self.tabs.findIndex((t) => t.key === tabKey);
      if (tabIndex < 0) return;
      const tab = self.tabs.at(tabIndex);
      if (!tab.closable) return;
      const preTab = self.tabs.at(tabIndex - 1);
      self.activedTab = preTab.key;
      self.tabs.remove(tab);
    };

    const closeRightTab = (tabKey: string) => {
      if (!tabKey) return;
      const tabIndex = self.tabs.findIndex((t) => t.key === tabKey);
      if (tabIndex < 0) return;
      const items = self.tabs.slice(tabIndex + 1);
      for (const tab of items) {
        if (tab.closable) {
          self.tabs.remove(tab);
        }
      }
    };

    const closeOtherTab = (tabKey: string) => {
      if (!tabKey) return;

      const needCloseTab = [];
      for (const tab of self.tabs) {
        if (tab.closable && tab.key !== tabKey) {
          needCloseTab.push(tab);
        }
      }

      for (const tab of needCloseTab) {
        self.tabs.remove(tab);
      }
    };

    const updateTab = (key: string, props: { name?: string; dataId?: string }) => {
      if (!key || !self.tabs.some((t) => t.key === key)) return;
      const tabIndex = self.tabs.findIndex((t) => t.key === key);
      if (tabIndex < 0) return;
      const tab = self.tabs.at(tabIndex);
      tab.update(props);
    };

    return {
      addTab,
      activeTab(tabKey: string) {
        self.activedTab = tabKey;
      },
      updateTab,
      closeTab,
      closeRightTab,
      closeOtherTab,
    };
  });

export type ITabModel = Instance<typeof TabModel>;
export type ITabsLayoutPageModel = Instance<typeof TabsLayoutPageModel>;

export interface IUseTabsLayoutPageModelProps {
  pageName: string;
  tabs: ITabDefinition[];
}

export function useTabsLayoutPageModel(props: IUseTabsLayoutPageModelProps): ITabsLayoutPageModel {
  const { pageName, tabs } = props;
  const model = useMemo<ITabsLayoutPageModel>(() => {
    const m = TabsLayoutPageModel.create({
      pageName,
    });

    if (tabs && tabs.length) {
      tabs.forEach((tab) => m.addTab(tab));
      m.activeTab(tabs[0].key);
    }

    return m;
  }, []);

  return model;
}

const TabNav: React.FC<{ tab: ITabModel }> = observer((props) => {
  const { tab } = props;
  const { styles } = useTabNavStyles();
  const menu = useMemo<MenuProps>(() => {
    const items: MenuProps['items'] = [
      tab.closable && {
        key: 'close',
        label: <span>关闭</span>,
        onClick(e) {
          e.domEvent.stopPropagation();
          tab.close();
        },
      },
      {
        key: 'close-right-tab',
        label: <span>关闭右侧标签</span>,
        onClick(e) {
          e.domEvent.stopPropagation();
          tab.closeRightTab();
        },
      },
      {
        key: 'close-other-tab',
        label: <span>关闭其他标签</span>,
        onClick(e) {
          e.domEvent.stopPropagation();
          tab.closeOtherTab();
        },
      },
    ];

    return { items: items.filter((m) => !!m) };
  }, []);

  return (
    <div className={styles.tabInfo}>
      <div className={styles.tabInfoTitle}>{tab.name}</div>

      {!!menu.items.length && (
        <Dropdown menu={menu} trigger={TAB_ADVANCE_MENU_TRIGGER as any}>
          <div className={styles.tabInfoMenu}>
            <CaretDownOutlined />
          </div>
        </Dropdown>
      )}
    </div>
  );
});

const useTabNavStyles = createStyles(({ token, css, cx }) => {
  return {
    tabInfo: css`
      display: flex;
      align-items: center;
    `,
    tabInfoTitle: css`
      font-size: 13px;
      font-weight: 500;
    `,
    tabInfoMenu: css`
      display: flex;
      justify-content: center;
      align-items: center;
      width: 22px;
      height: 22px;
      margin-left: 4px;

      &:hover {
        color: ${token.colorPrimary};
      }
    `,
  };
});

export const TabsLayoutPage: React.FC<{ model: ITabsLayoutPageModel; appHeader?: React.ReactNode }> = observer(
  (props) => {
    const { model, appHeader } = props;
    const { styles } = useStyles();

    return (
      <div className={styles.tabsLayout}>
        <div className={styles.tabsLayoutHeader}></div>
        <div className={styles.tabsLayoutContent}>
          <Tabs
            className={styles.tabsLayoutTabs}
            type="card"
            items={model.tabViews as any}
            activeKey={model.activedTab}
            size="small"
            tabBarStyle={TAB_NAV_STYLE}
            onTabClick={model.activeTab}
          />
        </div>
      </div>
    );
  },
);

TabsLayoutPage.displayName = 'TabsLayoutPage';

const useStyles = createStyles(({ token, css, cx }) => {
  return {
    tabsLayout: css`
      position: relative;
      display: flex;
      flex-flow: column nowrap;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #fff;
    `,
    tabsLayoutHeader: css`
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    `,
    tabsLayoutContent: css`
      position: relative;
      flex: 1;
      overflow: hidden;
      background-color: #f9fafc;
    `,
    tabsLayoutTabs: css`
      position: absolute;
      width: 100%;
      height: 100%;

      & > .ant-tabs-nav {
        background-color: #fff;
        margin-bottom: 0 !important;
        padding: 0 16px 0 30px !important;
      }

      & > .ant-tabs-nav > .ant-tabs-nav-wrap > .ant-tabs-nav-list > .ant-tabs-tab {
        margin-left: 0 !important;
        border-top-color: transparent !important;
        border-left-color: transparent !important;
        border-right-color: transparent !important;
        border-radius: 4px !important;
        background-color: #fff !important;
        user-select: none;
        color: #767e89;
      }

      & > .ant-tabs-nav > .ant-tabs-nav-wrap > .ant-tabs-nav-list > .ant-tabs-tab.ant-tabs-tab-active {
        border-top-color: #f0f0f0 !important;
        border-left-color: #f0f0f0 !important;
        border-right-color: #f0f0f0 !important;
        border-bottom-color: transparent !important;
        background-color: #f9fafc !important;
      }

      &
        > .ant-tabs-nav
        > .ant-tabs-nav-wrap
        > .ant-tabs-nav-list
        > .ant-tabs-tab.ant-tabs-tab-active
        > .ant-tabs-tab-btn {
        color: #121315;
        font-weight: 500;
      }

      & > .ant-tabs-content-holder > .ant-tabs-content {
        height: 100%;
      }

      & > .ant-tabs-content-holder > .ant-tabs-content > .ant-tabs-tabpane {
        height: 100%;
      }
    `,
  };
});
