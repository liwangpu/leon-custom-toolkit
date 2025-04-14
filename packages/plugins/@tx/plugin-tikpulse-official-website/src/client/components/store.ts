import { APIClient } from '@nocobase/client';
import { action, flow, makeObservable, observable } from 'mobx';
import { isFunction, isNil } from 'lodash';
import { createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { IPackage } from '../../interface';

export class AppStore {
  public wechatServieQRCode: string;
  public hotline: string;
  public organizationId: number;
  public trialDays = 3;
  public trialModaShow = true;
  public packages: IPackage[];
  public services: IPackage[];
  public purchasedPackage: Map<string, { subAccount?: number }> = new Map();
  public loginIn: boolean;
  public handleOpenSignInForm: () => void;
  public handleOpenSignUpForm: () => void;
  public constructor(
    public props: {
      apiClient: APIClient;
      navigate: ReturnType<typeof useNavigate>;
      handleOpenSignInForm?: () => void;
      handleOpenSignUpForm?: () => void;
      loginIn?: boolean;
    },
  ) {
    makeObservable(this, {
      organizationId: observable,
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
      setOrganizationId: action,
      initialize: flow,
    });
    this.loginIn = props.loginIn;
    this.handleOpenSignInForm = props.handleOpenSignInForm;
    this.handleOpenSignUpForm = props.handleOpenSignUpForm;
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

  public setOrganizationId(organId: any) {
    if (isNil(organId)) {
      this.organizationId = organId;
    } else {
      this.organizationId = Number(organId);
    }
  }

  public openSignInForm() {
    if (!isFunction(this.handleOpenSignInForm)) return;
    this.handleOpenSignInForm();
  }

  public openSignUpForm() {
    if (!isFunction(this.handleOpenSignUpForm)) return;
    this.handleOpenSignUpForm();
  }
}

export const AppStoreContext = createContext<AppStore>(null);
