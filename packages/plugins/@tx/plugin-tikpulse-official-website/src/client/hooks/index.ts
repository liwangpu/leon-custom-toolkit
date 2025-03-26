import { useRef } from 'react';

export function useClassNamePrefix(prefix: string) {
  return {
    rootClassName: prefix,
    classPrefix: (...classnames) => classnames.map((c) => `${prefix}${c}`).join(' '),
  };
}

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
