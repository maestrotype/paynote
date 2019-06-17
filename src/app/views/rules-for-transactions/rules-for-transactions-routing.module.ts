import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {RulesForTransactionsComponent} from './rules-for-transactions.component';

const routes: Routes = [
  {
    path: '',
    component: RulesForTransactionsComponent,
    data: {
      title: 'Rules For Transactions'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RulesForTransactionsRoutingModule {}
