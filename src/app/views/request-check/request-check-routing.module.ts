import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {RequestCheckComponent} from './request-check.component';

const routes: Routes = [
  {
    path: '',
    component: RequestCheckComponent,
    data: {
      title: 'Request Check'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestCheckRoutingModule {}
