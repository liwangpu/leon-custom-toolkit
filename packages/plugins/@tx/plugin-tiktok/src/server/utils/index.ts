import { FingerprintGenerator } from 'fingerprint-generator';

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
