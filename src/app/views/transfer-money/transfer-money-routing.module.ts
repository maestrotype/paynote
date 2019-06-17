import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {TransferMoneyComponent} from './transfer-money.component';

const routes: Routes = [
  {
    path: '',
    component: TransferMoneyComponent,
    data: {
      title: 'Transactions'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransferMoneyRoutingModule {}
