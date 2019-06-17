import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BillingComponent} from '../../views/billing/billing.component';
import {BillingRoutingModule} from '../../views/billing/billing-routing.module';
//import { PaginationModule } from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import { FormsModule } from '@angular/forms';
import {TransactionModule} from '../../_shared_modules/transaction/transaction.module';

@NgModule({
  imports: [
    CommonModule,
    BillingRoutingModule,
    PaginationModule,
    FormsModule,
    TransactionModule
    
  ],
  declarations: [BillingComponent],
  exports: [
        BillingComponent
    ]
})
export class BillingModule { }