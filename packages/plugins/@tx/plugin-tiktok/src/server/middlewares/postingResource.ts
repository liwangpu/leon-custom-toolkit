import { isArray, isNil } from 'lodash';
import { Plugin } from '@nocobase/server';
import { getUserInfo } from './common';

export function postingResourceReleaseMiddeware(plugin: Plugin) {
  const { db } = plugin;

  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName, organizationId } = getUserInfo({
      ctx,
    });
    if (resourceName !== 'tk_posting_resource_release' || actionName !== 'create') return await next();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { values } = params;
    const {
      sourceResourceId,
      accounts,
      attachment: _attachment,
    } = values as { sourceResourceId?: number; accounts: Array<any>; attachment?: any };
    if (_attachment) return await next();

    if (isNil(sourceResourceId)) return;
    const resourceRep = db.getRepository('tk_posting_resource');
    const releaseRep = db.getRepository('tk_posting_resource_release');
    const resource = await resourceRep.findOne({
      filterByTk: sourceResourceId,
      appends: ['attachment'],
    });

    const attachment =
      isArray(resource.attachment) && resource.attachment.length ? resource.attachment[0] : resource.attachment;

    const mergeParamsValues: { [key: string]: any } = {
      organizationId,
    };

    if (attachment) {
      // 别直接用attachment,因为会造成死循环,可以结构,或者直接用dataValues
      // 切记,切记,切记
      mergeParamsValues.attachment = attachment.dataValues;
    }

    ctx.action.mergeParams({
      values: mergeParamsValues,
    });

    if (isArray(accounts) && accounts.length > 1) {
      const firstAccount = accounts[0];
      mergeParamsValues.accounts = [firstAccount];
      const restAccounts = accounts.slice(1);
      for (const acc of restAccounts) {
        const data = {
          ...values,
          id: null,
          organizationId,
          attachment: attachment.dataValues,
          accounts: [acc],
        };

        releaseRep.create({
          values: data,
        });
      }
    }
    ctx.action.mergeParams({
      values: mergeParamsValues,
    });
    await next();
  };
}
