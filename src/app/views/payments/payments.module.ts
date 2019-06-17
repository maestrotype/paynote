import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PaymentsRoutingModule} from './payments-routing.module';
import {PaymentsComponent} from './payments.component';
import { FormsModule } from '@angular/forms';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist';
import {TrendsModule} from '../../_shared_modules/trends/trends.module';
import {MatTooltipModule} from '@angular/material/tooltip';
import { DatepickerModule, BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    PaymentsRoutingModule,
    PaginationModule,
    TrendsModule,
    MatTooltipModule,
    BsDatepickerModule.forRoot(),
    DatepickerModule.forRoot()
  ],
  declarations: [PaymentsComponent],
  exports: [PaymentsComponent]
})
export class PaymentsModule { }
