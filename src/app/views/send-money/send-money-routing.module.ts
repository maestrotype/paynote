import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {SendMoneyComponent} from './send-money.component';

const routes: Routes = [
  {
    path: '',
    component: SendMoneyComponent,
    data: {
      title: 'Transactions'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SendMoneyRoutingModule {}
