import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { PaginationModule } from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import {PaymentLinksComponent} from '../../views/payment-links/payment-links.component';

@NgModule({
  imports: [
        CommonModule,
        PaginationModule,
        FormsModule
    ],
    declarations: [
        PaymentLinksComponent
    ],
    exports: [
        PaymentLinksComponent
    ]
})
export class PaymentLinksModule { }
