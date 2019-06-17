import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmailLogComponent } from './email-log.component';

const routes: Routes = [
  {
    path: '',
    component: EmailLogComponent,
    data: {
      title: 'Email log template'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmailLogRoutingModule {}
