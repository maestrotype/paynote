import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ClientInvoicesRoutingModule} from './client-invoices-routing.module';
import {ClientInvoicesComponent} from './client-invoices.component';
import { FormsModule } from '@angular/forms';
//import { PaginationModule } from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';

@NgModule({
  imports: [
    CommonModule,
    ClientInvoicesRoutingModule,
    FormsModule,
    PaginationModule
    
  ],
  declarations: [ClientInvoicesComponent]
})
export class ClientInvoicesModule { }
