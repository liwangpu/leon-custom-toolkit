import { Context } from '@nocobase/actions';
import { isNil } from 'lodash';
import { Plugin } from '@nocobase/server';

export const registerProxySubscriptionActions = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app } = plugin;

  app.resourceManager.define({
    name: 'proxySubscription',
    actions: {
      subscribe: getSubcription(),
      doTranslate: doTranslate(),
    },
  });
  app.acl.allow('proxySubscription', '*', 'public');
};

function getSubcription() {
  return async (ctx: Context, next: () => any) => {
    const { noid } = ctx.request.query as any;

    const proxySubcriptionRepo = ctx.db.getRepository('proxySubscription');

    const subscription = await proxySubcriptionRepo.findOne({
      filter: {
        noid,
        enabled: true,
      },
    });

    const readable = require('stream').Readable;
    const s = new readable();

    if (!subscription) {
      s.push(null); // indicates end of the stream
      ctx.body = s;
      return await next();
    }

    const subscriptionNodeRepo = ctx.db.getRepository('subscriptionNode');
    const nodes: any[] = await subscriptionNodeRepo.find({
      filter: {
        subcription_id: subscription.id,
        enabled: true,
        path: {
          $ne: null,
        },
      },
    });

    const paths = nodes.map((n) => n.path).join(`\n`);

    s.push(paths);
    s.push(null); // indicates end of the stream
    ctx.body = s;
    await next();
  };
}

function doTranslate() {
  return async (ctx: Context, next: () => any) => {
    const collectionRepo = ctx.db.getRepository('collections');
    const fieldRepo = ctx.db.getRepository('fields');
    const cols = await collectionRepo.find({
      filter: {},
    });

    const localeJson: { [key: string]: any } = {};
    const collectionNames = [];
    for (const col of cols) {
      const title: string = col.title;
      if (title.includes('{{')) {
        continue;
      }
      collectionNames.push(title);
      const key = col.key || col.id;
      const trTitle = `{{t("${title}",{ns:"@tx/plugin-tiktok"})}}`;
      localeJson[title] = title;
      await collectionRepo.update({
        filter: {
          key,
        },
        values: {
          title: trTitle,
        },
      });
    }
    const fields: Array<any> = await fieldRepo.find({
      filter: {},
    });
    for (const f of fields) {
      let options = f.options;
      if (isNil(options)) continue;
      let uiSchema = options.uiSchema;
      if (isNil(uiSchema)) continue;
      const title: string = uiSchema.title;
      if (title.includes('{{')) continue;

      const trTitle = `{{t("${title}",{ns:"@tx/plugin-tiktok"})}}`;
      uiSchema = { ...uiSchema, title: trTitle };
      options = { ...options, uiSchema };
      localeJson[title] = title;
      await fieldRepo.update({
        filter: {
          key: f.key,
        },
        values: {
          options,
        },
      });
    }

    ctx.body = {
      localeJson,
    };
  };
}
