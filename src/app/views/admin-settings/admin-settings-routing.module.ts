import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminSettingsComponent } from './admin-settings.component';

const routes: Routes = [
  {
    path: '',
    component: AdminSettingsComponent,
    data: {
      title: 'Admin Settings template'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminSettingsRoutingModule {}
