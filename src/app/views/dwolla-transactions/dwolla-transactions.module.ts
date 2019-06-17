import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DwollaTransactionsComponent } from './dwolla-transactions.component';
import { DwollaTransactionsRoutingModule } from './dwolla-transactions-routing.module';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    DwollaTransactionsRoutingModule
  ],
  declarations: [DwollaTransactionsComponent]
})
export class DwollaTransactionsModule { }
