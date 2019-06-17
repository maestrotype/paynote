import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {MerchantProfileComponent} from './merchant-profile.component';

const routes: Routes = [
  {
    path: '',
    component: MerchantProfileComponent,
    data: {
      title: 'Merchant Profile Detail'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchantProfileRoutingModule {}
