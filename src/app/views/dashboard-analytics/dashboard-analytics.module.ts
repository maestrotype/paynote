import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardAnalyticsComponent } from './dashboard-analytics.component';
import { DashboardAnalyticsRoutingModule } from './dashboard-analytics-routing.module';

import { CurrencyMaskModule } from 'ng2-currency-mask';
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask/src/currency-mask.config';
// import {PaynoteChartsModule} from '../../_shared_modules/charts/charts.module';
import {ChartsModule} from 'ng2-charts';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: 'left',
  allowNegative: false,
  decimal: '.',
  precision: 2,
  prefix: '$ ',
  suffix: '',
  thousands: ','
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DashboardAnalyticsRoutingModule,
    CurrencyMaskModule,
    NgxDaterangepickerMd.forRoot(),
    // PaynoteChartsModule,
    ChartsModule
  ],
  declarations: [DashboardAnalyticsComponent],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ]
})
export class DashboardAnalyticsModule { }
