import { APIClient } from '@nocobase/client';
import { action, flow, makeObservable, observable } from 'mobx';
import { isNil } from 'lodash';
import { createContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IPackage } from '../../interface';

export class AppStore {
  public wechatServieQRCode: string;
  public hotline: string;
  public trialDays = 3;
  public trialModaShow: boolean;
  public packages: IPackage[];
  public services: IPackage[];
  public purchasedPackage: Map<string, { subAccount?: number }> = new Map();
  public loginIn: boolean;
  public constructor(
    public props: { apiClient: APIClient; navigate: ReturnType<typeof useNavigate>; loginIn?: boolean },
  ) {
    makeObservable(this, {
      loginIn: observable,
      wechatServieQRCode: observable,
      hotline: observable,
      trialDays: observable,
      trialModaShow: observable,
      packages: observable,
      services: observable,
      purchasedPackage: observable,
      toggleTrialModa: action,
      setPurchasedPackage: action,
      requestDemoHandler: action,
      initialize: flow,
    });
    this.loginIn = props.loginIn;
  }

  public initialize = flow(function* (this: AppStore) {
    const { apiClient } = this.props;
    const requestBasic = async () => {
      const { data } = await apiClient.request({
        url: `officalWebsiteSetting:setting`,
      });

      if (!isNil(data)) {
        const { setting = {} } = data;
        // console.log(`setting:`, setting);
        this.wechatServieQRCode = setting.wechatServieQRCode;
        this.hotline = setting.hotline;
        this.trialDays = setting.trialDays;
      }
    };

    const requestPackageInfo = async () => {
      const { data } = await apiClient.request({
        url: `officalWebsiteSetting:packages`,
      });

      if (!isNil(data)) {
        const { packages, services } = data;
        this.packages = packages;
        this.services = services;
      }
    };
    try {
      yield Promise.all([requestBasic(), requestPackageInfo()]);
    } catch (error) {
      //
    }
  });

  public toggleTrialModa(show: boolean) {
    this.trialModaShow = show;
  }

  public setPurchasedPackage(initData: Record<string, { subAccount?: number }>) {
    this.purchasedPackage.clear();
    const packageIds = Object.keys(initData);
    for (const packageId of packageIds) {
      this.purchasedPackage.set(packageId, initData[packageId]);
    }
    console.log(`this.purchasedPackage:`, this.purchasedPackage);
  }

  public requestDemoHandler() {
    const scrollToView = () => {
      document.getElementById('request-demo-form').scrollIntoView({ block: 'center', behavior: 'smooth' });
    };
    const url: string = location.href;
    console.log(`url:`, url);
    let waitingTime = 0;
    if (!url.includes('/home/service')) {
      this.props.navigate('/home/service');
      waitingTime = 1000;
    }
    setTimeout(() => {
      scrollToView();
    }, waitingTime);
    //
  }
}

export const AppStoreContext = createContext<AppStore>(null);
