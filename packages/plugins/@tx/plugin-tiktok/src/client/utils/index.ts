import { floor, isNil, isNumber } from 'lodash';

export function formatEnglishNumber(num) {
  if (isNil(num) || !isNumber(num)) return 0;
  if (num >= 1000000000) {
    return Math.floor((num / 1000000000) * 100) / 100 + 'B';
  } else if (num >= 1000000) {
    return Math.floor((num / 1000000) * 100) / 100 + 'M';
  } else if (num >= 1000) {
    return Math.floor((num / 1000) * 100) / 100 + 'K';
  } else {
    return Math.floor(num).toString();
  }
}

// 获取当前数值两倍的整数 比如 476789.6 会得到 900000
export function getWofoldMaxNumber(num: number) {
  if (isNil(num)) return 0;
  const dou = floor(num * 3);
  return floor(dou, -(`${dou}`.length - 1));
}

export function pickProperty(obj: Record<string, any>, property: any, defaultValue?: any): any[] {
  if (isNil(obj) || isNil(property)) return [];
  return obj[property] || defaultValue;
}
