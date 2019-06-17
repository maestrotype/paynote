import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardAnalyticsComponent } from './dashboard-analytics.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardAnalyticsComponent,
    data: {
      title: 'Dashboard Analytics'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardAnalyticsRoutingModule { }
