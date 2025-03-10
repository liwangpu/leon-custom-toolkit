import { floor, isNil } from 'lodash';
import { Plugin } from '@nocobase/server';
import { getUserInfo } from './common';

export function searchTermDetailMiddeware(plugin: Plugin) {
  // const { db } = plugin;
  const ignoreActions = new Set(['get', 'list', 'view']);
  return async (ctx: any, next: () => Promise<any>) => {
    const { resourceName, actionName } = getUserInfo({
      ctx,
    });
    const doNext = () => {
      return next();
    };
    if (resourceName !== 'tk_grow_fans_plan.searchTermDetail') return doNext();
    if (ignoreActions.has(actionName)) return doNext();
    // params 格式是 {filterByTk:number;resourceName:string;actionName:string;values:any;filter:any}
    const params = ctx.action.params;
    const { values, associatedName, associatedIndex: planId } = params || {};
    if (isNil(associatedName) || isNil(planId)) return doNext();
    // associatedName是养号计划的resourceName信息,associatedIndex是养号计划Id
    // console.log(`---------[ searchTermDetailMiddeware ]---------`);
    // console.log(`resourceName:`, resourceName);
    // console.log(`associatedName:`, associatedName);
    // console.log(`actionName:`, actionName);
    // console.log(`params:`, params);
    // console.log(`values:`, values);
    await next();

    const planRepo = ctx.db.getRepository('tk_grow_fans_plan');

    const plan = await planRepo.findOne({
      filterByTk: planId,
      appends: ['searchTermDetail'],
    });

    const planDetails: Array<any> = plan.searchTermDetail || [];
    let totalSerchTermCount = 0;
    let totalVideoCount = 0;
    let watchVideoCount = 0;
    let watchVideoTime = 0;
    for (const detail of planDetails) {
      totalSerchTermCount++;
      totalVideoCount += detail.watchGoal;
      watchVideoCount += detail.watchCount;
      watchVideoTime += detail.watchTime;
    }
    let executingPercentage = totalVideoCount > 0 ? floor(watchVideoCount / totalVideoCount, 2) : 0;
    if (executingPercentage > 1) {
      executingPercentage = 1;
    }
    const completedFlag = executingPercentage >= 1;

    const partialPlan: { [key: string]: any } = {
      totalSerchTermCount,
      totalVideoCount,
      watchVideoCount,
      watchVideoTime,
      executingPercentage,
      completedFlag,
    };

    if (completedFlag) {
      partialPlan.status = 'completed';
    }
    await planRepo.update({
      filterByTk: planId,
      values: partialPlan,
    });
  };
}
