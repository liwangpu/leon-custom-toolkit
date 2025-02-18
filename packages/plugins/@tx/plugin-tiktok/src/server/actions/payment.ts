import { Context } from '@nocobase/actions';

export function makePayment() {
  return async (ctx: Context, next: () => any) => {
    const { type, paymentId } = (ctx.query as any) || {};

    ctx.redirect('https://www.jd.com');
    console.log(`---------[ payment ]---------`);
    console.log(`type:`, type);
    console.log(`paymentId:`, paymentId);
  };
}
