import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {FailedPaymentComponent} from './failed-payment.component';

const routes: Routes = [
  {
    path: '',
    component: FailedPaymentComponent,
    data: {
      title: 'Failed Payment'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FailedPaymentRoutingModule {}
