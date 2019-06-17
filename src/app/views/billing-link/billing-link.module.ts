import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {BillingLinkComponent} from './billing-link.component';
import { BillingLinkRoutingModule } from './billing-link-routing.module';

import {PaginationModule} from '../../ngx-pagination-bootstrap/dist';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask/src/currency-mask.config';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ImageCropperModule } from 'ngx-image-cropper';

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
    BillingLinkRoutingModule,
    PaginationModule,
    FormsModule,
    CurrencyMaskModule,
    ClipboardModule,
    MatCheckboxModule,
    ImageCropperModule,
    MatSlideToggleModule
  ],
  declarations: [BillingLinkComponent],
  providers: [
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }
  ]
})
export class BillingLinkModule { }
