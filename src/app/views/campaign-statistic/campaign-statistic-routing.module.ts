import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
     
import {CampaignStatisticComponent} from './campaign-statistic.component';

const routes: Routes = [
  {
    path: '',
    component: CampaignStatisticComponent,
    data: {
      title: 'Campaign Statistics'
    }
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampaignStatisticRoutingModule { }
