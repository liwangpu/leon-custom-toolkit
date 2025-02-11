import { Context } from '@nocobase/actions';
import { FingerprintGenerator } from 'fingerprint-generator';
import { isNil, merge } from 'lodash';
import path from 'path';

export function generateBrowserFingerprint(props: { language: string }) {
  const { language } = props;
  const fingerprint = new FingerprintGenerator({
    browsers: ['chrome'],
    devices: ['desktop'],
    operatingSystems: ['windows'],
    locales: [language],
  });
  return fingerprint.getFingerprint();
}

export function changeCurrentUserContext(ctx: Context, userId: any) {
  return merge({}, ctx, { state: { currentUser: { id: userId } } });
}

export function getExtension(filePath: string) {
  if (isNil(filePath)) return null;
  return path.extname(filePath).substring(1);
}
