import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {RulesForSignupComponent} from './rules-for-signup.component';

const routes: Routes = [
  {
    path: '',
    component: RulesForSignupComponent,
    data: {
      title: 'Rules For Sign Up'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RulesForSignupRoutingModule {}
