import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {SendBatchComponent} from './send-batch.component';

const routes: Routes = [
  {
    path: '',
    component: SendBatchComponent,
    data: {
      title: 'Send Many Checks'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SendBatchRoutingModule {}
