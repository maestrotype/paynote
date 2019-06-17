import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FundingSourcesComponent } from './funding-sources.component';
import { FundingSourcesRoutingModule } from './funding-sources-routing.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TextMaskModule} from 'angular2-text-mask';
import {DirectivesModule} from '../../_shared_modules/directives/directives.module';

import { CurrencyMaskModule } from 'ng2-currency-mask';
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask/src/currency-mask.config';
import {MatCheckboxModule} from '@angular/material/checkbox';

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
    ReactiveFormsModule,
    FundingSourcesRoutingModule,
    TooltipModule,
    MatTooltipModule,
    TextMaskModule,
    CurrencyMaskModule,
    DirectivesModule,
    MatCheckboxModule
  ],
  declarations: [ FundingSourcesComponent ],
  exports: [FundingSourcesComponent],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ]
})
export class FundingSourcesModule { }
