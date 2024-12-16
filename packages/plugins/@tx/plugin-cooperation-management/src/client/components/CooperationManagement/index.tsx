/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { CooperationManagementStore, ICooperationFile } from '../../models';
import { createStyles, useAPIClient } from '@nocobase/client';
import { Button, Checkbox, Form, Input, Modal, Spin, Switch, Tree, TreeSelect } from 'antd';
import { isNil } from 'lodash';
import {
  ChromeOutlined,
  DeleteOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  EditOutlined,
  FileTextOutlined,
  FolderTwoTone,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { TreeDataNode } from 'antd';
import { useEvent, useTranslate } from '../../hooks';
import { ITabDefinition, TabsLayoutPage, useTabsLayoutPageModel } from '../TabsLayoutPage';
import CooperationAnnouncement from '../CooperationAnnouncement';
import { values } from 'mobx';
import { Menu, Item, useContextMenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import classNames from 'classnames';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

const { Search } = Input;
const MENU_ID = 'blahblah';

export const ANNOUNCEMENT_VIEW: ITabDefinition = {
  key: 'announcement',
  name: '公告',
  children: ({ tab, dataId }) => <CooperationAnnouncement />,
  closable: false,
};

const defaultRoles = new Set(['root', 'member']);

const requiredRules = [{ required: true, message: '该项为必填信息!' }];
const CooperationManagement: React.FC = observer((props) => {
  const { styles } = useStyles();
  const apiClient = useAPIClient();
  const { tt } = useTranslate();

  const store = useMemo(() => new CooperationManagementStore({ apiClient }), []);
  const files = values<any, ICooperationFile>(store.fileMap as any);
  const fileMap = store.fileMap;
  const fileChildrenMap = store.fileChildrenMap;
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [selectedKey, setSelectedKey] = useState<number>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<string>();
  const [contentCollapsed, setContentCollapsed] = useState<boolean>(false);
  const [roleOptions, setRoleOptions] = useState<any[]>([]);
  const panelRef = useRef<any>();
  const tabsModel = useTabsLayoutPageModel({
    pageName: '文档管理',
    tabs: [ANNOUNCEMENT_VIEW],
  });
  const { show } = useContextMenu({
    id: MENU_ID,
  });
  const allowEdit = store.allowEdit;

  function handleContextMenu(event: any, file: ICooperationFile) {
    show({
      event,
      props: {
        fileId: file.id,
      },
    });
  }

  const handleItemClick = useEvent(async ({ id, event, props }) => {
    console.log(`props:`, props);
    if (!props) {
      return;
    }
    const { fileId } = props;
    const file = fileMap.get(fileId);
    switch (id) {
      case 'edit':
        form.resetFields();
        form.setFieldsValue({ ...file });
        setIsModalOpen(true);
        break;
      case 'delete':
        form.resetFields();
        await store.deleteFile(fileId);
        tabsModel.closeTab(`${fileId}`);
        break;
      case 'browserOpen':
        if (file.isFolder) return;
        window.open(file.fileLink);
        break;
    }
  });

  const onSearchChange = useEvent((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const newExpandedKeys = files
      .map((item) => {
        if (item.title.indexOf(value) > -1) {
          return item.parentId;
        }
        return null;
      })
      .filter((item: any, i, self) => !!(item && self.indexOf(item) === i));
    setExpandedKeys(newExpandedKeys);
    setSearchValue(value);
    setAutoExpandParent(true);
  });

  const allNodes = useMemo(() => {
    const loop = (data: ICooperationFile[]): TreeDataNode[] =>
      data.map((item) => {
        const strTitle = item.title as string;
        const index = strTitle.indexOf(searchValue);
        const beforeStr = strTitle.substring(0, index);
        const afterStr = strTitle.slice(index + searchValue.length);
        const icon = item.isFolder ? (
          <FolderTwoTone className={styles.menuIcon} />
        ) : (
          <FileTextOutlined className={styles.menuIcon} />
        );
        const title =
          index > -1 ? (
            <span key={item.id}>
              {beforeStr}
              <span className={styles.searchKeyword}>{searchValue}</span>
              {afterStr}
            </span>
          ) : (
            <span key={item.id}>{strTitle}</span>
          );
        const childrenIds = fileChildrenMap.get(item.id) || [];
        const children = loop(childrenIds.map((cid) => fileMap.get(cid)));

        return {
          title: (
            <div
              onContextMenu={(e) => handleContextMenu(e, item)}
              style={{ color: item.isFolder ? item.color : undefined }}
            >
              {icon}
              {title}
            </div>
          ),
          key: item.id,
          tiers: item.tiers,
          children,
        };
      });
    return loop(files.filter((f) => isNil(f.parentId)) as any);
  }, [files, fileChildrenMap]);

  const allFolderNodes = useMemo(() => {
    const nodes: TreeDataNode[] = [];
    const loop = (file: ICooperationFile, onlyFolder?: boolean): any => {
      const children: any[] = (fileChildrenMap.get(file.id) || [])
        .map((fid) => {
          const it = fileMap.get(fid);
          if (onlyFolder && !it.isFolder) {
            return null;
          }
          return loop(it, onlyFolder);
        })
        .filter((it) => !isNil(it));

      return {
        value: file.id,
        title: file.title,
        tiers: file.tiers,
        children,
      };
    };
    for (const file of files.filter((f) => isNil(f.parentId) && f.isFolder)) {
      nodes.push(loop(file, true));
    }
    return nodes;
  }, [files, fileChildrenMap]);

  const onExpand = useEvent((newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  });

  const handleAddFile = useEvent(() => {
    form.resetFields();
    form.setFieldValue('parentId', selectedKey);
    setIsModalOpen(true);
  });

  const handleOk = useEvent(async () => {
    try {
      await form.validateFields();
      form.submit();
      setIsModalOpen(false);
    } catch (error) {
      console.log(`err:`, error);
    }
  });

  const handleCancel = useEvent(() => {
    setIsModalOpen(false);
  });

  const handleRefreshFiles = useEvent(() => {
    (async () => {
      setLoading(true);
      await store.getFiles();
      setExpandedKeys([...store.fileMap.keys()]);

      setLoading(false);
    })();
  });

  const handleSubmitEdit = useEvent(async (formData: ICooperationFile) => {
    // console.log(`formData:`, formData);
    if (!allowEdit) return;
    setLoading(true);
    try {
      await store.submitFile(formData);
      if (!isNil(formData.id)) {
        tabsModel.updateTab(`${formData.id}`, { name: formData.title, dataId: formData.fileLink });
      }
    } catch (error) {
      console.log(`error:`, error);
    }
    setLoading(false);
  });

  const renderFrame = (src: string) => {
    // return <div>src:{src}</div>;
    return <iframe src={src} className={styles.frameContainer} />;
  };

  const handleAddTab = useEvent((file: ICooperationFile) => {
    tabsModel.addTab({
      key: `${file.id}`,
      name: file.title,
      dataId: file.fileLink,
      closable: true,
      children: ({ dataId }) => renderFrame(dataId),
    });
  });

  const handleDragChange = useEvent((param: any) => {
    let parentNodeId = param.node.key;
    const currentNodeId = param.dragNode.key;
    if (!isNil(parentNodeId)) {
      const parentNode = fileMap.get(parentNodeId);
      if (!parentNode.isFolder) {
        parentNodeId = parentNode.parentId;
      }
    }
    const currentNode = fileMap.get(currentNodeId);
    store.submitFile({ ...currentNode, parentId: parentNodeId });
  });

  const handleOnSelect = useEvent((keys: string[] = []) => {
    const selectedKey = keys[0];
    const selectedId: number = isNil(selectedKey) ? null : Number(selectedKey);
    setSelectedKey(selectedId);
    if (isNil(selectedKey)) return;

    const selectedItem = store.fileMap.get(selectedId);
    if (selectedItem.isFolder) return;
    handleAddTab(selectedItem);
  });

  const handleToggleContentCollapsed = useEvent((param: any) => {
    const panel = panelRef.current;
    if (contentCollapsed) {
      panel.expand();
    } else {
      panel.collapse();
    }
    setContentCollapsed((pre) => !pre);
  });

  useEffect(() => {
    setCurrentRole(apiClient.storage.getItem('NOCOBASE_ROLE'));
    handleRefreshFiles();
    (async () => {
      const {
        data: { data: _roles },
      } = await apiClient.request({
        url: 'roles:list',
        method: 'GET',
      });

      const roles = (_roles as any[])
        .filter((r) => !defaultRoles.has(r.name))
        .map((r) => ({ value: r.name, label: tt(r.title) }));
      setRoleOptions(roles);
    })();
  }, []);

  const renderEditForm = () => {
    return (
      <Form
        name="basic"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        form={form}
        onFinish={handleSubmitEdit}
        autoComplete="off"
      >
        <Form.Item noStyle name="id"></Form.Item>
        <Form.Item label="标题" name="title" rules={requiredRules}>
          <Input allowClear />
        </Form.Item>
        <Form.Item label="上级节点" name="parentId">
          <TreeSelect showSearch allowClear treeDefaultExpandAll treeData={allFolderNodes} />
        </Form.Item>
        <Form.Item label="文件夹" name="isFolder" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item noStyle dependencies={['isFolder']}>
          {({ getFieldValue }) => {
            const isFolder = getFieldValue('isFolder');
            if (isFolder) return;

            return (
              <Form.Item label="链接地址" name="fileLink" rules={requiredRules}>
                <Input />
              </Form.Item>
            );
          }}
        </Form.Item>
        <Form.Item label="权限" name="permissions">
          <Checkbox.Group options={roleOptions} />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input.TextArea />
        </Form.Item>
      </Form>
    );
  };

  return (
    <div className={styles.page}>
      <PanelGroup direction="horizontal">
        <Panel id="left-panel" defaultSize={18} maxSize={42} collapsible={true} ref={panelRef}>
          <div className={styles.pageNav}>
            <div className={styles.pageNavHeader}>
              <Search placeholder="输入关键词" allowClear onChange={onSearchChange} />
              <Button className={styles.headBtn} icon={<ReloadOutlined />} onClick={handleRefreshFiles} />
              <Button className={styles.headBtn} type="primary" icon={<PlusOutlined />} onClick={handleAddFile} />

              <Modal title="编辑节点" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                {renderEditForm()}
              </Modal>
            </div>
            <div className={styles.pageNavContent}>
              <Tree
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                treeData={allNodes}
                onSelect={handleOnSelect}
                onDrop={handleDragChange}
                blockNode
                showLine
                draggable={allowEdit}
              />
              <Menu id={MENU_ID}>
                <Item
                  id="edit"
                  onClick={handleItemClick}
                  className={classNames({
                    [styles.hidden]: !allowEdit,
                  })}
                >
                  <EditOutlined className={styles.menuIcon} />
                  <span>编辑</span>
                </Item>
                <Item
                  id="delete"
                  onClick={handleItemClick}
                  className={classNames({
                    [styles.hidden]: !allowEdit,
                  })}
                >
                  <DeleteOutlined className={styles.menuIcon} />
                  <span>删除</span>
                </Item>
                <Item
                  id="browserOpen"
                  onClick={handleItemClick}
                  // className={classNames({
                  //   // [styles.hidden]: allowEdit,
                  // })}
                >
                  <ChromeOutlined className={styles.menuIcon} />
                  <span>浏览器打开</span>
                </Item>
              </Menu>
            </div>
          </div>
        </Panel>
        <PanelResizeHandle id="resize-handle" className={styles.resizer} />
        <Panel id="right-panel">
          <div className={styles.pageContent}>
            <Button
              type="text"
              size="small"
              icon={contentCollapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
              className={styles.collapseBtn}
              onClick={handleToggleContentCollapsed}
            />
            <TabsLayoutPage model={tabsModel} />
          </div>
        </Panel>
      </PanelGroup>
      <div
        className={classNames(styles.loadingContainer, {
          [styles.hidden]: !loading,
        })}
      >
        <Spin />
      </div>
    </div>
  );
});

CooperationManagement.displayName = 'CooperationManagement';

export default CooperationManagement;

const useStyles = createStyles(({ token, css, cx }) => {
  return {
    resizer: css`
      display: block;
      width: 2px;
      background-color: ${token.colorBorder};
    `,
    collapseBtn: css`
      position: absolute;
      top: 6px;
      left: 4px;
      z-index: 999;
    `,
    page: css`
      position: relative;
      display: flex;
      flex-flow: row;
      width: 100%;
      height: 100%;
    `,
    pageNav: css`
      position: relative;
      display: flex;
      flex-flow: column;
      width: 100%;
      height: 100%;
      // border-right: 1px solid ${token.colorBorder};
      min-width: 200px;
    `,
    pageNavHeader: css`
      display: flex;
      flex-flow: row;
      justify-content: center;
      align-items: center;
      gap: 0 6px;
      padding: 12px 12px 6px;
    `,
    pageNavContent: css`
      flex: 1;
      display: flex;
      flex-flow: column;
      width: 100%;
      height: 100%;
      padding: 6px 12px 12px;
      min-width: 100px;
      overflow: auto;

      & .ant-tree-draggable-icon {
        display: none !important;
      }
    `,
    pageContent: css`
      position: relative;
      flex: 1;
      display: flex;
      flex-flow: column;
      align-items: center;
      width: 100%;
      height: 100%;
      // background-color: orange;
    `,
    frameContainer: css`
      width: 100%;
      height: 100%;
      border: none;
      overflow: hidden;
    `,
    menuIcon: css`
      margin-right: 8px;
    `,
    searchKeyword: css`
      color: #fff;
      background-color: ${token.colorPrimary};
      border-radius: 4px;
    `,
    headBtn: css`
      flex: 0 0 auto;
    `,
    loadingContainer: css`
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      z-index: 9;
      background-color: rgba(0, 0, 0, 0.3);
    `,
    maxWith: css`
      width: 100%;
    `,
    hidden: css`
      display: none !important;
    `,
  };
});
