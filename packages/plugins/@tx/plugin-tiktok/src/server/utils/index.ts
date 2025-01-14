import actions, { Context } from '@nocobase/actions';
import Application from '@nocobase/server';
import { FingerprintGenerator } from 'fingerprint-generator';
import { floor, merge } from 'lodash';

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
