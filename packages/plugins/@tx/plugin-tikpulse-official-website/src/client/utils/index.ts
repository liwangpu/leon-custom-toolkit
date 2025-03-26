import { customAlphabet } from 'nanoid/non-secure';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);

export function GenerateShortId(prefix?: string, size = 8): string {
  return `${prefix || ''}_${nanoid(size)}`;
}
