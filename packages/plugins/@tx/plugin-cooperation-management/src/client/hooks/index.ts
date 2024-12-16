/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export type Noop = (...args: any[]) => any;

export function useEvent<F extends Noop>(fn: F): F {
  const ref = useRef<{
    memo: F;
    origin: F;
  }>({
    memo: ((...args: any[]): any => {
      return ref.current.origin(...args);
    }) as F,
    origin: fn,
  });
  ref.current.origin = fn;
  return ref.current.memo;
}

const LANG_REG = /\{\{t.+?\}\}/;
export function useTranslate() {
  const { t } = useTranslation();
  const tt = (words: string) => {
    if (!words) return words;
    if (!LANG_REG.test(words)) return t(words);
    return eval(words);
  };
  return {
    tt,
  };
}
