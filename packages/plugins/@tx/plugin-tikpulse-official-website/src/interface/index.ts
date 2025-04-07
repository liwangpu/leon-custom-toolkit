export interface IWebsiteSetting {
  /**
   * 咨询电话
   */
  hotline?: string;
  /**
   * 微信客服二维码
   */
  wechatServieQRCode?: string;
  /**
   * 免费试用天数
   */
  trialDays?: number;
}

export interface IPackage {
  id?: number;
  name: string;
  description?: string;
  price?: number;
  annualPrice?: number;
  needPurchase?: boolean;
  features?: string[];
  remark?: string;
}
