export interface IAliyunSmsSetting {
  key?: string;
  accessKeyID?: string;
  accessKeySecret?: string;
}

export interface INormalSmsProps {
  phone: string;
  signName: string;
  templateCode: string;
  params: Record<string, any>;
  /**
   * 短信验证的key,如果有此参数,那么在params里面要有个code字段,即可做短信校验功能
   */
  verificationKey?: string;
}

export interface ISmsVerificationData {
  verificationKey: string;
  verificationCode: string;
}
