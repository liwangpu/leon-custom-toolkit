const PROD_API_BASE_URL = 'https://astrolabe.taixiang-tech.com';
// 为了方便tiktok api调试,需要自己映射一个域名到本地开发环境
const DEV_API_BASE_URL = 'https://astrolabe-dev.taixiang-tech.com';

export function isDevEnv() {
  const noProcess = typeof process === 'undefined';
  if (noProcess) {
    return true;
  }
  return process.env?.APP_ENV === 'development';
}

export function getTiktokAPIBaseUrl() {
  const isDev = isDevEnv();
  return isDev ? DEV_API_BASE_URL : PROD_API_BASE_URL;
}
