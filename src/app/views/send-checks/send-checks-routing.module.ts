import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {SendChecksComponent} from './send-checks.component';

const routes: Routes = [
  {
    path: '',
    component: SendChecksComponent,
    data: {
      title: 'Transactions'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SendChecksRoutingModule {}
