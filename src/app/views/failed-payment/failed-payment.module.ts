import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FailedPaymentRoutingModule} from './failed-payment-routing.module';
import {FailedPaymentComponent} from './failed-payment.component';
import { FormsModule } from '@angular/forms';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist';
import {TrendsModule} from '../../_shared_modules/trends/trends.module';
import {MatTooltipModule} from '@angular/material/tooltip';
import { DatepickerModule, BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    FailedPaymentRoutingModule,
    PaginationModule,
    TrendsModule,
    MatTooltipModule,
    BsDatepickerModule.forRoot(),
    DatepickerModule.forRoot()
  ],
  declarations: [FailedPaymentComponent],
  exports: [FailedPaymentComponent]
})
export class FailedPaymentModule { }
