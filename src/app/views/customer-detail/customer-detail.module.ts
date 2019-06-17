import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {CustomerDetailComponent} from './customer-detail.component';
import {CustomerDetailRoutingModule} from './customer-detail-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CustomerDetailRoutingModule
  ],
  declarations: [CustomerDetailComponent]
})
export class CustomerDetailModule { }
