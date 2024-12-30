import { Context, Next } from '@nocobase/actions';
import { response } from './response';
import { start } from './start';

export async function trigger(ctx: Context, next: Next) {
  await start(ctx);
  await response(ctx, next);
}
