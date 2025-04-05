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
}
