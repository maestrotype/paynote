import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionComponent } from './subscription.component';
import { SubscriptionRoutingModule } from './subscription-routing.module';
//import { PaginationModule } from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import { FormsModule } from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTooltipModule} from '@angular/material/tooltip';
import {InvoiceModule} from '../../_shared_modules/invoice/invoice.module';

@NgModule({
  imports: [
    CommonModule,
    SubscriptionRoutingModule,
    PaginationModule,
    FormsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    InvoiceModule
  ],
  declarations: [SubscriptionComponent]
})
export class SubscriptionModule { }
