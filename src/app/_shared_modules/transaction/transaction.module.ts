import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { PaginationModule } from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import {TransactionsComponent} from '../../views/transactions/transactions.component';

@NgModule({
    imports: [
        CommonModule,
        PaginationModule,
        FormsModule
    ],
    declarations: [
        TransactionsComponent
    ],
    exports: [
        TransactionsComponent
    ]
})
export class TransactionModule {
}