export interface IPostingResourceRelease {
  id?: number;
  title: string;
  content?: string;
  remark?: string;
  sourceResourceId: number;
  attachment?: any;
  accounts?: Array<any>;
  organizationId?: number;
  [key: string]: any;
}

export interface IPostingResource {
  id?: number;
  title: string;
  content?: string;
  remark?: string;
  latestCalculateAttachmentId?: number;
  attachment?: any;
  duration?: number;
  organizationId?: number;
  [key: string]: any;
}

export interface ITKToken {
  id?: number;
  token_type: string;
  open_id: string;
  scope: string;
  access_token: string;
  refresh_token: string;
  expires_in: string;
  refresh_expires_in: string;
  updatedAt: string;
  accountId: number;
}
