import { Context } from '@nocobase/actions';
import { FingerprintGenerator } from 'fingerprint-generator';
import { isNil, merge, floor } from 'lodash';
import path from 'path';
import fs from 'fs';
import VideoLib from 'node-video-lib';

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

export function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    fs.open(filePath, 'r', (err, fd) => {
      if (!isNil(err)) {
        reject(err);
        return;
      }
      const movie = VideoLib.MovieParser.parse(fd);
      const duration = floor(movie.relativeDuration());
      fs.close(fd);
      resolve(duration);
    });
  });
}

export * from './tkFeedbackPage';
