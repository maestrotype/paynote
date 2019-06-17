import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InvoiceComponent} from '../../views/invoice/invoice.component';
import {InvoiceRoutingModule} from '../../views/invoice/invoice-routing.module';
//import {PaginationModule} from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import {FormsModule} from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    InvoiceRoutingModule,
    PaginationModule,
    FormsModule,
    MatTooltipModule
  ],
  declarations: [
    InvoiceComponent
  ],
  exports: [
    InvoiceComponent
  ]

})
export class InvoiceModule {}
