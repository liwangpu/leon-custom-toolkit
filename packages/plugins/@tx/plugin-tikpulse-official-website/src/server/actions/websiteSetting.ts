import { Plugin } from '@nocobase/server';
import { Context } from '@nocobase/actions';
import { isNil } from 'lodash';

const WEBSITE_SETTING_RECORD_KEY = 'default';

export const registerWebsiteSettingActions = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.resourceManager.define({
    name: 'officalWebsiteSetting',
    actions: {
      submitSetting: submitSetting(),
      setting: setSetting(),
    },
  });
  app.acl.allow('officalWebsiteSetting', '*', 'loggedIn');
};

const setSetting = () => {
  return async (ctx: Context, next: () => any) => {
    const officialWebSiteSettingRep = ctx.db.getRepository('officialWebSiteSetting');

    const record = await officialWebSiteSettingRep.findByTargetKey(WEBSITE_SETTING_RECORD_KEY);
    ctx.withoutDataWrapping = true;
    ctx.body = record;
  };
};

const submitSetting = () => {
  return async (ctx: Context, next: () => any) => {
    const setting = ctx.request.body as any;

    const officialWebSiteSettingRep = ctx.db.getRepository('officialWebSiteSetting');

    const record = await officialWebSiteSettingRep.findByTargetKey(WEBSITE_SETTING_RECORD_KEY);
    if (isNil(record)) {
      await officialWebSiteSettingRep.create({
        values: {
          setting,
          key: WEBSITE_SETTING_RECORD_KEY,
        },
      });
    } else {
      await officialWebSiteSettingRep.update({
        filterByTk: WEBSITE_SETTING_RECORD_KEY,
        values: {
          setting,
        },
      });
    }

    next();
  };
};
