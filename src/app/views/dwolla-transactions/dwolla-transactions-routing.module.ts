import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {DwollaTransactionsComponent} from './dwolla-transactions.component';

const routes: Routes = [
  {
    path: '',
    component: DwollaTransactionsComponent,
    data: {
      title: 'Transactions'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DwollaTransactionsRoutingModule {}
