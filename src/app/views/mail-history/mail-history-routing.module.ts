import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MailHistoryComponent } from './mail-history.component';

const routes: Routes = [
  {
    path: '',
    component: MailHistoryComponent,
    data: {
      title: 'Mail storage'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MailHistoryRoutingModule {}
