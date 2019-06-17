import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WebhooksComponent } from './webhooks.component';

const routes: Routes = [
  {
    path: '',
    component: WebhooksComponent,
    data: {
      title: 'Webhooks template'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebhooksRoutingModule {}
