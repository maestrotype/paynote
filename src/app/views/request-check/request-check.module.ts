import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RequestCheckRoutingModule} from './request-check-routing.module';
import {RequestCheckComponent} from './request-check.component';
import { FormsModule } from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {TransactionModule} from '../../_shared_modules/transaction/transaction.module';
import {RecurringModule} from '../../_shared_modules/recurring/recurring.module';
import {MatTooltipModule} from '@angular/material/tooltip';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask/src/currency-mask.config';
import { NgSelectModule } from '@ng-select/ng-select';

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
    RequestCheckRoutingModule,
    MatSlideToggleModule,
    TransactionModule,
    RecurringModule,
    MatTooltipModule,
    PaginationModule,
    CurrencyMaskModule,
    NgSelectModule
  ],
  declarations: [RequestCheckComponent],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ]
})
export class RequestCheckModule { }
