import { NgModule } from '@angular/core';
import { Routes,
     RouterModule } from '@angular/router';

import { InvitationsComponent } from './invitations.component';

const routes: Routes = [
  {
    path: '',
    component: InvitationsComponent,
    data: {
      title: 'Invitations'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvitationsRoutingModule {}
