import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {MultiplePhoneComponent} from './multiple-phone.component';

const routes: Routes = [
  {
    path: '',
    component: MultiplePhoneComponent,
    data: {
      title: 'Multiple Phone'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MultiplePhoneRoutingModule {}
