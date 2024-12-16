/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { APIClient } from '@nocobase/client';
import { flow, makeObservable, observable } from 'mobx';
import { isNil } from 'lodash';
import ColorHash from 'color-hash';

const colorHash = new ColorHash({ saturation: 0.6, lightness: 0.5 });

export interface ICooperationFile {
  id?: number;
  title: string;
  isFolder?: boolean;
  fileLink?: string;
  remark?: string;
  parentId?: number;
  /**
   * 前端冗余字段
   */
  tiers?: number;
  color?: string;
  permissions?: string[];
}

const allowEditRoles = new Set(['root', 'admin']);

export class CooperationManagementStore {
  public fileMap = new Map<number, ICooperationFile>();
  public fileChildrenMap = new Map<number, number[]>();
  public folderSet = new Set<number>();
  public allowEdit = false;
  public constructor(protected props: { apiClient: APIClient }) {
    makeObservable(this, {
      fileMap: observable,
      fileChildrenMap: observable,
      folderSet: observable,
      allowEdit: observable,
      getFiles: flow,
      deleteFile: flow,
      submitFile: flow,
    });
    const currentRole = props.apiClient.storage.getItem('NOCOBASE_ROLE');
    this.allowEdit = allowEditRoles.has(currentRole);
  }

  public getFiles = flow(function* (this: CooperationManagementStore) {
    const { apiClient } = this.props;
    const currentRole = apiClient.storage.getItem('NOCOBASE_ROLE');

    const isAdmin = currentRole === 'root' || currentRole === 'admin';
    const {
      data: { data },
    } = yield apiClient.request({
      url: 'cooperationFile:list',
      method: 'GET',
      params: {
        pageSize: 1000,
        page: 1,
        appends: ['permissions'],
        filter: { $and: [{ isDeleted: { $isFalsy: true } }] },
      },
    });
    this.fileMap.clear();
    this.fileChildrenMap.clear();
    this.folderSet.clear();
    let files: any[] = data;

    if (!isAdmin) {
      files = files.filter((d) => {
        const permissions: any[] = d.permissions;
        if (!permissions || !permissions.length) return true;
        return permissions.some((p) => p.name === currentRole);
      });
    }

    for (const f of files) {
      if (!isNil(f.parentId)) {
        this.addChildren(f.parentId, f.id);
      }
      this.fileMap.set(f.id, { ...f, permissions: f.permissions?.map((p) => p.name) || [] });
      if (f.isFolder) {
        this.folderSet.add(f.id);
      }
    }

    const traceTiers = (fileId: number) => {
      const file = this.fileMap.get(fileId);
      const parent = isNil(file.parentId) ? null : this.fileMap.get(file.parentId);
      let tiers: number;
      if (parent) {
        if (isNil(parent.tiers)) {
          traceTiers(parent.id);
        }

        tiers = (parent.tiers as number) + 1;
      } else {
        tiers = 1;
      }
      file.tiers = tiers;
      file.color = colorHash.hex(`primary${tiers}`);
      this.fileMap.set(fileId, file);
    };

    for (const f of files) {
      traceTiers(f.id);
    }
    // console.log(
    //   `title:`,
    //   JSON.parse(
    //     JSON.stringify([...this.fileMap.values()].map((f) => ({ title: f.title, tiers: f.tiers, color: f.color }))),
    //   ),
    // );
  });

  public submitFile = flow(function* (this: CooperationManagementStore, file: ICooperationFile) {
    const { apiClient } = this.props;
    const permissions = file.permissions?.map((p) => ({ name: p })) || [];
    if (isNil(file.id)) {
      const {
        data: { data: res },
      } = yield apiClient.request({
        url: 'cooperationFile:create',
        method: 'POST',
        data: { ...file, permissions },
      });
      console.log(`res:`, res);
    } else {
      const {
        data: { data: res },
      } = yield apiClient.request({
        url: 'cooperationFile:update',
        method: 'POST',
        params: {
          filterByTk: file.id,
        },
        data: { ...file, permissions },
      });
      console.log(`res:`, res);
    }
    yield this.getFiles();
  });

  public deleteFile = flow(function* (this: CooperationManagementStore, fileId: number) {
    const { apiClient } = this.props;

    yield apiClient.request({
      url: 'cooperationFile:update',
      method: 'POST',
      params: {
        filterByTk: fileId,
      },
      data: {
        // ...this.fileMap.get(fileId),
        id: fileId,
        isDeleted: true,
      },
    });

    yield this.getFiles();
  });

  private addChildren(parentId: number, fileId: number) {
    const children = this.fileChildrenMap.get(parentId) || [];
    children.push(fileId);
    this.fileChildrenMap.set(parentId, children);
  }
}
