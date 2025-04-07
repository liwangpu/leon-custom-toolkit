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
      setting: getSetting(),
      packages: getPackages(),
    },
  });
  app.acl.allow('officalWebsiteSetting', '*', 'public');
  app.acl.allow('officalWebsiteSetting', 'setting', 'loggedIn');
};

const getSetting = () => {
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

const getPackages = () => {
  return async (ctx: Context, next: () => any) => {
    const servicePackageRep = ctx.db.getRepository('servicePackage');
    const paidServiceRep = ctx.db.getRepository('paidService');
    const packages = await servicePackageRep.find({
      filter: {
        $and: [{ enable: { $isTruly: true } }],
      },
      sort: 'order',
    });
    const services = await paidServiceRep.find({
      filter: {
        $and: [{ packages: { id: { $empty: true } } }, { enable: { $isTruly: true } }],
      },
      sort: 'order',
    });
    // const record = await officialWebSiteSettingRep.findByTargetKey(WEBSITE_SETTING_RECORD_KEY);
    ctx.withoutDataWrapping = true;
    ctx.body = {
      packages,
      services,
    };
  };
};
