import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BillingComponent } from './billing.component';

const routes: Routes = [
  {
    path: '',
    component: BillingComponent,
    data: {
      title: 'Billing template'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillingRoutingModule {}
