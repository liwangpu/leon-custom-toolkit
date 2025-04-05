import { Plugin } from '@nocobase/client';
import { registerQRCode } from './QRCode';

export const registerComponents = (props: { plugin: Plugin }) => {
  registerQRCode(props);
};
