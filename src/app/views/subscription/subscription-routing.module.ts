import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubscriptionComponent } from './subscription.component';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionComponent,
    data: {
      title: 'Subscription template'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionRoutingModule {}
