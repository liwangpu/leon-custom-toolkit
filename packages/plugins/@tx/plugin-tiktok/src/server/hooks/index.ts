import { Plugin } from '@nocobase/server';
import { afterAccountCreateOrUpdate } from './account';
import { afterCreatePostingResourceRelease, calculateVideoDuration } from './postingResource';
import { afterOrganizationCreate } from './organization';

export const registerHooks = (props: { plugin: Plugin }) => {
  const { plugin } = props;
  const { app, db } = plugin;
  db.on('tk_account.beforeSave', afterAccountCreateOrUpdate({ db: db }));
  db.on('tk_posting_resource.beforeSave', calculateVideoDuration({ db: db }));
  db.on('tk_posting_resource_release.afterCreate', afterCreatePostingResourceRelease({ db: db }));

  afterOrganizationCreate(plugin);
};
