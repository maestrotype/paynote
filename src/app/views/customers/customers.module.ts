import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CustomersComponent } from './customers.component';
import { CustomersRoutingModule } from './customers-routing.module';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist';

import { CurrencyMaskModule } from 'ng2-currency-mask';
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask/src/currency-mask.config';
import {MatTooltipModule} from '@angular/material/tooltip';

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
    CustomersRoutingModule,
    PaginationModule,
    CurrencyMaskModule,
    MatTooltipModule
  ],
  declarations: [ CustomersComponent ],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ]
})
export class CustomersModule { }
