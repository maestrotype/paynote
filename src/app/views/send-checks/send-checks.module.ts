import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SendChecksRoutingModule} from './send-checks-routing.module';
import {SendChecksComponent} from './send-checks.component';
import { FormsModule } from '@angular/forms';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist';
import {TrendsModule} from '../../_shared_modules/trends/trends.module';
import {MatTooltipModule} from '@angular/material/tooltip';
import { DatepickerModule, BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    SendChecksRoutingModule,
    PaginationModule,
    TrendsModule,
    MatTooltipModule,
    BsDatepickerModule.forRoot(),
    DatepickerModule.forRoot()
  ],
  declarations: [SendChecksComponent],
  exports: [SendChecksComponent]
})
export class SendChecksModule { }
