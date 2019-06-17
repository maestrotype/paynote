import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {ClientInvoicesComponent} from './client-invoices.component';

const routes: Routes = [
  {
    path: '',
    component: ClientInvoicesComponent,
    data: {
      title: 'Merchants'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientInvoicesRoutingModule {}
