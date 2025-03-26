import { Plugin } from '@nocobase/server';
import { Context } from '@nocobase/actions';
import { isNil } from 'lodash';

export const registerAssetsActions = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.resourceManager.define({
    name: 'officialWebsite',
    actions: {
      config: getOfficialConfig(),
    },
  });
  app.acl.allow('officialWebsite', '*', 'public');
};

const getOfficialConfig = () => {
  return async (ctx: Context, next: () => any) => {
    const configSettingRep = ctx.db.getRepository('configSetting');
    const setting = await configSettingRep.findByTargetKey('officialWebsite');
    ctx.withoutDataWrapping = true;
    ctx.body = {
      ...setting.value,
    };
  };
};
