import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {MerchantProfileComponent} from './merchant-profile.component';
import {MerchantProfileRoutingModule} from './merchant-profile-routing.module';
import { SettingsModule } from '../settings/settings.module';
import {MatTooltipModule} from '@angular/material/tooltip';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist';
import {BillingModule} from '../../_shared_modules/billing/billing.module';
import {FundingSourcesModule} from '../funding-sources/funding-sources.module';
import {SendChecksModule} from '../send-checks/send-checks.module';
import {FailedPaymentModule} from '../failed-payment/failed-payment.module';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
import {PhonePipe} from '../../_helpers/utility';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {ApiManageModule} from '../../_shared_modules/api-manage/api-manage.module';
import {DirectivesModule} from '../../_shared_modules/directives/directives.module';

@NgModule({
  imports: [
    CommonModule,
    MerchantProfileRoutingModule,
    FormsModule,
    SettingsModule,
    MatTooltipModule,
    PaginationModule,
    FundingSourcesModule,
    SendChecksModule,
    FailedPaymentModule,
    BillingModule,
    RoundProgressModule,
    MatCheckboxModule,
    ApiManageModule,
    DirectivesModule
  ],
  declarations: [ MerchantProfileComponent, PhonePipe ]
})
export class MerchantProfileModule { }
