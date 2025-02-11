import { useRef } from 'react';

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
