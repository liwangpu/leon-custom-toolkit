import { isNil } from 'lodash';
import { generateBrowserFingerprint } from '../utils';
import Database from '@nocobase/database';

export function afterAccountCreateOrUpdate(props: { db: Database }) {
  const { db } = props;
  return async (account, options) => {
    if (isNil(account.LanguageId) || !isNil(account.fingerprint)) return;
    const languageRep = db.getRepository('tk_language');
    const lang = await languageRep.findById(account.LanguageId);
    if (isNil(lang.language)) return;
    account.fingerprint = generateBrowserFingerprint({ language: lang.language });
  };
}
