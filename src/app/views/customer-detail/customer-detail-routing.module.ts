import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {CustomerDetailComponent} from './customer-detail.component';

const routes: Routes = [
  {
    path: '',
    component: CustomerDetailComponent,
    data: {
      title: 'Merchant Detail'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerDetailRoutingModule {}
