import { APIClient } from '@nocobase/client';
import { action, flow, makeObservable, observable } from 'mobx';
import { isNil } from 'lodash';

export class AppStore {
  public wechatServieQRCode: string;
  public hotline: string;
  public trialDays = 3;
  public trialModaShow: boolean;
  public constructor(public props: { apiClient: APIClient }) {
    makeObservable(this, {
      wechatServieQRCode: observable,
      hotline: observable,
      trialDays: observable,
      trialModaShow: observable,
      toggleTrialModa: action,
      initialize: flow,
    });
  }

  public initialize = flow(function* (this: AppStore) {
    try {
      const { apiClient } = this.props;
      const { data } = yield apiClient.request({
        url: `officalWebsiteSetting:setting`,
      });

      if (!isNil(data)) {
        const { setting = {} } = data;
        console.log(`setting:`, setting);
        this.wechatServieQRCode = setting.wechatServieQRCode;
        this.hotline = setting.hotline;
        this.trialDays = setting.trialDays;
      }
    } catch (error) {
      //
    }
  });

  public toggleTrialModa(show: boolean) {
    this.trialModaShow = show;
  }
}
