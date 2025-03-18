import { Plugin } from '@nocobase/client';
import { registerPaymentComponent } from './Payment';
import { registerSignComponent } from './Signin';
import { registerInfluencerOverviewComponent } from './InfluencerOverview';
import { registerTestComponent } from './test';
import { registerTest2Component } from './test2';
import { registerInfluencerVideoOverviewComponent } from './InfluencerVideoOverview';
import { registerInfluencerLiveOverviewComponent } from './InfluencerLiveOverview';
import { registerInfluencerSalesOverviewComponent } from './InfluencerSalesOverview';
import { registerProductOverviewComponent } from './ProductOverview';
import { registerProductVideoOverviewComponent } from './ProductVideoOverview';
import { registerProductLiveOverviewComponent } from './ProductLiveOverview';

export const registerComponents = (props: { plugin: Plugin }) => {
  registerPaymentComponent(props);
  registerSignComponent(props);
  registerInfluencerOverviewComponent(props);
  registerInfluencerVideoOverviewComponent(props);
  registerInfluencerLiveOverviewComponent(props);
  registerInfluencerSalesOverviewComponent(props);
  registerProductOverviewComponent(props);
  registerProductVideoOverviewComponent(props);
  registerProductLiveOverviewComponent(props);
  registerTestComponent(props);
  registerTest2Component(props);
};
