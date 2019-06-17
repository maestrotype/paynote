import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FundingSourcesComponent } from './funding-sources.component';

const routes: Routes = [
  {
    path: '',
    component: FundingSourcesComponent,
    data: {
      title: 'Funding sources template'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FundingSourcesRoutingModule {}
