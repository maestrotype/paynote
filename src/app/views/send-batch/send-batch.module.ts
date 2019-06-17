import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
//import { PaginationModule } from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import {SendBatchComponent} from './send-batch.component';
import {SendBatchRoutingModule} from './send-batch-routing.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatRadioModule} from '@angular/material/radio';
import {TransactionModule} from '../../_shared_modules/transaction/transaction.module';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    SendBatchRoutingModule,
    MatSlideToggleModule,
    MatRadioModule,
    PaginationModule,
    TransactionModule
  ],
  declarations: [ 
    SendBatchComponent
  ]
})
export class SendBatchModule { }
