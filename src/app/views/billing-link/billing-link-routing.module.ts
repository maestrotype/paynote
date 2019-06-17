import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import {BillingLinkComponent} from './billing-link.component'

const routes: Routes = [
  {
    path: '',
    component: BillingLinkComponent,
    data: {
      title: 'Create Payment Link'
    }
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillingLinkRoutingModule { }
