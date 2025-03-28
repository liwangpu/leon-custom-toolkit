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

export interface IAlipaySetting {
  /**
   * 应用 ID
   */
  appId?: string;
  /**
   * 应用私钥
   */
  privateKey?: string;
  /**
   * 支付宝公钥
   */
  alipayPublicKey?: string;
}

/**
 * 付款费用信息
 */
export interface IPaymentCost {
  /**
   * 商户订单号
   */
  outTradeNo?: string;
  organizationId?: number;
  /**
   * 账单名称
   */
  name: string;
  /**
   * 付款金额
   */
  amount: number;
  /**
   * 详情预览地址
   */
  detailUrl?: string;
  /**
   * 支付方式
   */
  paymentType?: string;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 该请求是否已经处理
   */
  feedback?: boolean;
  /**
   * 附加参数
   */
  extra?: Array<any> | Record<string, any>;
}

export interface IPaidService {
  id?: number;
  name?: string;
  price?: number;
  remark?: string;
}

export interface IServicePackage {
  id?: number;
  name?: string;
  price?: number;
  services?: Array<IPaidService>;
  remark?: string;
}

export interface IOrganizationPaidService {
  id?: number;
  organizationId?: number;
  serviceId?: number;
  name?: string;
  price?: number;
  remark?: string;
  purchasingDate?: string;
  expirationDate?: string;
}

export interface IOrganizationServicePackage {
  id?: number;
  organizationId?: number;
  packageId?: number;
  name?: string;
  price?: number;
  services?: Array<IOrganizationPaidService>;
  purchasingDate?: string;
  expirationDate?: string;
  remark?: string;
}

/**
 * 购买套餐信息
 */
export interface IServicePackagePurchaseOrder {
  /**
   * 要购买的套餐Id
   */
  servicePackageId: number;
  purchaseDuration: string;
}
