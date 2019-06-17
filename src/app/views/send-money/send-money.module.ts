import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {SendMoneyComponent} from './send-money.component';
import {SendMoneyRoutingModule} from './send-money-routing.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {TransactionModule} from '../../_shared_modules/transaction/transaction.module';
import {PaymentLinksModule} from '../../_shared_modules/payment-links/payment-links.module';
import {RecurringModule} from '../../_shared_modules/recurring/recurring.module';
import {MatTooltipModule} from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import {DirectivesModule} from '../../_shared_modules/directives/directives.module';

import { CurrencyMaskModule } from 'ng2-currency-mask';
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask/src/currency-mask.config';

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
    FormsModule,
    CommonModule,
    SendMoneyRoutingModule,
    MatSlideToggleModule,
    TransactionModule,
    RecurringModule,
    MatTooltipModule,
    PaymentLinksModule,
    CurrencyMaskModule,
    NgSelectModule,
    DirectivesModule
  ],
  declarations: [SendMoneyComponent],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ]
})
export class SendMoneyModule { }
