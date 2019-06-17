import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {ManageRecuringComponent} from './manage-recuring.component';

const routes: Routes = [
  {
    path: '',
    component: ManageRecuringComponent,
    data: {
      title: 'Manage Recuring'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRecuringRoutingModule {}
